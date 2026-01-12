import { type NextRequest, NextResponse } from "next/server"
import { getSubmissionsCollection, getAssignmentsCollection, getUsersCollection } from "@/lib/db"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const lecturerId = request.nextUrl.searchParams.get("lecturerId")

    if (!lecturerId) {
      return NextResponse.json({ error: "Lecturer ID is required" }, { status: 400 })
    }
    const status = request.nextUrl.searchParams.get("status") || "pending"

    const submissionsCollection = await getSubmissionsCollection()
    const assignmentsCollection = await getAssignmentsCollection()
    const usersCollection = await getUsersCollection()

    // Get assignments by this lecturer
    const lecturerAssignments = await assignmentsCollection.find({ created_by: new ObjectId(lecturerId) }).toArray()

    const assignmentIds = lecturerAssignments.map((a) => a._id)

    // Get submissions for these assignments
    const submissions = await submissionsCollection
      .find({
        assignment_id: { $in: assignmentIds },
        status: status,
      })
      .toArray()

    // Enrich with student and assignment info
    const enriched = await Promise.all(
      submissions.map(async (submission) => {
        const student = await usersCollection.findOne({ _id: new ObjectId(submission.student_id) })
        const assignment = lecturerAssignments.find((a) => a._id.toString() === submission.assignment_id.toString())

        return {
          ...submission,
          student_name: `${student?.first_name} ${student?.last_name}`,
          assignment_title: assignment?.title,
        }
      }),
    )

    return NextResponse.json(enriched)
  } catch (error) {
    console.error("[v0] Fetch submissions error:", error)
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 })
  }
}
