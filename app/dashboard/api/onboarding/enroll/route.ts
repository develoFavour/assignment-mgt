import { type NextRequest, NextResponse } from "next/server"
import { getStudentEnrollmentsCollection } from "@/lib/db"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    // Get student ID from session - for MVP we'll accept it from request
    const { courseIds } = await request.json()
    const studentId = request.nextUrl.searchParams.get("studentId")

    if (!studentId || !courseIds || courseIds.length === 0) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    const enrollmentsCollection = await getStudentEnrollmentsCollection()

    const enrollments = courseIds.map((courseId: string) => ({
      student_id: new ObjectId(studentId),
      course_id: new ObjectId(courseId),
      enrolled_at: new Date(),
      is_active: true,
    }))

    await enrollmentsCollection.insertMany(enrollments)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Enrollment error:", error)
    return NextResponse.json({ error: "Failed to enroll in courses" }, { status: 500 })
  }
}
