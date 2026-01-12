"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { useAuthStore } from "@/lib/store";
import { useUIStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import type { Assignment } from "@/lib/types";

export default function AssignmentsPage() {
	const router = useRouter();
	const { session } = useAuthStore();
	const { sidebarOpen } = useUIStore();
	const [assignments, setAssignments] = useState<Assignment[]>([]);
	const [courses, setCourses] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [showAddForm, setShowAddForm] = useState(false);
	const [formData, setFormData] = useState({
		course_id: "",
		title: "",
		description: "",
		deadline: "",
		accept_late: true,
		cutoff_days: 7,
		penalty_percent: 10,
	});

	useEffect(() => {
		if (!session) {
			router.push("/login");
		} else if (session.role !== "lecturer") {
			router.push("/");
		}
	}, [session, router]);

	useEffect(() => {
		const fetchData = async () => {
			if (session?.role !== "lecturer") return;
			try {
				const [assignmentsRes, coursesRes] = await Promise.all([
					fetch("/api/lecturer/assignments"),
					fetch("/api/lecturer/courses"),
				]);

				if (assignmentsRes.ok) {
					setAssignments(await assignmentsRes.json());
				}
				if (coursesRes.ok) {
					setCourses(await coursesRes.json());
				}
			} catch (err) {
				console.error("Failed to fetch data:", err);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [session]);

	const handleAddAssignment = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const res = await fetch("/api/lecturer/assignments", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...formData,
					deadline: new Date(formData.deadline),
				}),
			});

			if (res.ok) {
				const data = await res.json();
				setAssignments([...assignments, data.assignment]);
				setFormData({
					course_id: "",
					title: "",
					description: "",
					deadline: "",
					accept_late: true,
					cutoff_days: 7,
					penalty_percent: 10,
				});
				setShowAddForm(false);
			}
		} catch (err) {
			console.error("Failed to add assignment:", err);
		}
	};

	const handleDelete = async (assignmentId: string) => {
		if (confirm("Are you sure you want to delete this assignment?")) {
			try {
				await fetch(`/api/lecturer/assignments/${assignmentId}`, {
					method: "DELETE",
				});
				setAssignments(assignments.filter((a) => a._id !== assignmentId));
			} catch (err) {
				console.error("Failed to delete assignment:", err);
			}
		}
	};

	if (!session || session.role !== "lecturer") {
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
								Assignments
							</h1>
							<p className="text-muted-foreground mt-1">
								Create and manage your assignments
							</p>
						</div>
						<Button
							onClick={() => setShowAddForm(!showAddForm)}
							className="gap-2"
						>
							<Plus className="h-4 w-4" />
							Create Assignment
						</Button>
					</div>

					{showAddForm && (
						<Card>
							<CardHeader>
								<CardTitle>Create New Assignment</CardTitle>
							</CardHeader>
							<CardContent>
								<form onSubmit={handleAddAssignment} className="space-y-4">
									<select
										value={formData.course_id}
										onChange={(e) =>
											setFormData({ ...formData, course_id: e.target.value })
										}
										className="w-full px-3 py-2 border border-input rounded-lg"
										required
									>
										<option value="">Select Course</option>
										{courses.map((course) => (
											<option key={course._id} value={course._id}>
												{course.course_code} - {course.course_name}
											</option>
										))}
									</select>

									<Input
										placeholder="Assignment Title"
										value={formData.title}
										onChange={(e) =>
											setFormData({ ...formData, title: e.target.value })
										}
										required
									/>

									<textarea
										placeholder="Assignment Description"
										value={formData.description}
										onChange={(e) =>
											setFormData({ ...formData, description: e.target.value })
										}
										className="w-full px-3 py-2 border border-input rounded-lg min-h-24 resize-none"
										required
									/>

									<div>
										<label className="text-sm font-medium">Deadline</label>
										<Input
											type="datetime-local"
											value={formData.deadline}
											onChange={(e) =>
												setFormData({ ...formData, deadline: e.target.value })
											}
											required
										/>
									</div>

									<div className="space-y-3 border border-border rounded-lg p-4">
										<div className="flex items-center gap-2">
											<input
												type="checkbox"
												id="accept_late"
												checked={formData.accept_late}
												onChange={(e) =>
													setFormData({
														...formData,
														accept_late: e.target.checked,
													})
												}
											/>
											<label
												htmlFor="accept_late"
												className="text-sm font-medium"
											>
												Accept Late Submissions
											</label>
										</div>

										{formData.accept_late && (
											<div className="grid grid-cols-2 gap-4">
												<div>
													<label className="text-sm font-medium">
														Cutoff Days
													</label>
													<Input
														type="number"
														min="1"
														value={formData.cutoff_days}
														onChange={(e) =>
															setFormData({
																...formData,
																cutoff_days: Number.parseInt(e.target.value),
															})
														}
													/>
												</div>
												<div>
													<label className="text-sm font-medium">
														Penalty %
													</label>
													<Input
														type="number"
														min="0"
														max="100"
														value={formData.penalty_percent}
														onChange={(e) =>
															setFormData({
																...formData,
																penalty_percent: Number.parseInt(
																	e.target.value
																),
															})
														}
													/>
												</div>
											</div>
										)}
									</div>

									<div className="flex gap-2">
										<Button type="submit" className="flex-1">
											Create Assignment
										</Button>
										<Button
											type="button"
											variant="outline"
											onClick={() => setShowAddForm(false)}
										>
											Cancel
										</Button>
									</div>
								</form>
							</CardContent>
						</Card>
					)}

					<Card>
						<CardContent className="pt-6">
							{loading ? (
								<div className="text-center text-muted-foreground">
									Loading assignments...
								</div>
							) : assignments.length === 0 ? (
								<div className="text-center text-muted-foreground py-8">
									No assignments yet
								</div>
							) : (
								<div className="space-y-3">
									{assignments.map((assignment: any) => (
										<div
											key={assignment._id}
											className="p-4 border border-border rounded-lg hover:bg-muted transition-colors flex items-start justify-between"
										>
											<div className="flex-1">
												<h3 className="font-medium text-foreground">
													{assignment.title}
												</h3>
												<p className="text-sm text-muted-foreground mt-1">
													{assignment.course_code}
												</p>
												<p className="text-xs text-muted-foreground mt-2">
													Due: {new Date(assignment.deadline).toLocaleString()}
												</p>
											</div>
											<button
												onClick={() => handleDelete(assignment._id)}
												className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
											>
												<Trash2 className="h-4 w-4 text-destructive" />
											</button>
										</div>
									))}
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</main>
		</div>
	);
}
