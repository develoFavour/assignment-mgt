import { type NextRequest, NextResponse } from "next/server"
import {
  getAssignmentsCollection,
  getSubmissionsCollection,
  getGradesCollection,
  getCoursesCollection,
  getUsersCollection,
} from "@/lib/db"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const studentId = request.nextUrl.searchParams.get("studentId")

    if (!studentId) {
      return NextResponse.json({ error: "Student ID is required" }, { status: 400 })
    }

    const assignmentsCollection = await getAssignmentsCollection()
    const submissionsCollection = await getSubmissionsCollection()
    const gradesCollection = await getGradesCollection()
    const coursesCollection = await getCoursesCollection()
    const usersCollection = await getUsersCollection()

    const assignment = await assignmentsCollection.findOne({ _id: new ObjectId(id) })

    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 })
    }

    const submission = await submissionsCollection.findOne({
      assignment_id: new ObjectId(id),
      student_id: new ObjectId(studentId),
    })

    const grade = await gradesCollection.findOne({
      assignment_id: new ObjectId(id),
      student_id: new ObjectId(studentId),
    })

    const course = await coursesCollection.findOne({ _id: new ObjectId(assignment.course_id) })
    const lecturer = await usersCollection.findOne({ _id: new ObjectId(assignment.created_by) })

    return NextResponse.json({
      assignment: {
        ...assignment,
        course_code: course?.course_code,
        course_name: course?.course_name,
        lecturer_name: `${lecturer?.first_name} ${lecturer?.last_name}`,
        is_late_allowed: assignment.late_submission.accept_late,
        cutoff_days: assignment.late_submission.cutoff_days,
      },
      submission: submission || null,
      grade: grade || null,
    })
  } catch (error) {
    console.error("[v0] Fetch assignment error:", error)
    return NextResponse.json({ error: "Failed to fetch assignment" }, { status: 500 })
  }
}
