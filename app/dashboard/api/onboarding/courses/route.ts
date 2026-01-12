import { type NextRequest, NextResponse } from "next/server"
import { getCoursesCollection } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // Get student level from session/token - for MVP, we'll get it from query
    const studentLevel = request.nextUrl.searchParams.get("level") || "100"

    const coursesCollection = await getCoursesCollection()
    const courses = await coursesCollection.find({ level: { $lte: Number.parseInt(studentLevel) } }).toArray()

    return NextResponse.json({
      courses,
      studentLevel: Number.parseInt(studentLevel),
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 })
  }
}
