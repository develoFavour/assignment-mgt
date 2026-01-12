import { type NextRequest, NextResponse } from "next/server";
import { getCoursesCollection } from "@/lib/db";
import { ObjectId } from "mongodb";

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json({ error: "Course ID is required" }, { status: 400 });
        }

        const coursesCollection = await getCoursesCollection();
        const result = await coursesCollection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return NextResponse.json({ error: "Course not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Course successfully removed" });
    } catch (error) {
        console.error("[admin/courses] DELETE error:", error);
        return NextResponse.json(
            { error: "Internal server error during deletion" },
            { status: 500 }
        );
    }
}
