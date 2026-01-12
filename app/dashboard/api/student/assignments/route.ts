import { type NextRequest, NextResponse } from "next/server"
import {
  getStudentEnrollmentsCollection,
  getAssignmentsCollection,
  getSubmissionsCollection,
  getGradesCollection,
  getCoursesCollection,
} from "@/lib/db"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const studentId = request.nextUrl.searchParams.get("studentId")
    const filter = request.nextUrl.searchParams.get("filter") || "all"

    const enrollmentsCollection = await getStudentEnrollmentsCollection()
    const assignmentsCollection = await getAssignmentsCollection()
    const submissionsCollection = await getSubmissionsCollection()
    const gradesCollection = await getGradesCollection()
    const coursesCollection = await getCoursesCollection()

    // Get enrolled courses
    const enrollments = await enrollmentsCollection.find({ student_id: new ObjectId(studentId) }).toArray()

    const courseIds = enrollments.map((e) => new ObjectId(e.course_id))

    // Get assignments for these courses
    const assignments = await assignmentsCollection.find({ course_id: { $in: courseIds } }).toArray()

    // Enrich with submission and grade info
    let enriched = await Promise.all(
      assignments.map(async (assignment) => {
        const submission = await submissionsCollection.findOne({
          assignment_id: assignment._id,
          student_id: new ObjectId(studentId),
        })

        const grade = await gradesCollection.findOne({
          assignment_id: assignment._id,
          student_id: new ObjectId(studentId),
        })

        const course = await coursesCollection.findOne({ _id: new ObjectId(assignment.course_id) })

        return {
          _id: assignment._id,
          title: assignment.title,
          description: assignment.description,
          deadline: assignment.deadline,
          course_code: course?.course_code,
          course_name: course?.course_name,
          is_submitted: !!submission,
          is_graded: !!grade,
          grade: grade?.final_score,
          is_late: submission?.is_late,
          hours_late: submission?.hours_late,
        }
      }),
    )

    // Apply filter
    if (filter === "pending") {
      enriched = enriched.filter((a) => !a.is_submitted)
    } else if (filter === "submitted") {
      enriched = enriched.filter((a) => a.is_submitted && !a.is_graded)
    } else if (filter === "graded") {
      enriched = enriched.filter((a) => a.is_graded)
    }

    return NextResponse.json(enriched)
  } catch (error) {
    console.error("[v0] Fetch assignments error:", error)
    return NextResponse.json({ error: "Failed to fetch assignments" }, { status: 500 })
  }
}
