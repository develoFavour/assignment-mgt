"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    FileText,
    Search,
    BookOpen,
    Download,
    Calendar,
    User,
    ExternalLink
} from "lucide-react";
import { LoadingSpinner } from "@/components/loading-spinner";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Material {
    _id: string;
    course_id: string;
    course_code: string;
    course_name: string;
    lecturer_name: string;
    title: string;
    description: string;
    file_urls: string[];
    created_at: string;
}

export default function StudentMaterialsPage() {
    const router = useRouter();
    const { session } = useAuthStore();

    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterCourse, setFilterCourse] = useState("all");

    useEffect(() => {
        if (session?.userId) {
            fetchMaterials();
        }
    }, [session]);

    const fetchMaterials = async () => {
        try {
            const res = await fetch(`/api/student/materials?studentId=${session?.userId}`);
            if (res.ok) {
                setMaterials(await res.json());
            }
        } catch (err) {
            toast.error("Failed to load materials");
        } finally {
            setLoading(false);
        }
    };

    const uniqueCourses = Array.from(new Set(materials.map(m => m.course_code)));

    const filteredMaterials = materials.filter(m => {
        const matchesSearch =
            m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.course_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.lecturer_name.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesFilter = filterCourse === "all" || m.course_code === filterCourse;

        return matchesSearch && matchesFilter;
    });

    if (!session || session.role !== "student") return null;

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="space-y-1">
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
                    <BookOpen className="h-4 w-4" />
                    Academic Resources
                </div>
                <h1 className="text-4xl font-black tracking-tight text-slate-900">
                    Course Materials.
                </h1>
                <p className="text-slate-500 font-medium">
                    Access lecture notes, study guides, and resources uploaded by your lecturers.
                </p>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Search by title, course, or lecturer..."
                            className="pl-11 h-12 rounded-2xl bg-white border-slate-100 shadow-sm focus-visible:ring-2 focus-visible:ring-primary/20 font-medium"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center gap-2 px-1">
                        <div className="h-1 w-1 rounded-full bg-primary" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filter by Course</span>
                    </div>

                    <div className="relative group/filters">
                        <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100 overflow-x-auto no-scrollbar gap-1.5 scroll-smooth">
                            <button
                                onClick={() => setFilterCourse("all")}
                                className={cn(
                                    "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2",
                                    filterCourse === "all"
                                        ? "bg-white text-primary shadow-sm border border-slate-100"
                                        : "text-slate-400 hover:text-slate-600 hover:bg-slate-100/50"
                                )}
                            >
                                <span className={cn("h-1.5 w-1.5 rounded-full", filterCourse === "all" ? "bg-primary" : "bg-slate-300")} />
                                All Resources
                            </button>
                            {uniqueCourses.sort().map(course => (
                                <button
                                    key={course}
                                    onClick={() => setFilterCourse(course)}
                                    className={cn(
                                        "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2",
                                        filterCourse === course
                                            ? "bg-white text-primary shadow-sm border border-slate-100"
                                            : "text-slate-400 hover:text-slate-600 hover:bg-slate-100/50"
                                    )}
                                >
                                    <span className={cn("h-1.5 w-1.5 rounded-full", filterCourse === course ? "bg-primary" : "bg-slate-300 invisible")} />
                                    {course}
                                </button>
                            ))}
                        </div>
                        {/* Fade effect for indicating more content */}
                        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-slate-50 to-transparent pointer-events-none opacity-0 group-hover/filters:opacity-100 transition-opacity" />
                    </div>
                </div>
            </div>

            {/* Materials List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-4">
                    <LoadingSpinner size="lg" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">
                        Fetching resources...
                    </p>
                </div>
            ) : filteredMaterials.length === 0 ? (
                <Card className="border-none shadow-sm bg-white rounded-[32px] py-32">
                    <CardContent className="flex flex-col items-center justify-center text-center">
                        <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                            <BookOpen className="h-8 w-8 text-slate-200" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">
                            No Materials Found
                        </h3>
                        <p className="text-slate-500 font-medium mt-1 max-w-sm">
                            Either your lecturers haven't uploaded any resources yet, or no materials match your current search.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMaterials.map((material) => (
                        <Card key={material._id} className="border-none shadow-sm bg-white rounded-[32px] overflow-hidden group hover:shadow-2xl hover:shadow-primary/10 transition-all border border-transparent hover:border-primary/10 flex flex-col h-full">
                            <CardContent className="p-8 flex flex-col h-full space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="px-3 py-1 rounded-full bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/10">
                                            {material.course_code}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(material.created_at).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <h3 className="text-xl font-black text-slate-900 leading-tight group-hover:text-primary transition-colors">
                                            {material.title}
                                        </h3>
                                        <p className="text-slate-400 text-xs font-bold flex items-center gap-1.5">
                                            <User className="h-3 w-3" />
                                            {material.lecturer_name}
                                        </p>
                                    </div>

                                    <p className="text-sm text-slate-500 font-medium line-clamp-3">
                                        {material.description || "No description provided for this resource."}
                                    </p>
                                </div>

                                <div className="mt-auto pt-6 border-t border-slate-50 space-y-3">
                                    <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">
                                        Available Downloads ({material.file_urls.length})
                                    </div>
                                    <div className="grid grid-cols-1 gap-2">
                                        {material.file_urls.map((url, i) => (
                                            <a
                                                key={i}
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-primary hover:text-white transition-all group/btn"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-xl bg-white/80 flex items-center justify-center text-slate-400 group-hover/btn:text-primary transition-colors">
                                                        <FileText className="h-5 w-5" />
                                                    </div>
                                                    <span className="text-sm font-bold">Resource File {i + 1}</span>
                                                </div>
                                                <Download className="h-4 w-4" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
