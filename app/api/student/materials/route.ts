import { type NextRequest, NextResponse } from "next/server";
import {
    getMaterialsCollection,
    getCoursesCollection,
    getStudentEnrollmentsCollection,
    getUsersCollection
} from "@/lib/db";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
    try {
        const studentId = request.nextUrl.searchParams.get("studentId");

        if (!studentId) {
            return NextResponse.json({ error: "Student ID is required" }, { status: 400 });
        }

        const enrollmentsCollection = await getStudentEnrollmentsCollection();
        const materialsCollection = await getMaterialsCollection();
        const coursesCollection = await getCoursesCollection();
        const usersCollection = await getUsersCollection();

        // Get courses student is enrolled in
        const enrollments = await enrollmentsCollection
            .find({ student_id: new ObjectId(studentId) })
            .toArray();

        const courseIds = enrollments.map((e) => e.course_id);

        // Get materials for these courses
        const materials = await materialsCollection
            .find({ course_id: { $in: courseIds } })
            .sort({ created_at: -1 })
            .toArray();

        // Enrich with course and lecturer info
        const enriched = await Promise.all(
            materials.map(async (material) => {
                const course = await coursesCollection.findOne({
                    _id: new ObjectId(material.course_id),
                });
                const lecturer = await usersCollection.findOne({
                    _id: new ObjectId(material.lecturer_id),
                });

                return {
                    ...material,
                    course_code: course?.course_code,
                    course_name: course?.course_name,
                    lecturer_name: lecturer ? `${lecturer.first_name} ${lecturer.last_name}` : "Unknown Lecturer",
                };
            })
        );

        return NextResponse.json(enriched);
    } catch (error) {
        console.error("[student/materials] GET error:", error);
        return NextResponse.json({ error: "Failed to fetch materials" }, { status: 500 });
    }
}
