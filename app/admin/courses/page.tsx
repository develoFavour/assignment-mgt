"use client";

import type React from "react";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { useAuthStore, useUIStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Plus,
	BookOpen,
	Trash2,
	Search,
	GraduationCap,
	Library,
	Layers,
	Calendar,
	Filter,
	X,
	RefreshCw,
	MoreVertical,
	ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/loading-spinner";
import { ConfirmationModal } from "@/components/modals/confirmation-modal";
import { cn } from "@/lib/utils";
import type { Course } from "@/lib/types";

export default function CoursesPage() {
	const router = useRouter();
	const { session } = useAuthStore();
	const { sidebarOpen } = useUIStore();

	const [courses, setCourses] = useState<Course[]>([]);
	const [lecturers, setLecturers] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	// UI States
	const [searchTerm, setSearchTerm] = useState("");
	const [levelFilter, setLevelFilter] = useState<number | "all">("all");
	const [showAddForm, setShowAddForm] = useState(false);

	// Modal states
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	const [formData, setFormData] = useState({
		course_code: "",
		course_name: "",
		level: 100,
		lecturer_id: "",
		semester: "1",
	});

	useEffect(() => {
		if (session && session.role !== "admin") {
			router.push("/");
		}
	}, [session, router]);

	const fetchData = async () => {
		setLoading(true);
		try {
			const [coursesRes, lecturersRes] = await Promise.all([
				fetch("/api/admin/courses"),
				fetch("/api/admin/lecturers"),
			]);

			if (coursesRes.ok) {
				const coursesData = await coursesRes.json();
				setCourses(coursesData);
			}
			if (lecturersRes.ok) {
				const lecturersData = await lecturersRes.json();
				setLecturers(lecturersData);
			}
		} catch (err) {
			toast.error("Resource synchronization failed");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (session?.role === "admin") {
			fetchData();
		}
	}, [session]);

	const filteredCourses = useMemo(() => {
		return courses.filter((course) => {
			const matchesSearch =
				course.course_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
				course.course_name.toLowerCase().includes(searchTerm.toLowerCase());
			const matchesLevel = levelFilter === "all" || course.level === levelFilter;
			return matchesSearch && matchesLevel;
		});
	}, [courses, searchTerm, levelFilter]);

	const handleAddCourse = async (e: React.FormEvent) => {
		e.preventDefault();

		const promise = fetch("/api/admin/courses", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(formData),
		}).then(async (res) => {
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Failed to catalog course");

			await fetchData(); // Refresh list to get lecturer names
			setShowAddForm(false);
			setFormData({
				course_code: "",
				course_name: "",
				level: 100,
				lecturer_id: "",
				semester: "1",
			});
			return data;
		});

		toast.promise(promise, {
			loading: 'Registering academic resource...',
			success: 'Course successfully added to university catalog.',
			error: (err) => err.message,
		});
	};

	const handleDeleteConfirm = async () => {
		if (!courseToDelete) return;

		setIsDeleting(true);
		try {
			const res = await fetch(`/api/admin/courses/${courseToDelete}`, {
				method: "DELETE",
			});
			if (res.ok) {
				setCourses(courses.filter((c) => c._id !== courseToDelete));
				toast.success("Course successfully purged from system");
				setIsDeleteModalOpen(false);
			} else {
				const data = await res.json();
				toast.error(data.error || "Failed to remove course");
			}
		} catch (err) {
			toast.error("Protocol error during deletion");
		} finally {
			setIsDeleting(false);
			setCourseToDelete(null);
		}
	};

	if (!session || session.role !== "admin") return null;

	return (
		<div className="min-h-screen bg-[#F8FAFC]">
			<Header />
			<Sidebar />

			<main className={cn(
				"pt-20 px-4 pb-12 transition-all duration-300 min-h-screen",
				sidebarOpen ? "lg:pl-[280px]" : "lg:pl-24"
			)}>
				<div className="max-w-7xl mx-auto space-y-8">

					{/* Header Section */}
					<div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
						<div className="space-y-1">
							<div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
								<Library className="h-4 w-4" />
								Academic Catalog
							</div>
							<h1 className="text-4xl font-black tracking-tight text-slate-900">Courses.</h1>
							<p className="text-slate-500 font-medium">Configure university curriculum and lecturer assignments.</p>
						</div>

						<div className="flex items-center gap-3">
							<Button
								variant="outline"
								onClick={fetchData}
								className="h-12 px-6 rounded-2xl bg-white border-slate-200 shadow-sm gap-2 font-bold hover:bg-slate-50 transition-all"
							>
								<RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
								Sync Records
							</Button>
							<Button
								onClick={() => setShowAddForm(true)}
								className="h-12 px-6 rounded-2xl bg-primary shadow-lg shadow-primary/20 gap-2 font-bold hover:scale-[1.02] transition-all"
							>
								<Plus className="h-4 w-4" />
								Register Course
							</Button>
						</div>
					</div>

					{/* Stats Chips */}
					<div className="flex flex-wrap gap-4">
						{[
							{ label: "Total Modules", value: courses.length, icon: BookOpen, color: "text-blue-600 bg-blue-50" },
							{ label: "First Semester", value: courses.filter(c => c.semester === "1").length, icon: Calendar, color: "text-indigo-600 bg-indigo-50" },
							{ label: "Second Semester", value: courses.filter(c => c.semester === "2").length, icon: Calendar, color: "text-purple-600 bg-purple-50" },
						].map((stat, i) => (
							<div key={i} className="flex items-center gap-3 px-6 py-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
								<div className={cn("p-2 rounded-xl", stat.color)}>
									<stat.icon className="h-5 w-5" />
								</div>
								<div>
									<div className="text-lg font-black text-slate-900 leading-none">{stat.value}</div>
									<div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</div>
								</div>
							</div>
						))}
					</div>

					{/* Register Course Form Overlay */}
					{showAddForm && (
						<div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
							<div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setShowAddForm(false)} />
							<div className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden">
								<div className="p-8">
									<div className="flex items-center justify-between mb-8">
										<div className="flex items-center gap-3">
											<div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
												<BookOpen className="h-6 w-6" />
											</div>
											<div>
												<h2 className="text-2xl font-black text-slate-900 tracking-tight">Register Module</h2>
												<p className="text-slate-500 text-sm font-medium">Add a new course to the university curriculum.</p>
											</div>
										</div>
										<button onClick={() => setShowAddForm(false)} className="p-2 rounded-xl hover:bg-slate-50 text-slate-400">
											<X className="h-5 w-5" />
										</button>
									</div>

									<form onSubmit={handleAddCourse} className="space-y-6">
										<div className="grid grid-cols-2 gap-6">
											<div className="space-y-2">
												<label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Course Code</label>
												<Input
													placeholder="e.g. CSC401"
													className="h-12 rounded-xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-primary/20 font-mono font-bold"
													value={formData.course_code}
													onChange={(e) => setFormData({ ...formData, course_code: e.target.value.toUpperCase() })}
													required
												/>
											</div>
											<div className="space-y-2">
												<label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Course Name</label>
												<Input
													placeholder="e.g. Distributed Systems"
													className="h-12 rounded-xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-primary/20 font-bold"
													value={formData.course_name}
													onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
													required
												/>
											</div>
										</div>

										<div className="grid grid-cols-2 gap-6">
											<div className="space-y-2">
												<label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Academic Level</label>
												<select
													value={formData.level}
													onChange={(e) => setFormData({ ...formData, level: Number(e.target.value) })}
													className="w-full h-12 px-4 rounded-xl bg-slate-50 border-none text-sm font-black focus:ring-2 focus:ring-primary/20 outline-none transition-all"
												>
													{[100, 200, 300, 400].map(lvl => (
														<option key={lvl} value={lvl}>{lvl} Level</option>
													))}
												</select>
											</div>
											<div className="space-y-2">
												<label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Semester</label>
												<div className="flex gap-2 p-1 bg-slate-50 rounded-xl">
													{["1", "2"].map((sem) => (
														<button
															key={sem}
															type="button"
															onClick={() => setFormData({ ...formData, semester: sem })}
															className={cn(
																"flex-1 h-10 rounded-lg text-xs font-black transition-all",
																formData.semester === sem
																	? "bg-white text-primary shadow-sm"
																	: "text-slate-400 hover:text-slate-600"
															)}
														>
															Sem {sem}
														</button>
													))}
												</div>
											</div>
										</div>

										<div className="space-y-2">
											<label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Assigned Lecturer</label>
											<div className="relative">
												<GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
												<select
													value={formData.lecturer_id}
													onChange={(e) => setFormData({ ...formData, lecturer_id: e.target.value })}
													className="w-full h-12 pl-12 pr-4 rounded-xl bg-slate-50 border-none text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
													required
												>
													<option value="">Choose Course Instructor</option>
													{lecturers.map((lecturer) => (
														<option key={lecturer._id} value={lecturer._id}>
															{lecturer.first_name} {lecturer.last_name}
														</option>
													))}
												</select>
											</div>
										</div>

										<div className="pt-4 flex gap-3">
											<Button type="button" variant="outline" onClick={() => setShowAddForm(false)} className="h-14 flex-1 rounded-2xl font-bold">
												Discard
											</Button>
											<Button type="submit" className="h-14 flex-[2] rounded-2xl bg-primary font-black shadow-xl shadow-primary/20">
												Add to Curriculum
											</Button>
										</div>
									</form>
								</div>
							</div>
						</div>
					)}

					{/* Catalog Table */}
					<div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">

						{/* Table Toolbar */}
						<div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
							<div className="relative w-full sm:w-80 group">
								<Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-primary transition-colors" />
								<Input
									placeholder="Filter by code or title..."
									className="pl-11 h-11 rounded-2xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-primary/20"
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
								/>
							</div>

							<div className="flex items-center gap-2 bg-slate-50 p-1 rounded-2xl border border-slate-100">
								{["all", 100, 200, 300, 400].map((lvl) => (
									<button
										key={lvl}
										onClick={() => setLevelFilter(lvl as any)}
										className={cn(
											"px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
											levelFilter === lvl
												? "bg-white text-primary shadow-sm"
												: "text-slate-400 hover:text-slate-600"
										)}
									>
										{lvl === "all" ? "All" : `${lvl}L`}
									</button>
								))}
							</div>
						</div>

						{/* Table Content */}
						<div className="overflow-x-auto min-h-[400px]">
							{loading ? (
								<div className="flex flex-col items-center justify-center py-32 space-y-4">
									<LoadingSpinner size="lg" />
									<p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">Fetching Curriculum Data...</p>
								</div>
							) : filteredCourses.length === 0 ? (
								<div className="flex flex-col items-center justify-center py-32 text-center">
									<div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center mb-6">
										<BookOpen className="h-8 w-8 text-slate-200" />
									</div>
									<h3 className="text-xl font-black text-slate-900 tracking-tight">Catalog Empty.</h3>
									<p className="text-slate-500 font-medium">No courses found matching your current filters.</p>
								</div>
							) : (
								<table className="w-full">
									<thead>
										<tr className="bg-slate-50/50">
											<th className="text-left py-5 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Academic Module</th>
											<th className="text-left py-5 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Instructor</th>
											<th className="text-left py-5 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Details</th>
											<th className="text-right py-5 px-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Management</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-slate-50">
										{filteredCourses.map((course: any) => (
											<tr key={course._id} className="group hover:bg-slate-50/30 transition-colors">
												<td className="py-5 px-8">
													<div className="flex items-center gap-4">
														<div className="h-11 w-11 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center font-bold text-xs">
															<Layers className="h-5 w-5" />
														</div>
														<div className="flex flex-col">
															<span className="text-sm font-black text-slate-900 leading-tight">
																{course.course_code}
															</span>
															<span className="text-[11px] font-medium text-slate-400">
																{course.course_name}
															</span>
														</div>
													</div>
												</td>
												<td className="py-5 px-8">
													<div className="flex items-center gap-3">
														<div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 uppercase">
															{course.lecturer_name ? (course.lecturer_name as string).split(' ').map(n => n[0]).join('') : 'NA'}
														</div>
														<span className="text-xs font-bold text-slate-700">
															{course.lecturer_name || "Unassigned"}
														</span>
													</div>
												</td>
												<td className="py-5 px-8">
													<div className="flex items-center gap-2">
														<span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[9px] font-black uppercase tracking-wider">
															{course.level}L
														</span>
														<span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase tracking-wider">
															Sem {course.semester}
														</span>
													</div>
												</td>
												<td className="py-5 px-8 text-right">
													<div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
														<button
															onClick={() => {
																setCourseToDelete(course._id || null);
																setIsDeleteModalOpen(true);
															}}
															className="h-9 w-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-red-500 hover:bg-red-50 hover:border-red-100 transition-all shadow-sm"
															title="Remove Course"
														>
															<Trash2 className="h-4 w-4" />
														</button>
														<button className="h-9 w-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-600 transition-all shadow-sm">
															<MoreVertical className="h-4 w-4" />
														</button>
													</div>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							)}
						</div>
					</div>
				</div>

				<ConfirmationModal
					isOpen={isDeleteModalOpen}
					onClose={() => setIsDeleteModalOpen(false)}
					onConfirm={handleDeleteConfirm}
					title="Purge Academic Module?"
					description="This action will permanently remove this course from the university curriculum. All enrolled students and associated assignments will lose their connection to this resource."
					isLoading={isDeleting}
				/>
			</main>
		</div>
	);
}
