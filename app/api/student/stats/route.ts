import { type NextRequest, NextResponse } from "next/server"
import { getSubmissionsCollection, getGradesCollection } from "@/lib/db"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const studentId = request.nextUrl.searchParams.get("studentId")

    const submissionsCollection = await getSubmissionsCollection()
    const gradesCollection = await getGradesCollection()

    const submissions = await submissionsCollection.find({ student_id: new ObjectId(studentId) }).toArray()

    const graded = await gradesCollection.countDocuments({ student_id: new ObjectId(studentId) })

    return NextResponse.json({
      active: 5, // Placeholder - calculate from assignments
      submitted: submissions.length,
      graded: graded,
    })
  } catch (error) {
    console.error("[v0] Fetch stats error:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
