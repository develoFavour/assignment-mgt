import { type NextRequest, NextResponse } from "next/server";
import { getAssignmentsCollection, getCoursesCollection, getStudentEnrollmentsCollection, getUsersCollection } from "@/lib/db";
import { ObjectId } from "mongodb";
import { emailService } from "@/lib/email";
import { logEvent } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const assignmentsCollection = await getAssignmentsCollection();
    const coursesCollection = await getCoursesCollection();

    // Get assignments created by this lecturer
    const lecturerId = request.nextUrl.searchParams.get("lecturerId");

    // If lecturerId is missing, return error or empty array? Returning error seems safer
    if (!lecturerId) {
      return NextResponse.json({ error: "Lecturer ID is required" }, { status: 400 });
    }

    const assignments = await assignmentsCollection
      .find({ created_by: new ObjectId(lecturerId) })
      .toArray();

    // Enrich with course info
    const enriched = await Promise.all(
      assignments.map(async (assignment) => {
        const course = await coursesCollection.findOne({
          _id: new ObjectId(assignment.course_id),
        });
        return {
          ...assignment,
          course_code: course?.course_code,
        };
      })
    );

    return NextResponse.json(enriched);
  } catch (error) {
    console.error("[lecturer/assignments] Fetch assignments error:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      course_id,
      title,
      description,
      deadline,
      total_marks,
      accept_late,
      cutoff_days,
      penalty_percent,
    } = await request.json();

    const lecturerId = request.nextUrl.searchParams.get("lecturerId");

    if (!lecturerId) {
      return NextResponse.json({ error: "Lecturer ID is required" }, { status: 400 });
    }

    const assignmentsCollection = await getAssignmentsCollection();
    const coursesCollection = await getCoursesCollection();
    const enrollmentsCollection = await getStudentEnrollmentsCollection();
    const usersCollection = await getUsersCollection();

    const assignment = {
      course_id: new ObjectId(course_id),
      title,
      description,
      deadline: new Date(deadline),
      total_marks: total_marks || 100,
      created_by: new ObjectId(lecturerId),
      late_submission: {
        accept_late,
        cutoff_days,
        penalty_percent,
      },
      created_at: new Date(),
    };

    const result = await assignmentsCollection.insertOne(assignment);

    // --- Email Notification Logic ---
    // 1. Get Course Details (for course name/code)
    const course = await coursesCollection.findOne({ _id: new ObjectId(course_id) });
    const courseName = course ? `${course.course_code} - ${course.course_name}` : "Course Assignment";

    // 2. Get Enrolled Students
    const enrollments = await enrollmentsCollection.find({ course_id: new ObjectId(course_id) }).toArray();

    if (enrollments.length > 0) {
      const studentIds = enrollments.map(e => e.student_id);

      // 3. Get Student Emails
      const students = await usersCollection.find({ _id: { $in: studentIds } }).toArray();
      const studentEmails = students.map(s => s.email).filter(Boolean); // Ensure valid emails

      // 4. Send Bulk Notification
      // We fire and forget this promise to not delay response
      emailService.sendNewAssignmentEmail(
        studentEmails,
        courseName,
        title,
        new Date(deadline).toLocaleString()
      ).catch(err => console.error("Email dispatch failed:", err));
    }
    // ---------------------------------

    // Log the event
    await logEvent({
      action: `New Assignment: "${title}" created for ${courseName}`,
      user: "lecturer",
      level: "success",
    });

    return NextResponse.json({
      assignment: { _id: result.insertedId, ...assignment },
    });
  } catch (error) {
    console.error("[lecturer/assignments] Create assignment error:", error);
    return NextResponse.json(
      { error: "Failed to create assignment" },
      { status: 500 }
    );
  }
}
