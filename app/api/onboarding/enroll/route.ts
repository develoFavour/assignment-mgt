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

    const studentObjectId = new ObjectId(studentId);
    const requestedCourseObjectIds = courseIds.map((id: string) => new ObjectId(id));

    // 1. Check for existing enrollments to prevent duplicates
    const existingEnrollments = await enrollmentsCollection.find({
      student_id: studentObjectId,
      course_id: { $in: requestedCourseObjectIds }
    }).toArray();

    const existingCourseIds = new Set(existingEnrollments.map(e => e.course_id.toString()));

    // 2. Filter out already enrolled courses
    const newCourseIds = requestedCourseObjectIds.filter((id: ObjectId) => !existingCourseIds.has(id.toString()));

    if (newCourseIds.length === 0) {
      return NextResponse.json(
        { error: "You are already enrolled in all selected courses" },
        { status: 400 }
      );
    }

    // 3. Insert only new enrollments
    const enrollments = newCourseIds.map((courseId: ObjectId) => ({
      student_id: studentObjectId,
      course_id: courseId,
      enrolled_at: new Date(),
      is_active: true,
    }))

    await enrollmentsCollection.insertMany(enrollments)

    return NextResponse.json({
      success: true,
      message: `Successfully enrolled in ${newCourseIds.length} course(s)`
    })
  } catch (error) {
    console.error("[v0] Enrollment error:", error)
    return NextResponse.json({ error: "Failed to enroll in courses" }, { status: 500 })
  }
}
