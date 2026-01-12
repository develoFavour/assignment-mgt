"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { useAuthStore } from "@/lib/store";
import { useUIStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Plus, Search, Trash2, X } from "lucide-react";

interface CourseWithLecturer {
	_id: string;
	course_code: string;
	course_name: string;
	level: number;
	lecturer_name: string;
	assignments_count: number;
}

interface AvailableCourse {
	_id: string;
	course_code: string;
	course_name: string;
	level: number;
}

export default function CoursesPage() {
	const router = useRouter();
	const { session } = useAuthStore();
	const { sidebarOpen } = useUIStore();
	const [courses, setCourses] = useState<CourseWithLecturer[]>([]);
	const [availableCourses, setAvailableCourses] = useState<AvailableCourse[]>(
		[]
	);
	const [selectedCourses, setSelectedCourses] = useState<AvailableCourse[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [loading, setLoading] = useState(true);
	const [showRegistration, setShowRegistration] = useState(false);
	const [isRegistering, setIsRegistering] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		if (!session) {
			router.push("/login");
		} else if (session.role !== "student") {
			router.push("/");
		}
	}, [session, router]);

	useEffect(() => {
		const fetchData = async () => {
			try {
				// Fetch enrolled courses
				const coursesRes = await fetch(
					`/api/student/courses?studentId=${session.userId}`
				);
				if (coursesRes.ok) {
					setCourses(await coursesRes.json());
				}

				// Fetch available courses for enrollment
				const availableRes = await fetch(`/api/onboarding/courses?level=100`);
				if (availableRes.ok) {
					const data = await availableRes.json();
					setAvailableCourses(data.courses || []);
				}
			} catch (err) {
				console.error("Failed to fetch courses:", err);
			} finally {
				setLoading(false);
			}
		};

		if (session?.role === "student") {
			fetchData();
		}
	}, [session]);

	// Filter courses based on search term
	const filteredCourses = availableCourses.filter(
		(course) =>
			course.course_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
			course.course_name.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const addToSelected = (course: AvailableCourse) => {
		if (!selectedCourses.find((c) => c._id === course._id)) {
			setSelectedCourses([...selectedCourses, course]);
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
				`/api/onboarding/enroll?studentId=${session.userId}`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						courseIds: selectedCourses.map((c) => c._id),
					}),
				}
			);

			if (res.ok) {
				// Refresh enrolled courses
				const coursesRes = await fetch(
					`/api/student/courses?studentId=${session.userId}`
				);
				if (coursesRes.ok) {
					setCourses(await coursesRes.json());
				}

				// Clear selection and hide registration
				setSelectedCourses([]);
				setShowRegistration(false);
			} else {
				const errorData = await res.json();
				setError(errorData.error || "Failed to enroll in courses");
			}
		} catch (err) {
			console.error("Failed to register for courses:", err);
			setError("An error occurred. Please try again.");
		} finally {
			setIsRegistering(false);
		}
	};

	const handleEnroll = async (courseId: string) => {
		try {
			const res = await fetch("/api/onboarding/enroll", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ courseIds: [courseId] }),
			});

			if (res.ok) {
				// Refresh courses to show the newly enrolled course
				const coursesRes = await fetch(
					`/api/student/courses?studentId=${session.userId}`
				);
				if (coursesRes.ok) {
					setCourses(await coursesRes.json());
				}

				// Refresh available courses to remove the enrolled one
				const availableRes = await fetch(`/api/onboarding/courses?level=100`);
				if (availableRes.ok) {
					const data = await availableRes.json();
					setAvailableCourses(data.courses || []);
				}
			}
		} catch (err) {
			console.error("Failed to enroll in course:", err);
		}
	};

	if (!session || session.role !== "student") {
		return null;
	}

	return (
		<div className="min-h-screen bg-background">
			<Header />
			<Sidebar />
			<main
				className={`transition-all duration-200 ${
					sidebarOpen ? "lg:ml-64" : ""
				}`}
			>
				<div className="p-6 space-y-6">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-3xl font-bold text-foreground">
								Course Registration
							</h1>
							<p className="text-muted-foreground mt-1">
								Register for your courses this semester
							</p>
						</div>
						<Button
							onClick={() => setShowRegistration(!showRegistration)}
							variant="outline"
							className="gap-2"
						>
							<Plus className="h-4 w-4" />
							{showRegistration ? "View My Courses" : "Course Registration"}
						</Button>
					</div>

					{/* Error Display */}
					{error && (
						<div className="flex gap-3 rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
							<div className="flex-1">
								<p>{error}</p>
							</div>
							<button
								onClick={() => setError("")}
								className="p-1 hover:bg-destructive/20 rounded transition-colors"
								title="Dismiss error"
							>
								<X className="h-4 w-4" />
							</button>
						</div>
					)}

					{/* Course Registration Portal */}
					{showRegistration ? (
						<div className="space-y-6">
							{/* Search Bar */}
							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="Search courses by code or name..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="pl-10"
								/>
							</div>

							<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
								{/* Available Courses List */}
								<div>
									<h3 className="text-lg font-semibold mb-4">
										Available Courses
									</h3>
									<div className="space-y-3 max-h-96 overflow-y-auto border border-border rounded-lg p-4">
										{loading ? (
											<div className="text-center text-muted-foreground">
												Loading courses...
											</div>
										) : filteredCourses.length === 0 ? (
											<div className="text-center text-muted-foreground">
												No courses found
											</div>
										) : (
											filteredCourses.map((course) => {
												const isSelected = selectedCourses.find(
													(c) => c._id === course._id
												);
												return (
													<div
														key={course._id}
														className={`p-3 border rounded-lg cursor-pointer transition-colors ${
															isSelected
																? "border-primary bg-primary/10"
																: "border-border hover:bg-muted"
														}`}
														onClick={() => addToSelected(course)}
													>
														<div className="flex justify-between items-start">
															<div className="flex-1">
																<div className="font-medium text-sm">
																	{course.course_code}
																</div>
																<div className="text-xs text-muted-foreground">
																	{course.course_name}
																</div>
																<div className="text-xs text-muted-foreground">
																	Level {course.level}
																</div>
															</div>
															{isSelected ? (
																<div className="text-primary">
																	<Plus className="h-4 w-4" />
																</div>
															) : (
																<div className="text-muted-foreground">
																	<Plus className="h-4 w-4" />
																</div>
															)}
														</div>
													</div>
												);
											})
										)}
									</div>
								</div>

								{/* Selected Courses Cart */}
								<div>
									<h3 className="text-lg font-semibold mb-4">
										Selected Courses ({selectedCourses.length})
									</h3>
									<div className="space-y-3 max-h-96 overflow-y-auto border border-border rounded-lg p-4">
										{selectedCourses.length === 0 ? (
											<div className="text-center text-muted-foreground">
												No courses selected. Click on courses to add them here.
											</div>
										) : (
											selectedCourses.map((course) => (
												<div
													key={course._id}
													className="p-3 border border-border rounded-lg bg-muted/50"
												>
													<div className="flex justify-between items-start">
														<div className="flex-1">
															<div className="font-medium text-sm">
																{course.course_code}
															</div>
															<div className="text-xs text-muted-foreground">
																{course.course_name}
															</div>
															<div className="text-xs text-muted-foreground">
																Level {course.level}
															</div>
														</div>
														<button
															onClick={() => removeFromSelected(course._id)}
															className="text-destructive hover:text-destructive/80 p-1"
															title="Remove course"
														>
															<X className="h-4 w-4" />
														</button>
													</div>
												</div>
											))
										)}
									</div>

									{selectedCourses.length > 0 && (
										<div className="mt-4 space-y-2">
											<div className="text-sm text-muted-foreground">
												Total: {selectedCourses.length} course
												{selectedCourses.length !== 1 ? "s" : ""} selected
											</div>
											<Button
												onClick={handleRegister}
												disabled={isRegistering}
												className="w-full"
												size="lg"
											>
												{isRegistering ? (
													<>
														<div className="inline-block w-4 h-4 mr-2 border-2 border-current border-t-transparent border-r-transparent animate-spin rounded-full border-l-transparent border-b-transparent"></div>
														Registering...
													</>
												) : (
													`Register for ${selectedCourses.length} Course${
														selectedCourses.length !== 1 ? "s" : ""
													}`
												)}
											</Button>
										</div>
									)}
								</div>
							</div>
						</div>
					) : (
						/* Enrolled Courses View */
						<div>
							<h2 className="text-xl font-semibold mb-4">
								My Enrolled Courses
							</h2>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
								{loading ? (
									<div className="text-center text-muted-foreground">
										Loading courses...
									</div>
								) : courses.length === 0 ? (
									<div className="text-center text-muted-foreground py-8 col-span-full">
										No courses enrolled. Click "Course Registration" to get
										started.
									</div>
								) : (
									courses.map((course) => (
										<a
											key={course._id}
											href={`/student/courses/${course._id}`}
											className="group"
										>
											<Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
												<CardHeader>
													<div className="space-y-1">
														<div className="text-sm font-mono text-primary">
															{course.course_code}
														</div>
														<CardTitle className="group-hover:text-primary transition-colors">
															{course.course_name}
														</CardTitle>
													</div>
												</CardHeader>
												<CardContent className="space-y-4">
													<div className="flex items-center gap-2 text-sm text-muted-foreground">
														<Users className="h-4 w-4" />
														<span>{course.lecturer_name}</span>
													</div>
													<div className="text-sm">
														<div className="text-muted-foreground">
															{course.assignments_count} active assignment(s)
														</div>
													</div>
												</CardContent>
											</Card>
										</a>
									))
								)}
							</div>
						</div>
					)}
				</div>
			</main>
		</div>
	);
}
