import { type NextRequest, NextResponse } from "next/server";
import {
	getStudentEnrollmentsCollection,
	getCoursesCollection,
	getUsersCollection,
} from "@/lib/db";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
	try {
		const studentId = request.nextUrl.searchParams.get("studentId");

		if (!studentId) {
			return NextResponse.json(
				{ error: "Student ID required" },
				{ status: 400 }
			);
		}

		const enrollmentsCollection = await getStudentEnrollmentsCollection();
		const coursesCollection = await getCoursesCollection();
		const usersCollection = await getUsersCollection();

		const enrollments = await enrollmentsCollection
			.find({ student_id: new ObjectId(studentId) })
			.toArray();

		const courseIds = enrollments.map((e) => new ObjectId(e.course_id));

		const courses = await coursesCollection
			.find({ _id: { $in: courseIds } })
			.toArray();

		const enriched = await Promise.all(
			courses.map(async (course) => {
				const lecturer = await usersCollection.findOne({
					_id: new ObjectId(course.lecturer_id),
				});
				return {
					...course,
					lecturer_name: `${lecturer?.first_name} ${lecturer?.last_name}`,
					assignments_count: 3, // Placeholder
				};
			})
		);

		return NextResponse.json(enriched);
	} catch (error) {
		console.error("[v0] Fetch courses error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch courses" },
			{ status: 500 }
		);
	}
}
