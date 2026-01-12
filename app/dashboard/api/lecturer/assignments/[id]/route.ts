import { type NextRequest, NextResponse } from "next/server"
import { getAssignmentsCollection } from "@/lib/db"
import { ObjectId } from "mongodb"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const assignmentsCollection = await getAssignmentsCollection()
    await assignmentsCollection.deleteOne({ _id: new ObjectId(params.id) })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete assignment" }, { status: 500 })
  }
}
