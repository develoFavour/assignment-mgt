"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    FileText,
    Trash2,
    Plus,
    Search,
    FileUp,
    BookOpen,
    Download,
    Calendar,
    X,
    AlertCircle
} from "lucide-react";
import { LoadingSpinner } from "@/components/loading-spinner";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { FileUpload } from "@/components/file-upload";
import { ConfirmationModal } from "@/components/modals/confirmation-modal";

interface Material {
    _id: string;
    course_id: string;
    course_code: string;
    course_name: string;
    title: string;
    description: string;
    file_urls: string[];
    created_at: string;
}

interface Course {
    _id: string;
    course_code: string;
    course_name: string;
}

export default function LecturerMaterialsPage() {
    const router = useRouter();
    const { session } = useAuthStore();

    const [materials, setMaterials] = useState<Material[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);

    // Form state
    const [isUploading, setIsUploading] = useState(false);
    const [formData, setFormData] = useState({
        course_id: "",
        title: "",
        description: "",
    });
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [materialToDelete, setMaterialToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (session?.userId) {
            fetchMaterials();
            fetchCourses();
        }
    }, [session]);

    const fetchMaterials = async () => {
        try {
            const res = await fetch(`/api/lecturer/materials?lecturerId=${session?.userId}`);
            if (res.ok) {
                setMaterials(await res.json());
            }
        } catch (err) {
            toast.error("Failed to load materials");
        } finally {
            setLoading(false);
        }
    };

    const fetchCourses = async () => {
        try {
            const res = await fetch(`/api/lecturer/courses?lecturerId=${session?.userId}`);
            if (res.ok) {
                setCourses(await res.json());
            }
        } catch (err) {
            console.error("Failed to load courses");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.course_id || !formData.title || uploadedFiles.length === 0) {
            toast.error("Please fill all required fields and upload at least one file");
            return;
        }

        setIsUploading(true);
        try {
            const data = new FormData();
            data.append("course_id", formData.course_id);
            data.append("title", formData.title);
            data.append("description", formData.description);
            uploadedFiles.forEach(file => data.append("files", file));

            const res = await fetch(`/api/lecturer/materials?lecturerId=${session?.userId}`, {
                method: "POST",
                body: data,
            });

            if (res.ok) {
                toast.success("Material uploaded and students notified!");
                setShowAddModal(false);
                setFormData({ course_id: "", title: "", description: "" });
                setUploadedFiles([]);
                fetchMaterials();
            } else {
                const error = await res.json();
                toast.error(error.error || "Upload failed");
            }
        } catch (err) {
            toast.error("An error occurred during upload");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = (id: string) => {
        setMaterialToDelete(id);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!materialToDelete) return;

        setIsDeleting(true);
        try {
            const res = await fetch(`/api/lecturer/materials/${materialToDelete}`, { method: "DELETE" });
            if (res.ok) {
                toast.success("Material deleted");
                setMaterials(materials.filter(m => m._id !== materialToDelete));
            }
        } catch (err) {
            toast.error("Failed to delete material");
        } finally {
            setIsDeleting(false);
            setDeleteModalOpen(false);
            setMaterialToDelete(null);
        }
    };

    const filteredMaterials = materials.filter(m =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.course_code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!session || session.role !== "lecturer") return null;

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
                        <BookOpen className="h-4 w-4" />
                        Resource Management
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900">
                        Course Materials.
                    </h1>
                    <p className="text-slate-500 font-medium">
                        Upload study materials, slides, and academic resources for students.
                    </p>
                </div>
                <Button
                    onClick={() => setShowAddModal(true)}
                    className="h-14 px-8 rounded-2xl bg-primary font-black shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
                >
                    <Plus className="mr-2 h-5 w-5" />
                    Upload New Material
                </Button>
            </div>

            {/* Search & Stats */}
            <div className="flex flex-col md:flex-row gap-6">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Search resources by title or course..."
                        className="pl-11 h-12 rounded-2xl bg-white border-slate-100 shadow-sm focus-visible:ring-2 focus-visible:ring-primary/20 font-medium"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-4 bg-white px-6 py-2 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="text-center">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total</div>
                        <div className="text-xl font-black text-slate-900 leading-none">{materials.length}</div>
                    </div>
                    <div className="w-px h-8 bg-slate-100 mx-2" />
                    <div className="text-center">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Courses</div>
                        <div className="text-xl font-black text-slate-900 leading-none">{new Set(materials.map(m => m.course_id)).size}</div>
                    </div>
                </div>
            </div>

            {/* Materials Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-4">
                    <LoadingSpinner size="lg" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">
                        Loading Resources...
                    </p>
                </div>
            ) : filteredMaterials.length === 0 ? (
                <Card className="border-none shadow-sm bg-white rounded-[32px] py-24">
                    <CardContent className="flex flex-col items-center justify-center text-center">
                        <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                            <FileUp className="h-8 w-8 text-slate-200" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">
                            No Materials Uploaded Yet
                        </h3>
                        <p className="text-slate-500 font-medium mt-1 max-w-sm">
                            Start by uploading your first study resource to help your students learn more effectively.
                        </p>
                        <Button
                            variant="outline"
                            onClick={() => setShowAddModal(true)}
                            className="mt-6 rounded-xl font-bold"
                        >
                            Upload Now
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMaterials.map((material) => (
                        <Card key={material._id} className="border-none shadow-sm bg-white rounded-3xl overflow-hidden group hover:shadow-xl hover:shadow-primary/5 transition-all">
                            <CardContent className="p-0">
                                <div className="p-6 space-y-4 text-left">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                                <FileText className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-black text-primary uppercase tracking-widest">
                                                    {material.course_code}
                                                </div>
                                                <h3 className="font-black text-slate-900 leading-tight">
                                                    {material.title}
                                                </h3>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(material._id)}
                                            className="p-2 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <p className="text-sm text-slate-500 line-clamp-2 font-medium">
                                        {material.description || "No description provided."}
                                    </p>

                                    <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                                        <div className="flex -space-x-2">
                                            <div className="h-8 w-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-400">
                                                {material.file_urls.length}
                                            </div>
                                            <span className="ml-4 text-[10px] font-black text-slate-300 uppercase tracking-widest pt-2.5">Files</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(material.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>

                                <div className="px-6 pb-6 pt-2">
                                    <div className="flex flex-wrap gap-2">
                                        {material.file_urls.map((url, i) => (
                                            <a
                                                key={i}
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-50 text-[10px] font-bold text-slate-600 hover:bg-primary/10 hover:text-primary transition-colors"
                                            >
                                                <Download className="h-3 w-3" />
                                                Doc {i + 1}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Upload Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
                        onClick={() => !isUploading && setShowAddModal(false)}
                    />
                    <Card className="relative w-full max-w-xl border-none shadow-2xl bg-white rounded-[32px] overflow-hidden">
                        <CardContent className="p-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                                        <FileUp className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Upload Material</h2>
                                        <p className="text-slate-500 text-sm font-medium">Resources will be shared with all students in the course.</p>
                                    </div>
                                </div>
                                {!isUploading && (
                                    <button onClick={() => setShowAddModal(false)} className="p-2 rounded-xl hover:bg-slate-50 text-slate-400">
                                        <X className="h-5 w-5" />
                                    </button>
                                )}
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Course</label>
                                    <select
                                        className="w-full h-12 rounded-xl bg-slate-50 border-none px-4 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
                                        value={formData.course_id}
                                        onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Course</option>
                                        {courses.map(c => (
                                            <option key={c._id} value={c._id}>{c.course_code}: {c.course_name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Title</label>
                                    <Input
                                        placeholder="e.g., Week 1 Lecture Slides"
                                        className="h-12 rounded-xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-primary/20 font-bold"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Description (Optional)</label>
                                    <textarea
                                        placeholder="Briefly explain what this resource is about..."
                                        className="w-full px-4 py-3 border-none bg-slate-50 rounded-xl min-h-24 resize-none focus:ring-2 focus:ring-primary/20 outline-none font-medium"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2 text-left">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Files</label>
                                    <FileUpload
                                        maxFiles={5}
                                        maxSize={50 * 1024 * 1024} // 50MB
                                        onFilesSelected={setUploadedFiles}
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={isUploading}
                                        onClick={() => setShowAddModal(false)}
                                        className="h-14 flex-1 rounded-2xl font-bold"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isUploading}
                                        className="h-14 flex-[2] rounded-2xl bg-primary font-black shadow-xl shadow-primary/20"
                                    >
                                        {isUploading ? <LoadingSpinner size="sm" /> : "Upload & Notify Students"}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}

            <ConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setMaterialToDelete(null);
                }}
                onConfirm={confirmDelete}
                title="Delete Material"
                description="Are you sure you want to delete this course material? This action cannot be undone and students will no longer be able to access these files."
                isLoading={isDeleting}
                variant="destructive"
            />
        </div>
    );
}
