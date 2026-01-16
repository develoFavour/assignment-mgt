import { type NextRequest, NextResponse } from "next/server";
import { getAssignmentsCollection } from "@/lib/db";
import { ObjectId } from "mongodb";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Valid Assignment ID is required" }, { status: 400 });
    }

    const assignmentsCollection = await getAssignmentsCollection();
    const assignment = await assignmentsCollection.findOne({ _id: new ObjectId(id) });

    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    return NextResponse.json(assignment);
  } catch (error) {
    console.error("[lecturer/assignments] GET error:", error);
    return NextResponse.json({ error: "Failed to fetch assignment" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Assignment ID is required" }, { status: 400 });
    }

    const assignmentsCollection = await getAssignmentsCollection();
    await assignmentsCollection.deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: true, message: "Assignment successfully removed" });
  } catch (error) {
    console.error("[lecturer/assignments] DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete assignment" }, { status: 500 });
  }
}
