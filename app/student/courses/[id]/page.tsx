"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    BookOpen,
    Users,
    FileText,
    Download,
    Calendar,
    Clock,
    ChevronLeft,
    CheckCircle,
    AlertCircle,
    Mail,
    User,
    ArrowRight
} from "lucide-react";
import { LoadingSpinner } from "@/components/loading-spinner";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Assignment {
    _id: string;
    title: string;
    description: string;
    deadline: string;
    total_marks: number;
    is_submitted: boolean;
    is_graded: boolean;
    grade_data?: {
        final_score: number;
        penalty_applied: number;
    };
}

interface Material {
    _id: string;
    title: string;
    description: string;
    file_urls: string[];
    created_at: string;
}

interface CourseDetail {
    course: {
        _id: string;
        course_code: string;
        course_name: string;
        level: number;
        lecturer_name: string;
        lecturer_email: string;
    };
    materials: Material[];
    assignments: Assignment[];
}

export default function CourseDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { session } = useAuthStore();
    const [data, setData] = useState<CourseDetail | null>(null);
    const [loading, setLoading] = useState(true);

    const courseId = params.id as string;

    useEffect(() => {
        const fetchCourseDetail = async () => {
            if (!session?.userId || !courseId) return;
            try {
                const res = await fetch(`/api/student/courses/${courseId}?studentId=${session.userId}`);
                if (res.ok) {
                    setData(await res.json());
                } else {
                    const error = await res.json();
                    toast.error(error.error || "Failed to load course details");
                    router.push("/student/courses");
                }
            } catch (err) {
                console.error("Fetch course error:", err);
                toast.error("An error occurred");
            } finally {
                setLoading(false);
            }
        };

        if (session?.role === "student") {
            fetchCourseDetail();
        }
    }, [session, courseId, router]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <LoadingSpinner size="lg" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 animate-pulse">
                    Synchronizing Course Data...
                </p>
            </div>
        );
    }

    if (!data) return null;

    const { course, assignments, materials } = data;

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-8">
            {/* Navigation & Header */}
            <div className="space-y-6">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="group hover:bg-slate-100 rounded-xl px-4 pl-2 -ml-2 text-slate-500 font-bold transition-all"
                >
                    <ChevronLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Courses
                </Button>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                                Level {course.level}
                            </span>
                            <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest">
                                • Enrolled
                            </span>
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter text-slate-900 leading-none">
                            {course.course_code}.
                        </h1>
                        <p className="text-2xl font-bold text-slate-500 tracking-tight">
                            {course.course_name}
                        </p>
                    </div>

                    <div className="flex items-center gap-4 bg-white p-4 rounded-[32px] border border-slate-100 shadow-sm">
                        <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center">
                            <User className="h-7 w-7 text-slate-300" />
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Lead Lecturer</div>
                            <h3 className="font-bold text-slate-900 leading-none">{course.lecturer_name}</h3>
                            <p className="text-xs text-slate-400 mt-1">{course.lecturer_email}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Course Content */}
            <Tabs defaultValue="overview" className="space-y-8">
                <div className="overflow-x-auto pb-2 scrollbar-hide">
                    <TabsList className="bg-slate-100/50 p-1.5 rounded-2xl h-auto border border-slate-100 flex w-fit">
                        <TabsTrigger value="overview" className="rounded-xl px-8 py-3 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all whitespace-nowrap">Overview</TabsTrigger>
                        <TabsTrigger value="assignments" className="rounded-xl px-8 py-3 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all whitespace-nowrap">Assignments ({assignments.length})</TabsTrigger>
                        <TabsTrigger value="materials" className="rounded-xl px-8 py-3 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all whitespace-nowrap">Resources ({materials.length})</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="overview" className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Card className="md:col-span-2 border-none rounded-[40px] shadow-sm bg-white p-8 space-y-8">
                            <div className="space-y-4">
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Course Description</h2>
                                <p className="text-slate-500 font-medium leading-relaxed">
                                    Welcome to {course.course_code}: {course.course_name}. This course is designed to provide you with a comprehensive understanding of the subject matter. Throughout the semester, you will engage with lecture materials, participate in assignments, and work towards mastering the core concepts.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-6 rounded-3xl bg-slate-50/50 border border-slate-100 flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-primary shadow-sm">
                                        <FileText className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Assignments</div>
                                        <div className="text-lg font-black text-slate-900">{assignments.length} Total</div>
                                    </div>
                                </div>
                                <div className="p-6 rounded-3xl bg-slate-50/50 border border-slate-100 flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-emerald-500 shadow-sm">
                                        <BookOpen className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Resources</div>
                                        <div className="text-lg font-black text-slate-900">{materials.length} Shared</div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <div className="space-y-6">

                            <Card className="border-none rounded-[32px] shadow-sm bg-white p-8 border border-slate-100">
                                <h3 className="text-lg font-black text-slate-900 tracking-tight mb-6">Upcoming Deadlines</h3>
                                <div className="space-y-4">
                                    {assignments.filter(a => !a.is_submitted).slice(0, 3).map(a => (
                                        <div key={a._id} className="group flex items-center gap-4">
                                            <div className="h-8 w-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                                                <Clock className="h-4 w-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-black text-slate-900 truncate group-hover:text-primary transition-colors cursor-pointer" onClick={() => router.push(`/student/assignments/${a._id}`)}>
                                                    {a.title}
                                                </div>
                                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                                    {new Date(a.deadline).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {assignments.filter(a => !a.is_submitted).length === 0 && (
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center py-4">No pending deadlines</p>
                                    )}
                                </div>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="assignments" className="mt-0 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {assignments.map((assignment) => (
                            <Card key={assignment._id} className="border-none rounded-[32px] shadow-sm bg-white overflow-hidden group hover:shadow-xl hover:shadow-primary/5 transition-all flex flex-col h-full border border-transparent hover:border-primary/10">
                                <CardContent className="p-8 flex flex-col h-full space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className={cn(
                                            "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                            assignment.is_graded
                                                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                                : assignment.is_submitted
                                                    ? "bg-blue-50 text-blue-600 border-blue-100"
                                                    : "bg-amber-50 text-amber-600 border-amber-100"
                                        )}>
                                            {assignment.is_graded ? "Graded" : assignment.is_submitted ? "Submitted" : "Pending"}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(assignment.deadline).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <div className="space-y-2 flex-1">
                                        <h3 className="text-xl font-black text-slate-900 group-hover:text-primary transition-colors leading-tight">
                                            {assignment.title}
                                        </h3>
                                        <p className="text-sm text-slate-500 font-medium line-clamp-3">
                                            {assignment.description || "No description provided for this assignment."}
                                        </p>
                                    </div>

                                    <div className="space-y-4 pt-6 border-t border-slate-50 mt-auto">
                                        <div className="flex items-center justify-between">
                                            <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                                Weight: {assignment.total_marks} Marks
                                            </div>
                                            {assignment.is_graded && (
                                                <div className="text-lg font-black text-emerald-600">
                                                    {assignment.grade_data?.final_score}/{assignment.total_marks}
                                                </div>
                                            )}
                                        </div>
                                        <Button
                                            onClick={() => router.push(`/student/assignments/${assignment._id}`)}
                                            className={cn(
                                                "w-full h-12 rounded-2xl font-black text-xs uppercase tracking-widest group/btn",
                                                assignment.is_submitted ? "bg-slate-100 text-slate-600 hover:bg-slate-200" : "bg-primary text-white"
                                            )}
                                        >
                                            {assignment.is_submitted ? "View Submission" : "Submit Work"}
                                            <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="materials" className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {materials.map((material) => (
                            <Card key={material._id} className="border-none rounded-[32px] shadow-sm bg-white p-8 space-y-6 hover:shadow-xl transition-all border border-transparent hover:border-slate-100">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="h-12 w-12 rounded-2xl bg-primary/5 text-primary flex items-center justify-center">
                                            <BookOpen className="h-6 w-6" />
                                        </div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            {new Date(material.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-black text-slate-900 leading-tight">
                                            {material.title}
                                        </h3>
                                        <p className="text-sm text-slate-500 font-medium line-clamp-2">
                                            {material.description || "Lecture resources and study materials."}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-3">Downloadable Files</div>
                                    {material.file_urls.map((url, i) => (
                                        <a
                                            key={i}
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-primary hover:text-white transition-all group/file"
                                        >
                                            <div className="flex items-center gap-3">
                                                <FileText className="h-5 w-5 text-slate-400 group-hover/file:text-white/80" />
                                                <span className="text-sm font-bold">Resource Doc {i + 1}</span>
                                            </div>
                                            <Download className="h-4 w-4" />
                                        </a>
                                    ))}
                                </div>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
