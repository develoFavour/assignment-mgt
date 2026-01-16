"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	Clock,
	CheckCircle,
	AlertCircle,
	BookOpen,
	Search,
	Filter,
	Calendar,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/loading-spinner";
import { cn } from "@/lib/utils";

interface AssignmentWithStatus {
	_id: string;
	title: string;
	course_code: string;
	course_name: string;
	deadline: string;
	description: string;
	is_submitted: boolean;
	is_graded: boolean;
	grade?: number;
	total_score: number;
	is_late?: boolean;
	hours_late?: number;
}

export default function AssignmentsPage() {
	const router = useRouter();
	const { session } = useAuthStore();
	const [assignments, setAssignments] = useState<AssignmentWithStatus[]>([]);
	const [loading, setLoading] = useState(true);
	const [statusFilter, setStatusFilter] = useState<
		"all" | "pending" | "submitted" | "graded"
	>("all");
	const [searchQuery, setSearchQuery] = useState("");
	useEffect(() => {
		const fetchAssignments = async () => {
			if (!session?.userId) return;
			try {
				const res = await fetch(
					`/api/student/assignments?studentId=${session.userId}&filter=all`
				);
				if (res.ok) {
					setAssignments(await res.json());
				}
			} catch (err) {
				console.error("Failed to fetch assignments:", err);
			} finally {
				setLoading(false);
			}
		};

		if (session?.userId) {
			fetchAssignments();
		}
	}, [session]);

	const filteredAssignments = useMemo(() => {
		return assignments.filter((assignment) => {
			const matchesSearch =
				assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				assignment.course_code
					.toLowerCase()
					.includes(searchQuery.toLowerCase());

			if (!matchesSearch) return false;

			if (statusFilter === "all") return true;
			if (statusFilter === "graded") return assignment.is_graded;
			if (statusFilter === "submitted")
				return assignment.is_submitted && !assignment.is_graded;
			if (statusFilter === "pending") return !assignment.is_submitted;

			return true;
		});
	}, [assignments, searchQuery, statusFilter]);

	const getStatusBadge = (assignment: AssignmentWithStatus) => {
		if (assignment.is_graded) {
			return (
				<Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-none font-bold px-3 py-1 rounded-full flex items-center gap-1.5 transition-colors">
					<CheckCircle className="h-3.5 w-3.5" />
					Graded: {assignment.grade}/{assignment.total_score}
				</Badge>
			);
		}
		if (assignment.is_submitted) {
			return (
				<Badge className="bg-blue-50 text-blue-600 hover:bg-blue-100 border-none font-bold px-3 py-1 rounded-full flex items-center gap-1.5 transition-colors">
					<CheckCircle className="h-3.5 w-3.5" />
					Submitted
				</Badge>
			);
		}
		return (
			<Badge
				variant="outline"
				className="text-slate-500 border-slate-200 font-bold px-3 py-1 rounded-full flex items-center gap-1.5"
			>
				<Clock className="h-3.5 w-3.5" />
				Pending
			</Badge>
		);
	};

	const getDeadlineStatus = (deadline: string, isSubmitted: boolean) => {
		const now = new Date();
		const deadlineDate = new Date(deadline);
		const hoursLeft =
			(deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60);

		if (isSubmitted) return null;

		if (hoursLeft < 0) {
			return (
				<div className="flex items-center gap-1.5 text-xs text-red-500 font-black uppercase tracking-wider bg-red-50 px-2 py-1 rounded-lg w-fit">
					<AlertCircle className="h-3.5 w-3.5" />
					Overdue
				</div>
			);
		}

		if (hoursLeft < 24) {
			return (
				<div className="flex items-center gap-1.5 text-xs text-amber-500 font-black uppercase tracking-wider bg-amber-50 px-2 py-1 rounded-lg w-fit">
					<Clock className="h-3.5 w-3.5" />
					{Math.ceil(hoursLeft)}h left
				</div>
			);
		}

		return (
			<div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold bg-slate-50 px-2 py-1 rounded-lg w-fit">
				<Calendar className="h-3.5 w-3.5" />
				{new Date(deadline).toLocaleDateString(undefined, {
					month: "short",
					day: "numeric",
				})}
			</div>
		);
	};

	if (!session || session.role !== "student") return null;

	return (
		<div className="max-w-5xl mx-auto space-y-8 p-6">
			{/* Header */}
			<div className="space-y-1">
				<div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
					<BookOpen className="h-4 w-4" />
					My Coursework
				</div>
				<h1 className="text-4xl font-black tracking-tight text-slate-900">
					Assignments.
				</h1>
				<p className="text-slate-500 font-medium">
					Track deadlines and submit your academic work.
				</p>
			</div>

			{/* Filters & Search */}
			<div className="flex flex-col sm:flex-row gap-4">
				<div className="relative flex-1 group">
					<Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-primary transition-colors" />
					<Input
						placeholder="Search assignments..."
						className="pl-11 h-12 rounded-2xl bg-white border-slate-100 shadow-sm focus-visible:ring-2 focus-visible:ring-primary/20 font-medium"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>
				<div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
					{(["all", "pending", "submitted", "graded"] as const).map(
						(status) => (
							<button
								key={status}
								onClick={() => setStatusFilter(status)}
								className={cn(
									"px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
									statusFilter === status
										? "bg-primary/10 text-primary"
										: "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
								)}
							>
								{status}
							</button>
						)
					)}
				</div>
			</div>

			{/* Assignment Grid */}
			<div className="space-y-4">
				{loading ? (
					<div className="flex flex-col items-center justify-center py-24 space-y-4">
						<LoadingSpinner size="lg" />
						<p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">
							Loading Tasks...
						</p>
					</div>
				) : filteredAssignments.length === 0 ? (
					<div className="flex flex-col items-center justify-center py-24 text-center">
						<div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center mb-6">
							<BookOpen className="h-8 w-8 text-slate-200" />
						</div>
						<h3 className="text-xl font-black text-slate-900 tracking-tight">
							All Caught Up!
						</h3>
						<p className="text-slate-500 font-medium mt-1">
							No assignments found matching your filter.
						</p>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{filteredAssignments.map((assignment) => (
							<a
								key={assignment._id}
								href={`/student/assignments/${assignment._id}`}
								className="group block"
							>
								<Card className="h-full border-none shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 bg-white rounded-[24px] overflow-hidden">
									<CardContent className="p-6 flex flex-col h-full">
										<div className="flex items-start justify-between gap-4 mb-4">
											<div className="flex items-center gap-2">
												<span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-wider">
													{assignment.course_code}
												</span>
												{getStatusBadge(assignment)}
											</div>
										</div>

										<div className="flex-1 space-y-2">
											<h3 className="text-lg font-black text-slate-900 leading-snug group-hover:text-primary transition-colors">
												{assignment.title}
											</h3>
											<p className="text-sm text-slate-500 font-medium line-clamp-2">
												{assignment.description}
											</p>
										</div>

										<div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
											{getDeadlineStatus(
												assignment.deadline,
												assignment.is_submitted
											)}

											<div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:text-white transition-all">
												<BookOpen className="h-4 w-4" />
											</div>
										</div>
									</CardContent>
								</Card>
							</a>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
