import { type NextRequest, NextResponse } from "next/server";
import { getMaterialsCollection } from "@/lib/db";
import { ObjectId } from "mongodb";

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (!id || !ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid Material ID" }, { status: 400 });
        }

        const materialsCollection = await getMaterialsCollection();
        await materialsCollection.deleteOne({ _id: new ObjectId(id) });

        return NextResponse.json({ success: true, message: "Material deleted" });
    } catch (error) {
        console.error("[lecturer/materials/id] DELETE error:", error);
        return NextResponse.json({ error: "Failed to delete material" }, { status: 500 });
    }
}
