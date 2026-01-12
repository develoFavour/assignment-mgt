import { type NextRequest, NextResponse } from "next/server";
import { getAssignmentsCollection, getCoursesCollection } from "@/lib/db";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
	try {
		const assignmentsCollection = await getAssignmentsCollection();
		const coursesCollection = await getCoursesCollection();

		// Get assignments created by this lecturer
		const lecturerId = request.nextUrl.searchParams.get("lecturerId");
		if (!lecturerId) {
			return NextResponse.json(
				{ error: "Lecturer ID is required" },
				{ status: 400 }
			);
		}

		const assignments = await assignmentsCollection
			.find({ created_by: new ObjectId(lecturerId) })
			.toArray();

		// Enrich with course info
		const enriched = await Promise.all(
			assignments.map(async (assignment) => {
				const course = await coursesCollection.findOne({
					_id: new ObjectId(assignment.course_id),
				});
				return {
					...assignment,
					course_code: course?.course_code,
				};
			})
		);

		return NextResponse.json(enriched);
	} catch (error) {
		console.error("[v0] Fetch assignments error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch assignments" },
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const {
			course_id,
			title,
			description,
			deadline,
			accept_late,
			cutoff_days,
			penalty_percent,
		} = await request.json();

		const lecturerId = request.nextUrl.searchParams.get("lecturerId");
		if (!lecturerId) {
			return NextResponse.json(
				{ error: "Lecturer ID is required" },
				{ status: 400 }
			);
		}
		const assignmentsCollection = await getAssignmentsCollection();

		const assignment = {
			course_id: new ObjectId(course_id),
			title,
			description,
			deadline: new Date(deadline),
			created_by: new ObjectId(lecturerId),
			late_submission: {
				accept_late,
				cutoff_days,
				penalty_percent,
			},
			created_at: new Date(),
		};

		const result = await assignmentsCollection.insertOne(assignment);

		return NextResponse.json({
			assignment: { _id: result.insertedId, ...assignment },
		});
	} catch (error) {
		console.error("[v0] Create assignment error:", error);
		return NextResponse.json(
			{ error: "Failed to create assignment" },
			{ status: 500 }
		);
	}
}
