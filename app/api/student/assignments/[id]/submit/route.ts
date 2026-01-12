import { type NextRequest, NextResponse } from "next/server";
import { getSubmissionsCollection, getAssignmentsCollection } from "@/lib/db";
import { put } from "@vercel/blob";
import { ObjectId } from "mongodb";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const studentId = request.nextUrl.searchParams.get("studentId");

    if (!studentId || !ObjectId.isValid(studentId)) {
      return NextResponse.json({ error: "Valid Student ID is required" }, { status: 400 });
    }

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Valid Assignment ID is required" }, { status: 400 });
    }

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const submissionsCollection = await getSubmissionsCollection();
    const assignmentsCollection = await getAssignmentsCollection();

    const assignment = await assignmentsCollection.findOne({ _id: new ObjectId(id) });

    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    // Check if student already submitted
    const existingSubmission = await submissionsCollection.findOne({
      assignment_id: new ObjectId(id),
      student_id: new ObjectId(studentId),
    });

    if (existingSubmission) {
      return NextResponse.json({ error: "You have already submitted this assignment" }, { status: 400 });
    }

    const now = new Date();
    const deadline = new Date(assignment.deadline);
    const isLate = now > deadline;
    const hoursLate = isLate ? Math.floor((now.getTime() - deadline.getTime()) / (1000 * 60 * 60)) : 0;

    // Check late submission policy
    if (isLate && !assignment.late_submission.accept_late) {
      return NextResponse.json({ error: "Submission deadline has passed" }, { status: 400 });
    }

    const maxLateDays = assignment.late_submission.cutoff_days || 7;
    if (isLate && hoursLate > maxLateDays * 24) {
      return NextResponse.json(
        { error: `Submission window closed (${maxLateDays} days past deadline)` },
        { status: 400 },
      );
    }

    // Upload files to Vercel Blob
    const fileUrls: string[] = [];
    const uploadPath = `assignments/${id}/${studentId}`;

    for (const file of files) {
      try {
        const blob = await put(`${uploadPath}/${file.name}`, file, {
          access: "public", // Changed to public so they can be viewed/downloaded easily by lecturer
          // or keep private if using token-based access, but 'public' is easier for MVP
        });
        fileUrls.push(blob.url);
      } catch (uploadErr) {
        console.error(`[student/submissions] Failed to upload file ${file.name}:`, uploadErr);
        // If Vercel Blob is not configured, we might want to fail gracefully or Mock it?
        // For now returning error as requested by flow
        return NextResponse.json({ error: `Failed to upload file. Ensure Storage is configured.` }, { status: 500 });
      }
    }

    // Create submission record
    const submission = {
      assignment_id: new ObjectId(id),
      student_id: new ObjectId(studentId),
      file_urls: fileUrls,
      submitted_at: now,
      is_late: isLate,
      hours_late: hoursLate,
      status: "submitted",
    };

    const result = await submissionsCollection.insertOne(submission);

    return NextResponse.json({
      submission: { _id: result.insertedId, ...submission },
    });
  } catch (error) {
    console.error("[student/submissions] Submit assignment error:", error);
    return NextResponse.json({ error: "Failed to process submission" }, { status: 500 });
  }
}
