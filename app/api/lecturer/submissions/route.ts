import { type NextRequest, NextResponse } from "next/server"
import { getSubmissionsCollection, getAssignmentsCollection, getUsersCollection, getCoursesCollection, getGradesCollection } from "@/lib/db"
import { ObjectId } from "mongodb"

// Safety helper for MongoDB IDs
const toObjectId = (id: any): ObjectId | null => {
  if (!id) return null;
  if (id instanceof ObjectId) return id;
  try {
    return new ObjectId(id);
  } catch (e) {
    return null;
  }
};

export async function GET(request: NextRequest) {
  try {
    const lecturerId = request.nextUrl.searchParams.get("lecturerId")

    if (!lecturerId) {
      return NextResponse.json({ error: "Lecturer ID is required" }, { status: 400 })
    }
    const status = request.nextUrl.searchParams.get("status") || "pending"

    const coursesCollection = await getCoursesCollection()
    const submissionsCollection = await getSubmissionsCollection()
    const assignmentsCollection = await getAssignmentsCollection()
    const usersCollection = await getUsersCollection()
    const gradesCollection = await getGradesCollection()

    const lecturerObjectId = toObjectId(lecturerId)

    // 1. Get all courses lead by this lecturer (handle both formats)
    const courses = await coursesCollection.find({
      $or: [
        { lecturer_id: lecturerObjectId || undefined },
        { lecturer_id: lecturerId }
      ]
    }).toArray()
    const courseIds = courses.map(c => c._id)

    // 2. Get all assignments linked to these courses OR created by this lecturer
    const assignments = await assignmentsCollection.find({
      $or: [
        { course_id: { $in: courseIds } },
        { created_by: lecturerObjectId || undefined },
        { created_by: lecturerId }
      ]
    }).toArray()
    const assignmentIds = assignments.map(a => a._id)

    // 3. Get all grade records issued by this lecturer (Direct source of truth)
    const personalGrades = await gradesCollection.find({
      $or: [
        { graded_by: lecturerObjectId || undefined },
        { graded_by: lecturerId }
      ]
    }).toArray()

    // Extract everything we can from the grades
    const gradedAssignmentIds = personalGrades.map(g => toObjectId(g.assignment_id)).filter(Boolean) as ObjectId[]
    const gradedSubmissionIds = personalGrades.map(g => toObjectId(g.submission_id)).filter(Boolean) as ObjectId[]

    // 4. Build the master submission query
    const allRelevantAssignmentIds = [...new Set([...assignmentIds, ...gradedAssignmentIds])]

    const submissionQuery: any = {
      $or: [
        { assignment_id: { $in: allRelevantAssignmentIds } },
        { _id: { $in: gradedSubmissionIds } }
      ]
    };

    const submissions = await submissionsCollection.find(submissionQuery).toArray()

    // 5. ENRICHMENT & VIRTUAL SUBMISSION HANDLING
    const enriched = await Promise.all(
      submissions.map(async (submission) => {
        const assignmentId = toObjectId(submission.assignment_id);
        const assignment = assignments.find(a => a._id.toString() === submission.assignment_id.toString()) ||
          (assignmentId ? await assignmentsCollection.findOne({ _id: assignmentId }) : null);

        const studentId = toObjectId(submission.student_id);
        const student = studentId ? await usersCollection.findOne({ _id: studentId }) : null;

        const grade = personalGrades.find(g => g.submission_id.toString() === submission._id.toString());

        return {
          ...submission,
          status: grade ? "graded" : (submission.status || "pending"),
          student_name: student ? `${student.first_name} ${student.last_name}` : "Unknown Student",
          assignment_title: assignment?.title || "Unknown Assignment",
          total_marks: assignment?.total_marks || 100,
          submitted_at: submission.submitted_at || new Date(),
          grade_data: grade ? {
            score: grade.score,
            final_score: grade.final_score,
            feedback: grade.feedback,
            graded_at: grade.graded_at,
            penalty_applied: grade.penalty_applied
          } : null
        };
      })
    );

    // 6. ADD VIRTUAL SUBMISSIONS FOR ORPHANED GRADES
    const missingSubmissionGrades = personalGrades.filter(
      grade => !enriched.some(sub => sub._id.toString() === grade.submission_id.toString())
    );

    const virtualEntries = await Promise.all(
      missingSubmissionGrades.map(async (grade) => {
        const assignmentId = toObjectId(grade.assignment_id);
        const assignment = assignments.find(a => a._id.toString() === grade.assignment_id.toString()) ||
          (assignmentId ? await assignmentsCollection.findOne({ _id: assignmentId }) : null);

        const studentId = toObjectId(grade.student_id);
        const student = studentId ? await usersCollection.findOne({ _id: studentId }) : null;

        return {
          _id: grade.submission_id,
          assignment_id: grade.assignment_id,
          student_id: grade.student_id,
          status: "graded",
          submitted_at: grade.graded_at,
          is_late: (grade.penalty_applied || 0) > 0,
          hours_late: (grade.penalty_applied || 0) > 0 ? 24 : 0,
          file_urls: [],
          student_name: student ? `${student.first_name} ${student.last_name}` : "Student (Record Missing)",
          assignment_title: assignment?.title || "Assignment (Record Missing)",
          total_marks: assignment?.total_marks || 100,
          grade_data: {
            score: grade.score,
            final_score: grade.final_score,
            feedback: grade.feedback,
            graded_at: grade.graded_at,
            penalty_applied: grade.penalty_applied
          }
        };
      })
    );

    const allEntries = [...enriched, ...virtualEntries];

    // 7. Final Filter & Sort
    let finalResult = allEntries;
    if (status === "pending") {
      finalResult = allEntries.filter(sub => sub.status === "submitted" || sub.status === "pending")
    } else if (status === "graded") {
      finalResult = allEntries.filter(sub => sub.status === "graded")
    }

    finalResult.sort((a, b) => {
      const timeA = a.grade_data ? new Date(a.grade_data.graded_at).getTime() : new Date((a as any).submitted_at).getTime();
      const timeB = b.grade_data ? new Date(b.grade_data.graded_at).getTime() : new Date((b as any).submitted_at).getTime();
      return timeB - timeA;
    });

    return NextResponse.json(finalResult)
  } catch (error) {
    console.error("[lecturer/submissions] Fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 })
  }
}
