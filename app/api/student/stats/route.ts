import { type NextRequest, NextResponse } from "next/server";
import {
	getSubmissionsCollection,
	getGradesCollection,
	getStudentEnrollmentsCollection,
	getAssignmentsCollection,
	getCoursesCollection
} from "@/lib/db";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
	try {
		const studentId = request.nextUrl.searchParams.get("studentId");
		if (!studentId) {
			return NextResponse.json(
				{ error: "studentId is required" },
				{ status: 400 }
			);
		}

		const assignmentsCollection = await getAssignmentsCollection();
		const submissionsCollection = await getSubmissionsCollection();
		const gradesCollection = await getGradesCollection();
		const enrollmentsCollection = await getStudentEnrollmentsCollection();
		const coursesCollection = await getCoursesCollection();

		// 1. Get student's enrolled courses
		const enrollments = await enrollmentsCollection
			.find({ student_id: new ObjectId(studentId) })
			.toArray();

		const courseIds = enrollments.map(e => e.course_id);

		// 2. Get all assignments for these courses
		const allAssignments = await assignmentsCollection
			.find({ course_id: { $in: courseIds } })
			.toArray();

		// 3. Get student's submissions to check what's already done
		const userSubmissions = await submissionsCollection
			.find({ student_id: new ObjectId(studentId) })
			.toArray();

		const submittedAssignmentIds = userSubmissions.map(s => s.assignment_id.toString());

		// 4. Calculate active assignments (not submitted and deadline not passed)
		const activeAssignments = allAssignments.filter(a => {
			const isSubmitted = submittedAssignmentIds.includes(a._id.toString());
			const isPastLateDeadline = new Date() > new Date(new Date(a.deadline).getTime() + (a.cutoff_days || 0) * 24 * 60 * 60 * 1000);
			return !isSubmitted && !isPastLateDeadline;
		});

		// 5. Get upcoming deadlines (due in the future, not submitted)
		const upcomingDeadlinesRaw = allAssignments
			.filter(a => {
				const isSubmitted = submittedAssignmentIds.includes(a._id.toString());
				const isFuture = new Date(a.deadline) > new Date();
				return !isSubmitted && isFuture;
			})
			.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
			.slice(0, 5);

		// Enrich upcoming deadlines with course info
		const upcomingDeadlines = await Promise.all(
			upcomingDeadlinesRaw.map(async (a) => {
				const course = await coursesCollection.findOne({ _id: a.course_id });
				return {
					_id: a._id,
					title: a.title,
					deadline: a.deadline,
					courseCode: course?.course_code || "Unknown",
				};
			})
		);

		// 6. Counts
		const submissionsCount = userSubmissions.length;
		const gradedCount = await gradesCollection.countDocuments({
			student_id: new ObjectId(studentId),
		});

		return NextResponse.json({
			active: activeAssignments.length,
			submitted: submissionsCount,
			graded: gradedCount,
			upcomingDeadlines,
		});
	} catch (error) {
		console.error("[student/stats] Fetch stats error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch stats" },
			{ status: 500 }
		);
	}
}
