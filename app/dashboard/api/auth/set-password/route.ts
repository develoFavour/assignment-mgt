import { type NextRequest, NextResponse } from "next/server"
import { getUsersCollection } from "@/lib/db"
import { hashPassword, isStrongPassword } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (!password || !isStrongPassword(password)) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    // Get user ID from session - for MVP we'll use a param
    const userId = request.nextUrl.searchParams.get("userId")
    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 400 })
    }

    const usersCollection = await getUsersCollection()
    const passwordHash = await hashPassword(password)

    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { password_hash: passwordHash, isPasswordSet: true } },
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Set password error:", error)
    return NextResponse.json({ error: "Failed to set password" }, { status: 500 })
  }
}
