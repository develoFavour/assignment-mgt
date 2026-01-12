import { type NextRequest, NextResponse } from "next/server"
import { getUsersCollection } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const usersCollection = await getUsersCollection()
    const users = await usersCollection
      .find({ role: { $in: ["student", "lecturer"] } })
      .project({ password_hash: 0 })
      .toArray()

    return NextResponse.json({ users })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, role, first_name, last_name, matric_number, level } = await request.json()

    const usersCollection = await getUsersCollection()

    // Check if user already exists
    const existing = await usersCollection.findOne({ email: email.toLowerCase() })
    if (existing) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }

    const user = {
      role,
      email: email.toLowerCase(),
      matric_number: role === "student" ? matric_number : undefined,
      lecturer_number: role === "lecturer" ? matric_number : undefined,
      first_name,
      last_name,
      level: role === "student" ? level : undefined,
      isPasswordSet: false,
      created_at: new Date(),
    }

    const result = await usersCollection.insertOne(user)

    return NextResponse.json({
      user: { _id: result.insertedId, ...user },
    })
  } catch (error) {
    console.error("[v0] Add user error:", error)
    return NextResponse.json({ error: "Failed to add user" }, { status: 500 })
  }
}
