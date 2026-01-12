import { type NextRequest, NextResponse } from "next/server"
import { getCoursesCollection } from "@/lib/db"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const lecturerId = request.nextUrl.searchParams.get("lecturerId")

    if (!lecturerId) {
      return NextResponse.json({ error: "Lecturer ID is required" }, { status: 400 })
    }

    const coursesCollection = await getCoursesCollection()
    const courses = await coursesCollection.find({ lecturer_id: new ObjectId(lecturerId) }).toArray()

    return NextResponse.json(courses)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 })
  }
}
