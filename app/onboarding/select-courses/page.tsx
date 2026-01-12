"use client";

import type React from "react";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormError } from "@/components/form-error";
import { LoadingSpinner } from "@/components/loading-spinner";
import { useAuthStore } from "@/lib/store";
import { BookOpen, CheckCircle2, ArrowRight, GraduationCap, ShieldCheck, Search, Filter, X, LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";

interface Course {
  _id: string;
  course_code: string;
  course_name: string;
  level: number;
}

export default function SelectCoursesPage() {
  const router = useRouter();
  const { session } = useAuthStore();
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [studentLevel, setStudentLevel] = useState<number | null>(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState<number | "all">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const levelParam = (session as any)?.level || "";
        const res = await fetch(`/api/onboarding/courses${levelParam ? `?level=${levelParam}` : ""}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to load courses");
          return;
        }

        setAllCourses(data.courses || []);
        setStudentLevel(data.studentLevel);
        // Set initial filter to student's level if available
        if (data.studentLevel) setLevelFilter(data.studentLevel);
      } catch (err) {
        setError("An error occurred while loading courses");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session]);

  // Optimized filtering logic
  const filteredCourses = useMemo(() => {
    return allCourses.filter((course) => {
      const matchesSearch =
        course.course_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.course_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLevel = levelFilter === "all" || course.level === levelFilter;
      return matchesSearch && matchesLevel;
    });
  }, [allCourses, searchTerm, levelFilter]);

  const toggleCourse = (courseId: string) => {
    setSelectedCourses((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
    );
  };

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (selectedCourses.length === 0) {
      setError("Please select your courses to complete enrollment.");
      return;
    }

    if (!session?.userId) {
      setError("User session expired. Please sign in again.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/onboarding/enroll?studentId=${session.userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseIds: selectedCourses }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to finalize enrollment");
        return;
      }

      router.push("/student");
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AuthLayout>
        <div className="flex flex-col items-center justify-center space-y-4 min-h-[500px]">
          <div className="relative">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 animate-pulse" />
            <LoadingSpinner size="lg" className="absolute inset-0" />
          </div>
          <div className="text-center">
            <p className="text-sm font-black text-foreground uppercase tracking-widest">Accessing Catalog</p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] mt-1">Verifying Credentials</p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="space-y-8 w-full max-w-2xl mx-auto">
        {/* Header Branding */}
        <div className="lg:hidden flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <span className="text-lg font-black tracking-tighter uppercase">Hallmark</span>
        </div>

        {/* Title Section */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center gap-2">
            <div className="px-2 py-0.5 rounded-md bg-primary text-[10px] font-black text-white uppercase tracking-wider">Step 02</div>
            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[.2em]">Academic Catalog</div>
          </div>
          <h2 className="text-4xl font-black tracking-tighter text-foreground">Course Explorer.</h2>
          <p className="text-muted-foreground font-medium max-w-md">
            Securely select your enrolled courses from the university database.
          </p>
        </div>

        {/* Explorer Toolbar */}
        <div className="space-y-4 bg-muted/30 p-4 rounded-3xl border border-border/50">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search code or title..."
                className="pl-11 pr-10 border-none shadow-none bg-white/80 dark:bg-background/80 rounded-2xl h-12 text-sm font-medium focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 bg-white/50 dark:bg-black/20 p-1.5 rounded-2xl border border-border/40 backdrop-blur-sm">
              {[100, 200, 300, 400, "all"].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setLevelFilter(lvl as any)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    levelFilter === lvl
                      ? "bg-primary text-white shadow-md shadow-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {lvl === "all" ? "All" : `${lvl}L`}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between px-2">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Showing {filteredCourses.length} of {allCourses.length} Courses
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={cn("p-1.5 rounded-md transition-all", viewMode === "grid" ? "text-primary bg-primary/10" : "text-muted-foreground")}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn("p-1.5 rounded-md transition-all", viewMode === "list" ? "text-primary bg-primary/10" : "text-muted-foreground")}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleEnroll} className="space-y-8">
          {error && <FormError message={error} />}

          {/* Results Area */}
          <div className={cn(
            "min-h-[300px] max-h-[480px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent transition-all",
            viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 gap-3" : "flex flex-col gap-2"
          )}>
            {filteredCourses.length === 0 ? (
              <div className={cn(
                "flex flex-col items-center justify-center py-20 text-center opacity-50",
                viewMode === "grid" ? "col-span-2" : "w-full"
              )}>
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Filter className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-black uppercase tracking-widest">No Matches Found</p>
                <p className="text-xs font-medium mt-1">Adjust filters or search term.</p>
              </div>
            ) : (
              filteredCourses.map((course) => {
                const isSelected = selectedCourses.includes(course._id);
                return (
                  <button
                    type="button"
                    key={course._id}
                    onClick={() => toggleCourse(course._id)}
                    className={cn(
                      "text-left transition-all duration-300 relative group overflow-hidden",
                      viewMode === "list"
                        ? "flex items-center justify-between p-4 rounded-2xl border"
                        : "flex flex-col p-5 rounded-3xl border h-full",
                      isSelected
                        ? "border-primary bg-primary/[0.03] ring-1 ring-primary/20 shadow-xl shadow-primary/5"
                        : "border-border/60 hover:border-primary/40 hover:bg-muted/30"
                    )}
                  >
                    {/* Level Indicator for Grid View */}
                    {viewMode === "grid" && (
                      <div className={cn(
                        "absolute top-3 right-3 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-tighter transition-colors",
                        isSelected ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                      )}>
                        {course.level} Level
                      </div>
                    )}

                    <div className={cn("flex items-center gap-4")}>
                      <div className={cn(
                        "h-10 w-10 flex-shrink-0 rounded-xl flex items-center justify-center transition-all duration-500",
                        isSelected ? "bg-primary text-white rotate-6 scale-110" : "bg-muted/50 text-muted-foreground/40 group-hover:bg-primary/10 group-hover:text-primary/60 group-hover:rotate-0"
                      )}>
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <div className="space-y-0.5">
                        <div className={cn("text-sm font-black tracking-tight transition-colors", isSelected ? "text-primary" : "text-foreground")}>
                          {course.course_code}
                        </div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none truncate max-w-[180px]">
                          {course.course_name}
                        </div>
                      </div>
                    </div>

                    {viewMode === "list" && (
                      <div className={cn(
                        "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all",
                        isSelected ? "bg-primary border-primary scale-110" : "border-muted group-hover:border-primary/40 shadow-inner"
                      )}>
                        {isSelected && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Submission Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 border-t border-border/50">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {selectedCourses.slice(0, 3).map((_, i) => (
                  <div key={i} className="h-10 w-10 rounded-full border-2 border-background bg-primary/10 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  </div>
                ))}
                {selectedCourses.length > 3 && (
                  <div className="h-10 w-10 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-black">
                    +{selectedCourses.length - 3}
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-base font-black text-foreground leading-none">
                  {selectedCourses.length} Courses
                </span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Selected Payload</span>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full sm:w-auto px-12 h-14 text-base font-black rounded-3xl shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 group"
              disabled={submitting || selectedCourses.length === 0}
            >
              {submitting ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <span>Finalize Enrollment</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Footer Disclaimer */}
        <div className="flex items-center gap-4 text-muted-foreground/30">
          <ShieldCheck className="h-4 w-4" />
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] leading-relaxed">
            Official Enrollment Registry &bull; Verified via SSO
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
