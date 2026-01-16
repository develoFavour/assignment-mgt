import { type NextRequest, NextResponse } from "next/server";
import {
    getMaterialsCollection,
    getCoursesCollection,
    getStudentEnrollmentsCollection,
    getUsersCollection
} from "@/lib/db";
import { ObjectId } from "mongodb";
import { put } from "@vercel/blob";
import { emailService } from "@/lib/email";

export async function GET(request: NextRequest) {
    try {
        const lecturerId = request.nextUrl.searchParams.get("lecturerId");

        if (!lecturerId) {
            return NextResponse.json({ error: "Lecturer ID is required" }, { status: 400 });
        }

        const materialsCollection = await getMaterialsCollection();
        const coursesCollection = await getCoursesCollection();

        const materials = await materialsCollection
            .find({ lecturer_id: new ObjectId(lecturerId) })
            .sort({ created_at: -1 })
            .toArray();

        // Enrich with course info
        const enriched = await Promise.all(
            materials.map(async (material) => {
                const course = await coursesCollection.findOne({
                    _id: new ObjectId(material.course_id),
                });
                return {
                    ...material,
                    course_code: course?.course_code,
                    course_name: course?.course_name,
                };
            })
        );

        return NextResponse.json(enriched);
    } catch (error) {
        console.error("[lecturer/materials] GET error:", error);
        return NextResponse.json({ error: "Failed to fetch materials" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const course_id = formData.get("course_id") as string;
        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const lecturerId = request.nextUrl.searchParams.get("lecturerId");
        const files = formData.getAll("files") as File[];

        if (!lecturerId) {
            return NextResponse.json({ error: "Lecturer ID is required" }, { status: 400 });
        }

        if (!course_id || !title || files.length === 0) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const fileUrls: string[] = [];
        const uploadPath = `materials/${course_id}/${Date.now()}`;

        for (const file of files) {
            const blob = await put(`${uploadPath}/${file.name}`, file, {
                access: "public",
            });
            fileUrls.push(blob.url);
        }

        const materialsCollection = await getMaterialsCollection();

        const material = {
            course_id: new ObjectId(course_id),
            lecturer_id: new ObjectId(lecturerId),
            title,
            description,
            file_urls: fileUrls,
            created_at: new Date(),
        };

        const result = await materialsCollection.insertOne(material);

        // Notification Logic
        try {
            const coursesCollection = await getCoursesCollection();
            const enrollmentCollection = await getStudentEnrollmentsCollection();
            const usersCollection = await getUsersCollection();

            const course = await coursesCollection.findOne({ _id: new ObjectId(course_id) });
            const enrollments = await enrollmentCollection
                .find({ course_id: new ObjectId(course_id) })
                .toArray();

            const studentIds = enrollments.map((e) => e.student_id);
            const students = await usersCollection
                .find({ _id: { $in: studentIds } })
                .toArray();

            const studentEmails = students.map((s) => s.email);

            if (course && studentEmails.length > 0) {
                await emailService.sendNewMaterialEmail(
                    studentEmails,
                    `${course.course_code}: ${course.course_name}`,
                    title
                );
            }
        } catch (emailErr) {
            console.error("[materials] Notification error:", emailErr);
        }

        return NextResponse.json({
            success: true,
            material: { _id: result.insertedId, ...material },
        });
    } catch (error) {
        console.error("[lecturer/materials] POST error:", error);
        return NextResponse.json({ error: "Failed to upload material" }, { status: 500 });
    }
}
