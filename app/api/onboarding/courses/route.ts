import { type NextRequest, NextResponse } from "next/server";
import { getCoursesCollection } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // We still accept the student level for the UI to know what to "recommend"
    const studentLevel = request.nextUrl.searchParams.get("level") || "100";

    const coursesCollection = await getCoursesCollection();
    // Return all courses for the scalable explorer
    const courses = await coursesCollection.find({}).sort({ course_code: 1 }).toArray();

    return NextResponse.json({
      courses,
      studentLevel: Number.parseInt(studentLevel),
    });
  } catch (error) {
    console.error("[onboarding/courses] error:", error);
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}
