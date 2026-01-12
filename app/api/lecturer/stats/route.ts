import { type NextRequest, NextResponse } from "next/server";
import { getAssignmentsCollection, getSubmissionsCollection } from "@/lib/db";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
    try {
        const lecturerId = request.nextUrl.searchParams.get("lecturerId");

        if (!lecturerId) {
            return NextResponse.json(
                { error: "Lecturer ID is required" },
                { status: 400 }
            );
        }

        const assignmentsCollection = await getAssignmentsCollection();
        const submissionsCollection = await getSubmissionsCollection();

        // 1. Get all assignments created by this lecturer
        const assignments = await assignmentsCollection
            .find({ created_by: new ObjectId(lecturerId) })
            .toArray();

        const assignmentIds = assignments.map((a) => a._id);

        // 2. Get all submissions for these assignments
        const submissions = await submissionsCollection
            .find({ assignment_id: { $in: assignmentIds } })
            .toArray();

        // 3. Aggregate Stats
        const totalAssignments = assignments.length;
        const pendingSubmissions = submissions.filter(
            (s) => s.status === "submitted" || !s.grade // Assuming 'submitted' means not graded yet
        ).length;
        const completedSubmissions = submissions.filter(
            (s) => s.status === "graded" || s.grade // Assuming 'graded' or presence of grade
        ).length;

        return NextResponse.json({
            totalAssignments,
            pendingSubmissions,
            completedSubmissions,
        });
    } catch (error) {
        console.error("[lecturer/stats] GET error:", error);
        return NextResponse.json(
            { error: "Failed to fetch lecturer stats" },
            { status: 500 }
        );
    }
}
