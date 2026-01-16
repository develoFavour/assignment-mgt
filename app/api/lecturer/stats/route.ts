import { type NextRequest, NextResponse } from "next/server";
import { getAssignmentsCollection, getSubmissionsCollection, getUsersCollection, getCoursesCollection, getGradesCollection } from "@/lib/db";
import { ObjectId } from "mongodb";

// Safety helper for MongoDB IDs
const toObjectId = (id: any) => {
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
        const lecturerId = request.nextUrl.searchParams.get("lecturerId");

        if (!lecturerId) {
            return NextResponse.json(
                { error: "Lecturer ID is required" },
                { status: 400 }
            );
        }

        const coursesCollection = await getCoursesCollection();
        const assignmentsCollection = await getAssignmentsCollection();
        const submissionsCollection = await getSubmissionsCollection();
        const usersCollection = await getUsersCollection();
        const gradesCollection = await getGradesCollection();

        const lecturerObjectId = toObjectId(lecturerId);

        // 1. Get courses
        const courses = await coursesCollection.find({
            $or: [
                { lecturer_id: lecturerObjectId || undefined },
                { lecturer_id: lecturerId }
            ]
        }).toArray();
        const courseIds = courses.map(c => c._id);

        // 2. Get assignments
        const assignments = await assignmentsCollection.find({
            $or: [
                { course_id: { $in: courseIds } },
                { created_by: lecturerObjectId || undefined },
                { created_by: lecturerId }
            ]
        }).toArray();
        const assignmentIds = assignments.map((a) => a._id);

        // 3. Get all personal grades
        const personalGrades = await gradesCollection.find({
            $or: [
                { graded_by: lecturerObjectId || undefined },
                { graded_by: lecturerId }
            ]
        }).toArray();

        // 4. Get submissions
        const gradedSubmissionIds = personalGrades.map(g => toObjectId(g.submission_id)).filter(Boolean) as ObjectId[];

        const submissions = await submissionsCollection.find({
            $or: [
                { assignment_id: { $in: assignmentIds } },
                { _id: { $in: gradedSubmissionIds } }
            ]
        }).toArray();

        // 5. Aggregate logic with Virtual Submission support
        const gradedIdsInSubmissions = new Set(submissions.filter(s => s.status === "graded").map(s => s._id.toString()));
        const gradedIdsInGrades = new Set(personalGrades.map(g => g.submission_id.toString()));

        const allGradedSubmissionIds = new Set([
            ...Array.from(gradedIdsInSubmissions),
            ...Array.from(gradedIdsInGrades)
        ]);

        const completedSubmissionsCount = allGradedSubmissionIds.size;
        const pendingSubmissionsCount = submissions.filter(s => !allGradedSubmissionIds.has(s._id.toString())).length;
        const lateSubmissionsCount = submissions.filter(s => s.is_late).length;

        // 6. Recent Activity
        const recentSubmissions = await Promise.all(
            submissions
                .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())
                .slice(0, 5)
                .map(async (sub) => {
                    const studentId = toObjectId(sub.student_id);
                    const student = studentId ? await usersCollection.findOne({ _id: studentId }) : null;

                    const assignmentId = toObjectId(sub.assignment_id);
                    const assignment = assignments.find(a => a._id.toString() === sub.assignment_id.toString()) ||
                        (assignmentId ? await assignmentsCollection.findOne({ _id: assignmentId }) : null);

                    return {
                        _id: sub._id,
                        studentName: student ? `${student.first_name} ${student.last_name}` : "Unknown Student",
                        assignmentTitle: assignment?.title || "Unknown Assignment",
                        submittedAt: sub.submitted_at,
                        status: allGradedSubmissionIds.has(sub._id.toString()) ? "graded" : sub.status,
                    };
                })
        );

        return NextResponse.json({
            totalAssignments: assignments.length,
            pendingSubmissions: pendingSubmissionsCount,
            completedSubmissions: completedSubmissionsCount,
            lateSubmissions: lateSubmissionsCount,
            recentSubmissions,
        });
    } catch (error) {
        console.error("[lecturer/stats] GET error:", error);
        return NextResponse.json({ error: "Failed to fetch lecturer stats" }, { status: 500 });
    }
}
