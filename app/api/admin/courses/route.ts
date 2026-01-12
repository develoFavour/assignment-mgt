import { type NextRequest, NextResponse } from "next/server"
import { getCoursesCollection, getUsersCollection } from "@/lib/db"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const coursesCollection = await getCoursesCollection()
    const usersCollection = await getUsersCollection()

    const courses = await coursesCollection.find({}).toArray()

    // Enrich with lecturer names
    const enriched = await Promise.all(
      courses.map(async (course) => {
        const lecturer = await usersCollection.findOne({
          _id: new ObjectId(course.lecturer_id),
        })
        return {
          ...course,
          lecturer_name: lecturer ? `${lecturer.first_name} ${lecturer.last_name}` : "Unknown",
        }
      }),
    )

    return NextResponse.json(enriched)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { course_code, course_name, level, lecturer_id, semester } = await request.json()

    const coursesCollection = await getCoursesCollection()

    // Check if course already exists
    const existing = await coursesCollection.findOne({ course_code: course_code.toUpperCase() })
    if (existing) {
      return NextResponse.json({ error: "Course with this code already exists" }, { status: 400 })
    }

    const course = {
      course_code: course_code.toUpperCase(),
      course_name,
      level,
      lecturer_id: new ObjectId(lecturer_id),
      semester,
      created_at: new Date(),
    }

    const result = await coursesCollection.insertOne(course)

    return NextResponse.json({
      course: { _id: result.insertedId, ...course },
    })
  } catch (error) {
    console.error("[v0] Add course error:", error)
    return NextResponse.json({ error: "Failed to add course" }, { status: 500 })
  }
}
