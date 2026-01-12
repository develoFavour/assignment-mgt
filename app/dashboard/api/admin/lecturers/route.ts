import { type NextRequest, NextResponse } from "next/server"
import { getUsersCollection } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const usersCollection = await getUsersCollection()
    const lecturers = await usersCollection.find({ role: "lecturer" }).project({ password_hash: 0 }).toArray()

    return NextResponse.json(lecturers)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch lecturers" }, { status: 500 })
  }
}
