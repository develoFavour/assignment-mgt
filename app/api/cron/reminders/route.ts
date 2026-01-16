import { NextRequest, NextResponse } from "next/server";
import {
    getAssignmentsCollection,
    getStudentEnrollmentsCollection,
    getSubmissionsCollection,
    getUsersCollection,
    getCoursesCollection
} from "@/lib/db";
import { emailService } from "@/lib/email";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
    // Security check: Verify a cron secret if provided in environment
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const assignmentsCollection = await getAssignmentsCollection();
        const enrollmentsCollection = await getStudentEnrollmentsCollection();
        const submissionsCollection = await getSubmissionsCollection();
        const usersCollection = await getUsersCollection();
        const coursesCollection = await getCoursesCollection();

        // Define the window for "approaching deadline" (e.g., due in next 24 hours)
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        // Find assignments due between now and tomorrow
        const upcomingAssignments = await assignmentsCollection.find({
            deadline: {
                $gt: now,
                $lt: tomorrow
            }
        }).toArray();

        if (upcomingAssignments.length === 0) {
            return NextResponse.json({ message: "No upcoming deadlines in the next 24 hours" });
        }

        const report = [];

        for (const assignment of upcomingAssignments) {
            // 1. Find all students enrolled in the course
            const enrollments = await enrollmentsCollection.find({
                course_id: assignment.course_id
            }).toArray();

            const enrolledStudentIds = enrollments.map(e => e.student_id);

            // 2. Find students who have already submitted
            const submissions = await submissionsCollection.find({
                assignment_id: assignment._id,
                student_id: { $in: enrolledStudentIds }
            }).toArray();

            const submittedStudentIds = new Set(submissions.map(s => s.student_id.toString()));

            // 3. Identify students who haven't submitted
            const pendingStudentIds = enrolledStudentIds.filter(id => !submittedStudentIds.has(id.toString()));

            if (pendingStudentIds.length > 0) {
                // Fetch their emails
                const pendingStudents = await usersCollection.find({
                    _id: { $in: pendingStudentIds }
                }).toArray();

                const emails = pendingStudents.map(s => s.email).filter(Boolean);
                const course = await coursesCollection.findOne({ _id: assignment.course_id });

                if (emails.length > 0 && course) {
                    const hoursRemaining = Math.max(1, Math.round((new Date(assignment.deadline).getTime() - now.getTime()) / (1000 * 60 * 60)));

                    await emailService.sendDeadlineReminderEmail(
                        emails,
                        `${course.course_code}: ${course.course_name}`,
                        assignment.title,
                        new Date(assignment.deadline).toLocaleString(),
                        hoursRemaining
                    );

                    report.push({
                        assignment: assignment.title,
                        remindedCount: emails.length
                    });
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: "Reminder job completed",
            details: report
        });

    } catch (error) {
        console.error("[CRON] Reminder Error:", error);
        return NextResponse.json({ error: "Failed to process reminders" }, { status: 500 });
    }
}
