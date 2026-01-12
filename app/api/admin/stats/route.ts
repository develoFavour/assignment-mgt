import { type NextRequest, NextResponse } from "next/server";
import { getUsersCollection, getCoursesCollection, getAssignmentsCollection } from "@/lib/db";

export async function GET(request: NextRequest) {
    try {
        const [usersCol, coursesCol, assignmentsCol] = await Promise.all([
            getUsersCollection(),
            getCoursesCollection(),
            getAssignmentsCollection(),
        ]);

        const [totalUsers, totalCourses, totalAssignments] = await Promise.all([
            usersCol.countDocuments({}),
            coursesCol.countDocuments({}),
            assignmentsCol.countDocuments({}),
        ]);

        // In a real app, we'd calculate changes by comparing with previous month
        // For now, we'll return the hardcoded percentages from your design but dynamic totals
        return NextResponse.json({
            totalUsers,
            totalCourses,
            totalAssignments,
            trends: {
                users: "+4.5%",
                courses: "+2.1%",
                assignments: "+12.3%"
            }
        });
    } catch (error) {
        console.error("[admin/stats] GET error:", error);
        return NextResponse.json({ error: "Failed to aggregate system metrics" }, { status: 500 });
    }
}
