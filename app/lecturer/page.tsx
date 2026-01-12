"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { useAuthStore } from "@/lib/store";
import { useUIStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, Users, CheckCircle, Plus, ClipboardCheck, ArrowRight, UserCheck, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/loading-spinner";

interface LecturerStats {
  totalAssignments: number;
  pendingSubmissions: number;
  completedSubmissions: number;
}

export default function LecturerDashboard() {
  const router = useRouter();
  const { session } = useAuthStore();
  const { sidebarOpen } = useUIStore();
  const [stats, setStats] = useState<LecturerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      router.push("/login");
    } else if (session.role !== "lecturer") {
      router.push("/");
    }
  }, [session, router]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!session?.userId) return;
      try {
        const res = await fetch(`/api/lecturer/stats?lecturerId=${session.userId}`);
        const data = await res.json();
        if (res.ok) {
          setStats(data);
        }
      } catch (err) {
        console.error("Failed to fetch lecturer stats:", err);
      } finally {
        setLoading(false);
      }
    };

    if (session?.role === "lecturer") {
      fetchStats();
    }
  }, [session]);

  if (!session || session.role !== "lecturer") {
    return null;
  }

  const statCards = [
    {
      label: "Assignments",
      value: stats?.totalAssignments || 0,
      icon: FileText,
      color: "text-blue-600",
      bg: "bg-blue-500/10",
      desc: "Active across all courses"
    },
    {
      label: "Pending",
      value: stats?.pendingSubmissions || 0,
      icon: ClipboardCheck,
      color: "text-amber-600",
      bg: "bg-amber-500/10",
      desc: "Submissions to be graded"
    },
    {
      label: "Completed",
      value: stats?.completedSubmissions || 0,
      icon: CheckCircle,
      color: "text-emerald-600",
      bg: "bg-emerald-500/10",
      desc: "Graded this semester"
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
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Faculty Dashboard
              </h1>
              <p className="text-muted-foreground mt-0.5 font-medium">
                Managing courses and academic performance.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="gap-2 rounded-xl">
                <MessageSquare className="h-4 w-4" />
                Student Inquiries
              </Button>
              <Button
                onClick={() => router.push("/lecturer/assignments")}
                className="gap-2 rounded-xl shadow-lg shadow-primary/20"
              >
                <Plus className="h-4 w-4" />
                New Assignment
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
                    {loading ? (
                      <div className="h-9 w-24 bg-muted animate-pulse rounded-md" />
                    ) : (
                      <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
                    )}
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
                    <CardTitle className="text-xl">Course Management</CardTitle>
                    <CardDescription>Administrative actions for your courses</CardDescription>
                  </div>
                  <UserCheck className="h-5 w-5 text-primary opacity-20" />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                  <a
                    href="/lecturer/assignments"
                    className="flex items-center justify-between p-6 hover:bg-muted/50 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600 group-hover:scale-110 transition-transform">
                        <Plus className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="font-bold text-base text-foreground group-hover:text-primary transition-colors">Assignment Creation</div>
                        <div className="text-sm text-muted-foreground">Draft and publish new academic tasks</div>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </a>
                  <a
                    href="/lecturer/grades"
                    className="flex items-center justify-between p-6 hover:bg-muted/50 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-600 group-hover:scale-110 transition-transform">
                        <CheckCircle className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="font-bold text-base text-foreground group-hover:text-primary transition-colors">Submissions Review</div>
                        <div className="text-sm text-muted-foreground">Grade and provide feedback on student work</div>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl shadow-primary/5 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl">Recent Submissions</CardTitle>
                <CardDescription>Latest student uploads</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Users className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm font-bold text-foreground/70">Up to Date</p>
                  <p className="text-xs text-muted-foreground mt-1 px-6 leading-relaxed">
                    There are no new submissions to review at this moment.
                  </p>
                  <Button variant="ghost" className="mt-6 text-xs font-bold text-primary hover:bg-primary/5">
                    View History
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

