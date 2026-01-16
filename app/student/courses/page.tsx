"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
	Users,
	Plus,
	Search,
	Trash2,
	X,
	BookOpen,
	GraduationCap,
	Calendar,
	ArrowRight,
	CheckCircle2,
	Library,
	Info
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/loading-spinner";

interface CourseWithLecturer {
	_id: string;
	course_code: string;
	course_name: string;
	level: number;
	lecturer_name: string;
	assignments_count: number;
	credits?: number; // Added for academic feel
}

interface AvailableCourse {
	_id: string;
	course_code: string;
	course_name: string;
	level: number;
	department?: string;
	credits?: number;
}

export default function CoursesPage() {
	const router = useRouter();
	const { session } = useAuthStore();

	const [courses, setCourses] = useState<CourseWithLecturer[]>([]);
	const [availableCourses, setAvailableCourses] = useState<AvailableCourse[]>([]);
	const [selectedCourses, setSelectedCourses] = useState<AvailableCourse[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [loading, setLoading] = useState(true);
	const [showRegistration, setShowRegistration] = useState(false);
	const [isRegistering, setIsRegistering] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		if (session?.role === "student") {
			fetchData();
		}
	}, [session]);

	const fetchData = async () => {
		if (!session?.userId) return;
		setLoading(true);
		try {
			// Fetch enrolled courses
			const coursesRes = await fetch(
				`/api/student/courses?studentId=${session.userId}`
			);
			let enrolledData: CourseWithLecturer[] = [];
			if (coursesRes.ok) {
				enrolledData = await coursesRes.json();
				setCourses(enrolledData);
			}

			// Fetch available courses for enrollment
			const availableRes = await fetch(`/api/onboarding/courses?level=100`);
			if (availableRes.ok) {
				const data = await availableRes.json();
				// FILTER: Exclude already enrolled courses
				const enrolledIds = new Set(enrolledData.map(c => c._id));
				const filtered = (data.courses || []).filter((c: AvailableCourse) => !enrolledIds.has(c._id));
				setAvailableCourses(filtered);
			}
		} catch (err) {
			console.error("Failed to fetch courses:", err);
			toast.error("Failed to load academic data");
		} finally {
			setLoading(false);
		}
	};

	const addToSelected = (course: AvailableCourse) => {
		if (!selectedCourses.find((c) => c._id === course._id)) {
			setSelectedCourses([...selectedCourses, course]);
		} else {
			// Toggle removal if already selected
			removeFromSelected(course._id);
		}
	};

	const removeFromSelected = (courseId: string) => {
		setSelectedCourses(selectedCourses.filter((c) => c._id !== courseId));
	};

	const handleRegister = async () => {
		if (selectedCourses.length === 0) return;

		setIsRegistering(true);
		setError("");

		try {
			const res = await fetch(
				`/api/onboarding/enroll?studentId=${session?.userId}`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						courseIds: selectedCourses.map((c) => c._id),
					}),
				}
			);

			if (res.ok) {
				toast.success("Courses registered successfully!");
				setSelectedCourses([]);
				setShowRegistration(false);
				fetchData(); // Refresh everything
			} else {
				const errorData = await res.json();
				setError(errorData.error || "Failed to enroll in courses");
				toast.error(errorData.error || "Registration failed");
			}
		} catch (err) {
			console.error("Failed to register for courses:", err);
			setError("An error occurred. Please try again.");
		} finally {
			setIsRegistering(false);
		}
	};

	const filteredAvailable = availableCourses.filter(
		(course) =>
			course.course_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
			course.course_name.toLowerCase().includes(searchTerm.toLowerCase())
	);

	if (!session || session.role !== "student") return null;

	return (
		<div className="max-w-7xl mx-auto p-4 md:p-8 space-y-10">
			{/* Academic Header Section */}
			<div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
				<div className="space-y-1">
					<div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
						<GraduationCap className="h-4 w-4" />
						Academic Portal
					</div>
					<h1 className="text-4xl font-black text-slate-900 tracking-tight">
						{showRegistration ? "Course Registration." : "My Study Plan."}
					</h1>
					<p className="text-slate-500 font-medium">
						{showRegistration
							? "Select your modules for the upcoming semester."
							: "Review your current enrollments and academic progress."}
					</p>
				</div>

				<div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner">
					<button
						onClick={() => setShowRegistration(false)}
						className={cn(
							"px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
							!showRegistration
								? "bg-white text-primary shadow-sm"
								: "text-slate-400 hover:text-slate-600"
						)}
					>
						<Library className="h-3.5 w-3.5" />
						My Enrolments
					</button>
					<button
						onClick={() => setShowRegistration(true)}
						className={cn(
							"px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
							showRegistration
								? "bg-white text-primary shadow-sm"
								: "text-slate-400 hover:text-slate-600"
						)}
					>
						<Plus className="h-3.5 w-3.5" />
						Registration
					</button>
				</div>
			</div>

			{showRegistration ? (
				/* ENROLLMENT PORTAL UI */
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
					{/* Left: Course Catalog (Lg: 8 cols) */}
					<div className="lg:col-span-8 space-y-6">
						{/* Search & Statistics */}
						<div className="flex flex-col md:flex-row gap-4">
							<div className="relative flex-1 group">
								<Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-primary transition-colors" />
								<Input
									placeholder="Search by code or title..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="pl-11 h-13 rounded-2xl bg-white border-slate-200 shadow-sm focus-visible:ring-2 focus-visible:ring-primary/10 font-medium"
								/>
							</div>
							<div className="bg-white px-6 py-3 rounded-2xl border border-slate-200 flex items-center gap-4">
								<div className="text-center">
									<div className="text-xs font-black text-slate-400 uppercase tracking-tighter leading-none">Catalog</div>
									<div className="text-xl font-black text-slate-900">{availableCourses.length}</div>
								</div>
								<div className="h-8 w-px bg-slate-100" />
								<div className="text-center">
									<div className="text-xs font-black text-slate-400 uppercase tracking-tighter leading-none">Active</div>
									<div className="text-xl font-black text-primary">{courses.length}</div>
								</div>
							</div>
						</div>

						{/* Available List */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{loading ? (
								<div className="col-span-full py-12 flex flex-col items-center justify-center space-y-4">
									<LoadingSpinner size="lg" />
									<p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fetching Catalog...</p>
								</div>
							) : filteredAvailable.length === 0 ? (
								<div className="col-span-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-[32px] p-12 text-center space-y-4">
									<div className="h-16 w-16 bg-white rounded-full mx-auto flex items-center justify-center text-slate-200">
										<Library className="h-8 w-8" />
									</div>
									<h3 className="text-lg font-black text-slate-800">No results found</h3>
									<p className="text-sm text-slate-500 font-medium max-w-xs mx-auto">
										We couldn't find any courses matching your search or your current academic level.
									</p>
								</div>
							) : (
								filteredAvailable.map((course) => {
									const isSelected = selectedCourses.some(c => c._id === course._id);
									return (
										<button
											key={course._id}
											onClick={() => addToSelected(course)}
											className={cn(
												"group p-6 rounded-[28px] border text-left transition-all duration-300 relative overflow-hidden",
												isSelected
													? "border-primary bg-primary/[0.02] ring-4 ring-primary/5"
													: "border-slate-100 bg-white hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
											)}
										>
											{isSelected && (
												<div className="absolute top-0 right-0 p-3">
													<div className="bg-primary text-white p-1 rounded-lg">
														<CheckCircle2 className="h-4 w-4" />
													</div>
												</div>
											)}

											<div className="space-y-3">
												<div className="flex items-center gap-2">
													<Badge variant="secondary" className="rounded-lg font-mono text-[10px] bg-slate-100 text-slate-600 border-none px-2 py-0.5">
														{course.course_code}
													</Badge>
													<span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
														Level {course.level}
													</span>
												</div>

												<div>
													<h3 className="font-black text-slate-900 leading-tight group-hover:text-primary transition-colors">
														{course.course_name}
													</h3>
													<div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-slate-400">
														<BookOpen className="h-3.5 w-3.5" />
														General Requirement
													</div>
												</div>
											</div>
										</button>
									);
								})
							)}
						</div>
					</div>

					{/* Right: Selection Tray (Lg: 4 cols) */}
					<div className="lg:col-span-4 sticky top-24">
						<Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[32px] overflow-hidden bg-white">
							<CardHeader className="bg-slate-900 text-white p-8">
								<div className="flex items-center justify-between mb-2">
									<CardTitle className="text-xl font-black tracking-tight">Enrolment Bag</CardTitle>
									<Badge className="bg-white/20 text-white border-none font-black px-3 py-1">
										{selectedCourses.length} Selected
									</Badge>
								</div>
								<p className="text-slate-400 text-xs font-medium">Review your selections before finalizing registration.</p>
							</CardHeader>

							<CardContent className="p-8 space-y-6">
								{selectedCourses.length === 0 ? (
									<div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
										<div className="h-14 w-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300">
											<Plus className="h-6 w-6" />
										</div>
										<p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Your bag is empty</p>
									</div>
								) : (
									<div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
										{selectedCourses.map((course) => (
											<div key={course._id} className="group p-4 rounded-2xl bg-slate-50 border border-slate-100 relative">
												<button
													onClick={(e) => {
														e.stopPropagation();
														removeFromSelected(course._id);
													}}
													className="absolute -top-1 -right-1 h-6 w-6 bg-white shadow-md border border-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
												>
													<X className="h-3.5 w-3.5" />
												</button>
												<div className="text-[10px] font-mono text-primary font-bold">{course.course_code}</div>
												<div className="text-xs font-black text-slate-800 leading-snug truncate mt-0.5">
													{course.course_name}
												</div>
											</div>
										))}
									</div>
								)}

								<div className="pt-6 border-t border-slate-100 space-y-4">
									<div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
										<span>Registration Phase</span>
										<span className="text-emerald-500">OPEN</span>
									</div>

									<Button
										onClick={handleRegister}
										disabled={isRegistering || selectedCourses.length === 0}
										className="w-full h-14 rounded-2xl font-black text-base shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform"
									>
										{isRegistering ? (
											<LoadingSpinner size="sm" />
										) : (
											<>
												Register Now
												<ArrowRight className="h-4 w-4 ml-2" />
											</>
										)}
									</Button>

									<div className="flex items-start gap-2 text-[10px] text-slate-400 font-medium">
										<Info className="h-3.5 w-3.5 flex-shrink-0 text-slate-300" />
										<span>Final registration will notify all department heads and update your course timeline.</span>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			) : (
				/* ENROLLED VIEW - Academic Grid */
				<div className="space-y-8">
					{courses.length === 0 ? (
						<div className="py-24 text-center space-y-6">
							<div className="h-24 w-24 bg-slate-50 rounded-full mx-auto flex items-center justify-center text-slate-200">
								<Library className="h-12 w-12" />
							</div>
							<div className="space-y-2">
								<h3 className="text-2xl font-black text-slate-900">No active enrolments</h3>
								<p className="text-slate-500 font-medium max-w-sm mx-auto">
									You haven't registered for any modules yet. Switch to the Registration tab to begin.
								</p>
							</div>
							<Button
								onClick={() => setShowRegistration(true)}
								className="rounded-2xl h-12 px-8 font-black"
							>
								Start Registration
							</Button>
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{courses.map((course) => (
								<button
									key={course._id}
									onClick={() => router.push(`/student/courses/${course._id}`)}
									className="group text-left"
								>
									<Card className="rounded-[32px] border-none shadow-sm bg-white hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300 overflow-hidden h-full flex flex-col">
										<div className="h-2 bg-primary/20 group-hover:bg-primary transition-colors" />
										<CardHeader className="p-8">
											<div className="flex items-center justify-between mb-4">
												<Badge className="rounded-lg bg-indigo-50 text-indigo-600 border-none font-mono text-[10px] px-2 py-1">
													{course.course_code}
												</Badge>
												<div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-primary/10 group-hover:text-primary transition-all">
													<ArrowRight className="h-4 w-4" />
												</div>
											</div>
											<CardTitle className="text-xl font-black text-slate-900 group-hover:text-primary transition-colors leading-tight">
												{course.course_name}
											</CardTitle>
										</CardHeader>
										<CardContent className="px-8 pb-8 mt-auto">
											<div className="space-y-4">
												<div className="h-px bg-slate-50" />
												<div className="flex items-center justify-between text-xs font-bold">
													<div className="flex items-center gap-2 text-slate-400">
														<Users className="h-4 w-4 text-slate-300" />
														<span>{course.lecturer_name}</span>
													</div>
													<Badge variant="outline" className="rounded-full border-slate-100 text-[10px] text-slate-400 font-black">
														L{course.level}
													</Badge>
												</div>
											</div>
										</CardContent>
									</Card>
								</button>
							))}
						</div>
					)}
				</div>
			)}
		</div>
	);
}
