import { type NextRequest, NextResponse } from "next/server"
import { getSubmissionsCollection, getGradesCollection, getAssignmentsCollection } from "@/lib/db"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { score, feedback } = await request.json()
    const lecturerId = request.nextUrl.searchParams.get("lecturerId")

    if (score < 0 || score > 100) {
      return NextResponse.json({ error: "Score must be between 0 and 100" }, { status: 400 })
    }

    const submissionsCollection = await getSubmissionsCollection()
    const gradesCollection = await getGradesCollection()
    const assignmentsCollection = await getAssignmentsCollection()

    // Get submission
    const submission = await submissionsCollection.findOne({
      _id: new ObjectId(params.id),
    })

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 })
    }

    // Get assignment for late submission penalty settings
    const assignment = await assignmentsCollection.findOne({
      _id: submission.assignment_id,
    })

    // Calculate final score with penalty if late
    let finalScore = score
    let penaltyApplied = 0

    if (submission.is_late && submission.hours_late > 0 && assignment?.late_submission.accept_late) {
      const daysLate = Math.ceil(submission.hours_late / 24)
      const penaltyPercentPerDay = assignment.late_submission.penalty_percent
      penaltyApplied = daysLate * penaltyPercentPerDay

      // Cap penalty so score doesn't go below 0
      finalScore = Math.max(0, score - penaltyApplied)
    }

    // Create grade record
    const grade = {
      submission_id: new ObjectId(params.id),
      assignment_id: submission.assignment_id,
      student_id: submission.student_id,
      score,
      feedback: feedback || null,
      graded_by: new ObjectId(lecturerId),
      penalty_applied: penaltyApplied,
      final_score: finalScore,
      graded_at: new Date(),
    }

    await gradesCollection.insertOne(grade)

    // Update submission status
    await submissionsCollection.updateOne({ _id: new ObjectId(params.id) }, { $set: { status: "graded" } })

    return NextResponse.json({ success: true, grade })
  } catch (error) {
    console.error("[v0] Grade submission error:", error)
    return NextResponse.json({ error: "Failed to grade submission" }, { status: 500 })
  }
}
