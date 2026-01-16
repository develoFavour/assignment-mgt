"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
	ClipboardCheck,
	Search,
	FileText,
	Clock,
	CheckCircle2,
	User,
	Calendar,
	AlertCircle,
	Download,
	X,
} from "lucide-react";
import { LoadingSpinner } from "@/components/loading-spinner";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Submission {
	_id: string;
	assignment_id: string;
	student_id: string;
	student_name: string;
	assignment_title: string;
	submitted_at: string;
	is_late: boolean;
	hours_late: number;
	file_urls: string[];
	status: string;
	total_marks?: number;
	grade_data?: {
		score: number;
		final_score: number;
		feedback: string | null;
		graded_at: string;
		penalty_applied: number;
	} | null;
}

export default function GradesPage() {
	const router = useRouter();
	const { session } = useAuthStore();

	const [submissions, setSubmissions] = useState<Submission[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<"pending" | "graded">("pending");

	// Grading modal state
	const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
	const [totalMarks, setTotalMarks] = useState(100);
	const [score, setScore] = useState("");
	const [feedback, setFeedback] = useState("");
	const [isGrading, setIsGrading] = useState(false);

	useEffect(() => {
		if (session?.userId) {
			fetchSubmissions();
		}
	}, [session]);

	const fetchSubmissions = async () => {
		if (!session?.userId) return;
		setLoading(true);
		try {
			// Fetch all submissions for accurate stats, then filter locally
			const res = await fetch(
				`/api/lecturer/submissions?lecturerId=${session.userId}&status=all`
			);
			if (res.ok) {
				setSubmissions(await res.json());
			}
		} catch (err) {
			console.error("Failed to fetch submissions:", err);
			toast.error("Failed to load submissions");
		} finally {
			setLoading(false);
		}
	};

	const handleGradeSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedSubmission || !score) return;

		const numScore = Number.parseFloat(score);
		if (numScore < 0 || numScore > totalMarks) {
			toast.error(`Score must be between 0 and ${totalMarks}`);
			return;
		}

		setIsGrading(true);
		try {
			const res = await fetch(
				`/api/lecturer/submissions/${selectedSubmission._id}/grade?lecturerId=${session?.userId}`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ score: numScore, feedback }),
				}
			);

			if (res.ok) {
				toast.success("Grade submitted successfully!");
				setSelectedSubmission(null);
				setScore("");
				setFeedback("");
				fetchSubmissions(); // Refresh list and stats
			} else {
				const data = await res.json();
				toast.error(data.error || "Failed to submit grade");
			}
		} catch (err) {
			toast.error("An error occurred while grading");
		} finally {
			setIsGrading(false);
		}
	};

	// Fetch assignment details when submission is selected
	useEffect(() => {
		const fetchAssignmentDetails = async () => {
			if (!selectedSubmission) {
				setTotalMarks(100);
				return;
			}

			// Pre-fill score and feedback if viewing a graded submission
			if (selectedSubmission.grade_data) {
				setScore(selectedSubmission.grade_data.score.toString());
				setFeedback(selectedSubmission.grade_data.feedback || "");
			} else {
				setScore("");
				setFeedback("");
			}

			// Use total_marks from submission if available, otherwise fetch
			if (selectedSubmission.total_marks) {
				setTotalMarks(selectedSubmission.total_marks);
				return;
			}

			try {
				const res = await fetch(`/api/lecturer/assignments/${selectedSubmission.assignment_id}?lecturerId=${session?.userId}`);
				if (res.ok) {
					const data = await res.json();
					setTotalMarks(data.total_marks || 100);
				}
			} catch (err) {
				setTotalMarks(100);
			}
		};
		fetchAssignmentDetails();
	}, [selectedSubmission, session]);

	const filteredSubmissions = submissions.filter((sub) => {
		const matchesSearch =
			sub.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			sub.assignment_title.toLowerCase().includes(searchQuery.toLowerCase());

		const matchesStatus = statusFilter === "pending"
			? (sub.status === "submitted" || sub.status === "pending")
			: sub.status === "graded";

		return matchesSearch && matchesStatus;
	});

	if (!session || session.role !== "lecturer") return null;

	return (
		<div className="p-6 space-y-8 max-w-7xl mx-auto">
			{/* Header */}
			<div className="space-y-1">
				<div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
					<ClipboardCheck className="h-4 w-4" />
					Grading Center
				</div>
				<h1 className="text-4xl font-black tracking-tight text-slate-900">
					Submissions.
				</h1>
				<p className="text-slate-500 font-medium">
					Review and grade student work with detailed feedback.
				</p>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<Card className="border-none shadow-sm bg-white rounded-3xl">
					<CardContent className="p-6 flex items-center gap-4">
						<div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
							<Clock className="h-6 w-6" />
						</div>
						<div>
							<div className="text-2xl font-black text-slate-900">
								{submissions.filter(s => s.status === "submitted").length}
							</div>
							<div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
								Pending Review
							</div>
						</div>
					</CardContent>
				</Card>
				<Card className="border-none shadow-sm bg-white rounded-3xl">
					<CardContent className="p-6 flex items-center gap-4">
						<div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
							<CheckCircle2 className="h-6 w-6" />
						</div>
						<div>
							<div className="text-2xl font-black text-slate-900">
								{submissions.filter(s => s.status === "graded").length}
							</div>
							<div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
								Total Graded
							</div>
						</div>
					</CardContent>
				</Card>
				<Card className="border-none shadow-sm bg-white rounded-3xl">
					<CardContent className="p-6 flex items-center gap-4">
						<div className="h-12 w-12 rounded-2xl bg-red-500/10 text-red-600 flex items-center justify-center">
							<AlertCircle className="h-6 w-6" />
						</div>
						<div>
							<div className="text-2xl font-black text-slate-900">
								{submissions.filter(s => s.is_late).length}
							</div>
							<div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
								Late Submissions
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Filters */}
			<div className="flex flex-col sm:flex-row gap-4">
				<div className="relative flex-1 group">
					<Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-primary transition-colors" />
					<Input
						placeholder="Search by student or assignment..."
						className="pl-11 h-12 rounded-2xl bg-white border-slate-100 shadow-sm focus-visible:ring-2 focus-visible:ring-primary/20 font-medium"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>
				<div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
					{(["pending", "graded"] as const).map((status) => (
						<button
							key={status}
							onClick={() => setStatusFilter(status)}
							className={cn(
								"px-6 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all",
								statusFilter === status
									? "bg-primary/10 text-primary"
									: "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
							)}
						>
							{status}
						</button>
					))}
				</div>
			</div>

			{/* Submissions List */}
			<Card className="border-none shadow-sm bg-white rounded-[32px] overflow-hidden">
				<CardContent className="p-0">
					{loading ? (
						<div className="flex flex-col items-center justify-center py-24 space-y-4">
							<LoadingSpinner size="lg" />
							<p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">
								Loading Submissions...
							</p>
						</div>
					) : filteredSubmissions.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-24 text-center">
							<div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center mb-6">
								<ClipboardCheck className="h-8 w-8 text-slate-200" />
							</div>
							<h3 className="text-xl font-black text-slate-900 tracking-tight">
								All Clear!
							</h3>
							<p className="text-slate-500 font-medium mt-1">
								No {statusFilter} submissions at the moment.
							</p>
						</div>
					) : (
						<div className="divide-y divide-slate-50">
							{filteredSubmissions.map((submission) => (
								<div
									key={submission._id}
									className="p-6 hover:bg-slate-50/50 transition-colors group"
								>
									<div className="flex items-start justify-between gap-4">
										<div className="flex-1 space-y-3">
											<div className="flex items-center gap-3 flex-wrap">
												<div className="flex items-center gap-2">
													<div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm">
														{submission.student_name.split(" ").map(n => n[0]).join("")}
													</div>
													<div>
														<h3 className="font-black text-slate-900 leading-tight">
															{submission.student_name}
														</h3>
														<p className="text-xs text-slate-400 font-bold">
															{submission.assignment_title}
														</p>
													</div>
												</div>
												{submission.is_late && (
													<Badge className="bg-orange-50 text-orange-600 border-none font-bold px-2 py-1 rounded-lg">
														<AlertCircle className="h-3 w-3 mr-1" />
														{Math.ceil(submission.hours_late / 24)}d late
													</Badge>
												)}
											</div>

											<div className="flex items-center gap-4 text-xs font-bold text-slate-400">
												<div className="flex items-center gap-1.5">
													<Calendar className="h-3.5 w-3.5" />
													{new Date(submission.submitted_at).toLocaleDateString()}
												</div>
												<div className="flex items-center gap-1.5">
													<FileText className="h-3.5 w-3.5" />
													{submission.file_urls.length} file(s)
												</div>
												{submission.grade_data && (
													<div className="flex items-center gap-1.5 text-emerald-600">
														<CheckCircle2 className="h-3.5 w-3.5" />
														Score: {submission.grade_data.final_score}/{submission.total_marks || 100}
													</div>
												)}
											</div>
										</div>

										<Button
											onClick={() => setSelectedSubmission(submission)}
											variant={statusFilter === "pending" ? "default" : "outline"}
											className="rounded-2xl font-black shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
										>
											{statusFilter === "pending" ? "Grade Now" : "View Feedback"}
										</Button>
									</div>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Grading Modal */}
			{selectedSubmission && (
				<div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
					<div
						className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
						onClick={() => setSelectedSubmission(null)}
					/>
					<div className="relative w-full max-w-3xl bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] overflow-y-auto">
						<div className="p-8 space-y-6">
							{/* Header */}
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-3">
									<div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
										<ClipboardCheck className="h-6 w-6" />
									</div>
									<div>
										<h2 className="text-2xl font-black text-slate-900 tracking-tight">
											{selectedSubmission.grade_data ? "Grading Details" : "Grade Submission"}
										</h2>
										<p className="text-slate-500 text-sm font-medium">
											{selectedSubmission.student_name} • {selectedSubmission.assignment_title}
										</p>
									</div>
								</div>
								<button
									onClick={() => setSelectedSubmission(null)}
									className="p-2 rounded-xl hover:bg-slate-50 text-slate-400"
								>
									<X className="h-5 w-5" />
								</button>
							</div>

							{/* Submission Info */}
							<div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl">
								<div>
									<div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
										Submitted
									</div>
									<div className="text-sm font-bold text-slate-900 mt-1">
										{new Date(selectedSubmission.submitted_at).toLocaleString()}
									</div>
								</div>
								<div>
									<div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
										Status
									</div>
									<div className="text-sm font-bold text-slate-900 mt-1">
										{selectedSubmission.is_late ? (
											<span className="text-orange-600 font-bold">
												Late ({Math.ceil(selectedSubmission.hours_late / 24)} days)
											</span>
										) : (
											<span className="text-emerald-600 font-bold">On Time</span>
										)}
									</div>
								</div>
							</div>

							{/* Files */}
							<div className="space-y-3">
								<h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
									Submitted Files
								</h3>
								<div className="space-y-2">
									{selectedSubmission.file_urls.map((url, i) => (
										<a
											key={i}
											href={url}
											target="_blank"
											rel="noopener noreferrer"
											className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group"
										>
											<div className="h-10 w-10 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400">
												<FileText className="h-5 w-5" />
											</div>
											<span className="text-sm font-bold text-slate-600 flex-1">
												Attachment {i + 1}
											</span>
											<Download className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors" />
										</a>
									))}
								</div>
							</div>

							{/* Grading Form or Display */}
							{selectedSubmission.grade_data ? (
								<div className="space-y-6 pt-6 border-t border-slate-100">
									<div className="grid grid-cols-2 gap-6">
										<div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-100/50">
											<div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-2">Final Score</div>
											<div className="text-4xl font-black text-emerald-700">
												{selectedSubmission.grade_data.final_score}
												<span className="text-lg text-emerald-600/60 ml-1">/ {totalMarks}</span>
											</div>
										</div>
										<div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
											<div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Graded On</div>
											<div className="text-sm font-bold text-slate-900">
												{new Date(selectedSubmission.grade_data.graded_at).toLocaleDateString()}
											</div>
											<div className="text-xs text-slate-500 mt-1 font-medium">
												{new Date(selectedSubmission.grade_data.graded_at).toLocaleTimeString()}
											</div>
										</div>
									</div>

									{selectedSubmission.grade_data.penalty_applied > 0 && (
										<div className="p-4 rounded-xl bg-amber-50 text-amber-700 text-xs font-bold flex items-center gap-2">
											<AlertCircle className="h-4 w-4" />
											Late Penalty Applied: -{selectedSubmission.grade_data.penalty_applied} marks
										</div>
									)}

									<div className="space-y-2">
										<div className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Lecturer Feedback</div>
										<div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 text-slate-700 font-medium leading-relaxed italic">
											"{selectedSubmission.grade_data.feedback || "No feedback provided."}"
										</div>
									</div>

									<Button onClick={() => setSelectedSubmission(null)} className="w-full h-14 rounded-2xl font-black">
										Done
									</Button>
								</div>
							) : (
								<form onSubmit={handleGradeSubmit} className="space-y-6 pt-6 border-t border-slate-100">
									<div className="space-y-2">
										<label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
											Score (0-{totalMarks})
										</label>
										<Input
											type="number"
											min="0"
											max={totalMarks}
											step="0.1"
											placeholder={`Enter score out of ${totalMarks}...`}
											className="h-12 rounded-xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-primary/20 text-lg font-bold"
											value={score}
											onChange={(e) => setScore(e.target.value)}
											required
										/>
									</div>

									<div className="space-y-2">
										<label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
											Feedback (Optional)
										</label>
										<textarea
											placeholder="Provide constructive feedback..."
											className="w-full px-4 py-3 border-none bg-slate-50 rounded-xl min-h-32 resize-none focus:ring-2 focus:ring-primary/20 outline-none font-medium"
											value={feedback}
											onChange={(e) => setFeedback(e.target.value)}
										/>
									</div>

									<div className="flex gap-3">
										<Button
											type="button"
											variant="outline"
											onClick={() => setSelectedSubmission(null)}
											className="h-14 flex-1 rounded-2xl font-bold"
										>
											Cancel
										</Button>
										<Button
											type="submit"
											disabled={isGrading || !score}
											className="h-14 flex-[2] rounded-2xl bg-primary font-black shadow-xl shadow-primary/20"
										>
											{isGrading ? <LoadingSpinner size="sm" /> : "Submit Grade"}
										</Button>
									</div>
								</form>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
