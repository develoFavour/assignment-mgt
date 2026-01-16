import { type NextRequest, NextResponse } from "next/server"
import { getSubmissionsCollection, getGradesCollection, getAssignmentsCollection, getUsersCollection, getCoursesCollection } from "@/lib/db"
import { ObjectId } from "mongodb"
import { emailService } from "@/lib/email"
import { logEvent } from "@/lib/logger"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const { score, feedback } = await request.json()
    const lecturerId = request.nextUrl.searchParams.get("lecturerId")

    if (!lecturerId) {
      return NextResponse.json({ error: "Lecturer ID is required" }, { status: 400 })
    }

    const submissionsCollection = await getSubmissionsCollection()
    const gradesCollection = await getGradesCollection()
    const assignmentsCollection = await getAssignmentsCollection()
    const usersCollection = await getUsersCollection()
    const coursesCollection = await getCoursesCollection()

    // Get submission
    const submission = await submissionsCollection.findOne({
      _id: new ObjectId(id),
    })

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 })
    }

    // Get assignment for late submission penalty settings and total marks
    const assignment = await assignmentsCollection.findOne({
      _id: submission.assignment_id,
    })

    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 })
    }

    const totalMarks = assignment.total_marks || 100

    // Validate score against total marks
    if (score < 0 || score > totalMarks) {
      return NextResponse.json({ error: `Score must be between 0 and ${totalMarks}` }, { status: 400 })
    }

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
      submission_id: new ObjectId(id),
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
    await submissionsCollection.updateOne({ _id: new ObjectId(id) }, { $set: { status: "graded" } })

    // Send email notification to student
    try {
      const student = await usersCollection.findOne({ _id: new ObjectId(submission.student_id) })
      const course = await coursesCollection.findOne({ _id: new ObjectId(assignment.course_id) })

      if (student?.email && course) {
        await emailService.sendGradeNotificationEmail(
          student.email,
          assignment.title,
          `${course.course_code} - ${course.course_name}`,
          finalScore,
          totalMarks,
          feedback
        )
      }
    } catch (emailError) {
      console.error("[grade] Failed to send email notification:", emailError)
      // Don't fail the grading if email fails
    }

    // Log the grading event
    await logEvent({
      action: `Submission Graded: ${assignment.title} (Score: ${finalScore}/${totalMarks})`,
      user: "lecturer",
      level: "info",
    });

    return NextResponse.json({ success: true, grade, total_marks: totalMarks })
  } catch (error) {
    console.error("[v0] Grade submission error:", error)
    return NextResponse.json({ error: "Failed to grade submission" }, { status: 500 })
  }
}
