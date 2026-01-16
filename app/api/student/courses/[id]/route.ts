import { type NextRequest, NextResponse } from "next/server";
import {
    getAssignmentsCollection,
    getCoursesCollection,
    getMaterialsCollection,
    getSubmissionsCollection,
    getGradesCollection,
    getUsersCollection,
    getStudentEnrollmentsCollection
} from "@/lib/db";
import { ObjectId } from "mongodb";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const studentId = request.nextUrl.searchParams.get("studentId");

        if (!studentId) {
            return NextResponse.json({ error: "Student ID required" }, { status: 400 });
        }

        const coursesCollection = await getCoursesCollection();
        const usersCollection = await getUsersCollection();
        const assignmentsCollection = await getAssignmentsCollection();
        const materialsCollection = await getMaterialsCollection();
        const submissionsCollection = await getSubmissionsCollection();
        const gradesCollection = await getGradesCollection();
        const enrollmentsCollection = await getStudentEnrollmentsCollection();

        // 1. Get Course Info
        const course = await coursesCollection.findOne({ _id: new ObjectId(id) });
        if (!course) {
            return NextResponse.json({ error: "Course not found" }, { status: 404 });
        }

        // 2. Verify Enrollment
        const enrollment = await enrollmentsCollection.findOne({
            student_id: new ObjectId(studentId),
            course_id: new ObjectId(id)
        });

        if (!enrollment) {
            return NextResponse.json({ error: "Not enrolled in this course" }, { status: 403 });
        }

        // 3. Get Lecturer Info
        const lecturer = await usersCollection.findOne({ _id: new ObjectId(course.lecturer_id) });

        // 4. Get Materials
        const materials = await materialsCollection
            .find({ course_id: new ObjectId(id) })
            .sort({ created_at: -1 })
            .toArray();

        // 5. Get Assignments + Submissions/Grades
        const assignments = await assignmentsCollection
            .find({ course_id: new ObjectId(id) })
            .sort({ deadline: 1 })
            .toArray();

        const enrichedAssignments = await Promise.all(
            assignments.map(async (assignment) => {
                const submission = await submissionsCollection.findOne({
                    assignment_id: assignment._id,
                    student_id: new ObjectId(studentId),
                });

                const grade = await gradesCollection.findOne({
                    assignment_id: assignment._id,
                    student_id: new ObjectId(studentId),
                });

                return {
                    ...assignment,
                    is_submitted: !!submission,
                    is_graded: !!grade,
                    grade_data: grade || null,
                    submission_data: submission || null,
                };
            })
        );

        return NextResponse.json({
            course: {
                ...course,
                lecturer_name: lecturer ? `${lecturer.first_name} ${lecturer.last_name}` : "Unknown Lecturer",
                lecturer_email: lecturer?.email || "",
            },
            materials,
            assignments: enrichedAssignments
        });

    } catch (error) {
        console.error("[student/courses/[id]] GET error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
