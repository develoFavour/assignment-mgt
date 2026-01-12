"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { useAuthStore, useUIStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/loading-spinner";
import { FileUpload } from "@/components/file-upload";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  FileText,
  Download,
  ChevronLeft,
  UploadCloud
} from "lucide-react";
import { toast } from "sonner";

interface AssignmentDetail {
  _id: string;
  title: string;
  description: string;
  deadline: string;
  course_code: string;
  course_name: string;
  lecturer_name: string;
  created_at: string;
  is_late_allowed: boolean;
  cutoff_days: number;
  penalty_percent: number;
}

interface Submission {
  _id: string;
  submitted_at: string;
  is_late: boolean;
  hours_late: number;
  file_urls: string[];
  status: string;
}

interface Grade {
  score: number;
  feedback?: string;
  final_score: number;
  penalty_applied: number;
  graded_at: string;
}

export default function AssignmentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { session, hydrateFromCookie } = useAuthStore();
  const { sidebarOpen } = useUIStore();

  // Convert params.id to string to satisfy type checker if necessary, mainly dealing with async params in Next 15 if strict
  // But useParams usually returns string | string[]
  const assignmentId = params.id as string;

  const [assignment, setAssignment] = useState<AssignmentDetail | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [grade, setGrade] = useState<Grade | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSessionChecked, setIsSessionChecked] = useState(false);

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const checkSession = () => {
      if (!session) {
        hydrateFromCookie();
      }
      setIsSessionChecked(true);
    };
    checkSession();
  }, [session, hydrateFromCookie]);

  useEffect(() => {
    if (isSessionChecked && !session) {
      router.push("/login");
    } else if (session && session.role !== "student") {
      router.push("/");
    }
  }, [session, isSessionChecked, router]);

  useEffect(() => {
    const fetchDetailedData = async () => {
      if (!session?.userId) return;
      try {
        const res = await fetch(`/api/student/assignments/${assignmentId}?studentId=${session.userId}`);
        if (res.ok) {
          const data = await res.json();
          setAssignment(data.assignment);
          setSubmission(data.submission || null);
          setGrade(data.grade || null);
        } else {
          toast.error("Cloud resource not found");
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to sync assignment data");
      } finally {
        setLoading(false);
      }
    };

    if (session?.role === "student" && assignmentId) {
      fetchDetailedData();
    }
  }, [session, assignmentId]);

  const handleSubmitWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadedFiles.length === 0) {
      toast.error("Please attach at least one file");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    uploadedFiles.forEach(file => formData.append("files", file));

    try {
      // Using the studentId param as per your API design
      const res = await fetch(`/api/student/assignments/${assignmentId}/submit?studentId=${session?.userId}`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission rejected");

      setSubmission(data.submission);
      setUploadedFiles([]);
      toast.success("Work submitted successfully!");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session || session.role !== "student") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // logic for deadline check
  const isDeadlinePassed = assignment ? new Date() > new Date(assignment.deadline) : false;
  const canSubmit = assignment && !submission && (!isDeadlinePassed || (assignment.is_late_allowed));

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />
      <Sidebar />

      <main className={cn(
        "pt-20 px-4 pb-12 transition-all duration-300 min-h-screen",
        sidebarOpen ? "lg:pl-[280px]" : "lg:pl-24"
      )}>
        <div className="max-w-5xl mx-auto">

          {/* Back Nav */}
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-2 text-slate-400 hover:text-primary transition-colors mb-6 text-sm font-bold"
          >
            <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Coursework
          </button>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
              <LoadingSpinner size="lg" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest animate-pulse">Syncing Details...</p>
            </div>
          ) : !assignment ? (
            <div className="text-center py-20 text-slate-400 font-medium">Assignment data unavailable</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* Left Column: Assignment Details */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {assignment.course_code}
                      </div>
                      <h1 className="text-2xl font-black text-slate-900 leading-tight">
                        {assignment.title}
                      </h1>
                    </div>
                  </div>

                  <div className="prose prose-slate max-w-none mb-8">
                    <p className="text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">
                      {assignment.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-500 border-t border-slate-50 pt-6">
                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg">
                      <FileText className="h-3.5 w-3.5" />
                      Posted by {assignment.lecturer_name}
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg">
                      <Calendar className="h-3.5 w-3.5" />
                      Due {new Date(assignment.deadline).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Submission Zone */}
                {!submission && canSubmit && (
                  <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-10 -mt-10 blur-2xl" />

                    <div className="flex items-center gap-3 mb-6 relative">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <UploadCloud className="h-5 w-5" />
                      </div>
                      <h2 className="text-lg font-black text-slate-900">Submit Your Work</h2>
                    </div>

                    <form onSubmit={handleSubmitWork} className="space-y-6 relative">
                      <FileUpload
                        onFilesSelected={setUploadedFiles}
                        maxFiles={5}
                        maxSize={50}
                      />

                      {isDeadlinePassed && (
                        <div className="flex gap-3 p-4 rounded-xl bg-amber-50 text-amber-700 text-sm font-medium border border-amber-100/50">
                          <AlertCircle className="h-5 w-5 flex-shrink-0" />
                          <div>
                            <p className="font-bold">Late Submission Active</p>
                            <p className="text-xs opacity-90 mt-1">
                              You are passing the deadline. A {assignment.penalty_percent}% grade penalty will apply per day late.
                            </p>
                          </div>
                        </div>
                      )}

                      <Button
                        type="submit"
                        disabled={isSubmitting || uploadedFiles.length === 0}
                        className="w-full h-14 rounded-2xl text-base font-black shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                      >
                        {isSubmitting ? <LoadingSpinner size="sm" /> : "Submit Assignment"}
                      </Button>
                    </form>
                  </div>
                )}

                {!canSubmit && !submission && (
                  <div className="p-8 rounded-[32px] bg-slate-100 border border-slate-200 text-center">
                    <div className="h-12 w-12 mx-auto rounded-full bg-slate-200 text-slate-400 flex items-center justify-center mb-4">
                      <Clock className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900">Submission Closed</h3>
                    <p className="text-slate-500 font-medium">The deadline has passed and late submissions are not accepted.</p>
                  </div>
                )}
              </div>

              {/* Right Column: Status & Grade */}
              <div className="space-y-6">
                {/* Submission Status Card */}
                {submission && (
                  <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Status</h3>

                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <CheckCircle className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="font-black text-slate-900">Submitted</div>
                        <div className="text-xs font-bold text-slate-400">
                          {new Date(submission.submitted_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {submission.is_late && (
                      <div className="mb-6 p-3 rounded-xl bg-orange-50 text-orange-700 text-xs font-bold border border-orange-100 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Submitted {Math.ceil(submission.hours_late / 24)} days late
                      </div>
                    )}

                    <div className="space-y-3">
                      <p className="text-xs font-bold text-slate-400 uppercase">Attached Files</p>
                      {submission.file_urls.map((url, i) => (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group"
                        >
                          <div className="h-8 w-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400">
                            <FileText className="h-4 w-4" />
                          </div>
                          <span className="text-xs font-bold text-slate-600 flex-1 truncate">
                            Attachment {i + 1}
                          </span>
                          <Download className="h-3.5 w-3.5 text-slate-300 group-hover:text-primary transition-colors" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Grade Card */}
                {grade && (
                  <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-white pointer-events-none" />
                    <h3 className="text-sm font-black text-indigo-300 uppercase tracking-widest mb-4 relative z-10">Grade Report</h3>

                    <div className="text-center py-6 relative z-10">
                      <div className="text-5xl font-black text-indigo-600 tracking-tighter">
                        {grade.final_score}%
                      </div>
                      {grade.penalty_applied > 0 && (
                        <p className="text-xs font-bold text-slate-400 mt-2">
                          {grade.score}% (Raw) - {grade.penalty_applied}% (Penalty)
                        </p>
                      )}
                    </div>

                    {grade.feedback && (
                      <div className="relative z-10 bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-indigo-50 mt-2">
                        <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1">Feedback</p>
                        <p className="text-sm text-slate-600 font-medium italic">"{grade.feedback}"</p>
                      </div>
                    )}

                    <div className="mt-4 text-center text-[10px] font-bold text-slate-300 relative z-10">
                      Graded on {new Date(grade.graded_at).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
