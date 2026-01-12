"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { useAuthStore } from "@/lib/store";
import { useUIStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, Clock, CheckCircle, GraduationCap, Calendar, BookOpen, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function StudentDashboard() {
  const router = useRouter();
  const { session } = useAuthStore();
  const { sidebarOpen } = useUIStore();
  const [stats, setStats] = useState({ active: 0, submitted: 0, graded: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      router.push("/login");
    } else if (session.role !== "student") {
      router.push("/");
    }
  }, [session, router]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/student/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      } finally {
        setLoading(false);
      }
    };

    if (session?.role === "student") {
      fetchStats();
    }
  }, [session]);

  if (!session || session.role !== "student") {
    return null;
  }

  const statCards = [
    {
      label: "Assignments",
      value: stats.active,
      icon: FileText,
      color: "text-blue-600",
      bg: "bg-blue-500/10",
      desc: "Currently active"
    },
    {
      label: "Submitted",
      value: stats.submitted,
      icon: Clock,
      color: "text-purple-600",
      bg: "bg-purple-500/10",
      desc: "Awaiting grading"
    },
    {
      label: "Graded",
      value: stats.graded,
      icon: CheckCircle,
      color: "text-emerald-600",
      bg: "bg-emerald-500/10",
      desc: "Final results in"
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar />
      <main className={cn(
        "transition-all duration-300 pt-16",
        sidebarOpen ? "lg:ml-64" : ""
      )}>
        <div className="p-6 lg:p-10 space-y-8 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                <GraduationCap className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  Student Portal
                </h1>
                <p className="text-muted-foreground mt-0.5 font-medium">
                  Welcome back, {session.email?.split('@')[0] || "Student"}.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="gap-2 rounded-xl">
                <Calendar className="h-4 w-4" />
                Schedule
              </Button>
              <Button className="gap-2 rounded-xl shadow-lg shadow-primary/20">
                View Courses
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label} className="border-none shadow-xl shadow-primary/5 hover:shadow-primary/10 transition-all duration-300 group overflow-hidden relative">
                  <div className={cn("absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10 transition-transform group-hover:scale-110", stat.bg)} />
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                      {stat.label}
                    </CardTitle>
                    <div className={cn("p-2 rounded-xl", stat.bg)}>
                      <Icon className={cn("h-5 w-5", stat.color)} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold tracking-tight">{loading ? "..." : stat.value}</div>
                    <p className="text-xs text-muted-foreground font-medium mt-1">{stat.desc}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 border-none shadow-xl shadow-primary/5 bg-card/50 backdrop-blur-sm overflow-hidden">
              <CardHeader className="border-b border-border/50 pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Quick Access</CardTitle>
                    <CardDescription>Academic tools and resources</CardDescription>
                  </div>
                  <BookOpen className="h-5 w-5 text-primary opacity-20" />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                  <a
                    href="/student/courses"
                    className="flex items-center justify-between p-6 hover:bg-muted/50 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600 group-hover:scale-110 transition-transform">
                        <BookOpen className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="font-bold text-base text-foreground group-hover:text-primary transition-colors">Course Materials</div>
                        <div className="text-sm text-muted-foreground">Access your lessons, notes and study guides</div>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </a>
                  <a
                    href="/student/assignments"
                    className="flex items-center justify-between p-6 hover:bg-muted/50 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-600 group-hover:scale-110 transition-transform">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="font-bold text-base text-foreground group-hover:text-primary transition-colors">Assignment Center</div>
                        <div className="text-sm text-muted-foreground">View requirements and upload your submissions</div>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl shadow-primary/5 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl">Upcoming Deadlines</CardTitle>
                <CardDescription>Don't miss these important dates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Clock className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm font-bold text-foreground/70">Clear Schedule</p>
                  <p className="text-xs text-muted-foreground mt-1 px-6 leading-relaxed">
                    You have no outstanding assignments due in the next 7 days.
                  </p>
                  <Button variant="ghost" className="mt-6 text-xs font-bold text-primary hover:bg-primary/5">
                    View Full Calendar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

