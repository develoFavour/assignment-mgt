"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { useAuthStore } from "@/lib/store";
import { useUIStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
	Users,
	BookOpen,
	FileText,
	ArrowUpRight,
	Activity,
	ShieldCheck,
	Zap,
	TrendingUp,
	ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/loading-spinner";
import { cn } from "@/lib/utils";

interface DashboardStats {
	totalUsers: number;
	totalCourses: number;
	totalAssignments: number;
	trends: {
		users: string;
		courses: string;
		assignments: string;
	};
}

export default function AdminDashboard() {
	const { session } = useAuthStore();
	const { sidebarOpen } = useUIStore();
	const [metrics, setMetrics] = useState<DashboardStats | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchStats = async () => {
			try {
				const res = await fetch("/api/admin/stats");
				const data = await res.json();
				if (res.ok) {
					setMetrics(data);
				}
			} catch (err) {
				console.error("Metrics aggregation failed");
			} finally {
				setLoading(false);
			}
		};

		if (session?.role === "admin") {
			fetchStats();
		}
	}, [session]);

	const statConfig = [
		{
			label: "Total Users",
			value: metrics?.totalUsers || 0,
			change: metrics?.trends.users || "0%",
			icon: Users,
			color: "text-blue-600",
			bg: "bg-blue-500/10"
		},
		{
			label: "Active Courses",
			value: metrics?.totalCourses || 0,
			change: metrics?.trends.courses || "0%",
			icon: BookOpen,
			color: "text-emerald-600",
			bg: "bg-emerald-500/10"
		},
		{
			label: "Total Assignments",
			value: metrics?.totalAssignments || 0,
			change: metrics?.trends.assignments || "0%",
			icon: FileText,
			color: "text-purple-600",
			bg: "bg-purple-500/10"
		},
	];

	return (
		<div className="min-h-screen bg-[#F8FAFC]">
			<Header />
			<Sidebar />

			<main className={cn(
				"transition-all duration-300 pt-20 px-4 pb-12",
				sidebarOpen ? "lg:pl-[280px]" : "lg:pl-24"
			)}>
				<div className="max-w-7xl mx-auto space-y-10">

					{/* Welcome Header */}
					<div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
						<div className="space-y-1">
							<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
								<ShieldCheck className="h-3 w-3" />
								Central Command Center
							</div>
							<h1 className="text-4xl font-black tracking-tighter text-slate-900">
								Operations Hub.
							</h1>
							<p className="text-slate-500 font-medium">
								Institutional metrics and system performance at a glance.
							</p>
						</div>
						<div className="flex items-center gap-3">
							<Button variant="outline" className="h-12 px-6 rounded-2xl bg-white border-slate-200 shadow-sm gap-2 font-bold hover:bg-slate-50 transition-all text-slate-600">
								<Activity className="h-4 w-4" />
								Systems Cloud
							</Button>
							<Button className="h-12 px-6 rounded-2xl bg-primary shadow-lg shadow-primary/20 gap-2 font-black hover:scale-[1.02] transition-all">
								<Zap className="h-4 w-4" />
								Run Analysis
							</Button>
						</div>
					</div>

					{/* Metrics Grid */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{loading ? (
							Array(3).fill(0).map((_, i) => (
								<div key={i} className="h-40 rounded-[32px] bg-white border border-slate-100 animate-pulse" />
							))
						) : (
							statConfig.map((stat) => {
								const Icon = stat.icon;
								return (
									<Card key={stat.label} className="border-none rounded-[32px] shadow-sm bg-white overflow-hidden group hover:shadow-xl hover:shadow-primary/5 transition-all duration-500">
										<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-8">
											<CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
												{stat.label}
											</CardTitle>
											<div className={cn("p-2.5 rounded-2xl transition-all duration-500 group-hover:scale-110", stat.bg)}>
												<Icon className={cn("h-5 w-5", stat.color)} />
											</div>
										</CardHeader>
										<CardContent className="px-8 pb-8">
											<div className="text-4xl font-black tracking-tighter text-slate-900">{stat.value}</div>
											<div className="flex items-center mt-2">
												<div className="flex items-center text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">
													<TrendingUp className="h-3 w-3 mr-1" />
													{stat.change}
												</div>
												<span className="text-[10px] text-slate-400 ml-2 font-bold uppercase tracking-widest">Growth</span>
											</div>
										</CardContent>
									</Card>
								);
							})
						)}
					</div>

					{/* Main Dashboard Layout */}
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

						{/* Quick Management Section */}
						<Card className="lg:col-span-2 border-none rounded-[40px] shadow-sm bg-white p-2">
							<CardHeader className="p-8 pb-4">
								<div className="flex items-center justify-between">
									<div>
										<CardTitle className="text-2xl font-black text-slate-900 tracking-tight">System Modules</CardTitle>
										<CardDescription className="font-medium">Direct access to core administrative functions.</CardDescription>
									</div>
									<div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center">
										<ShieldCheck className="h-5 w-5 text-slate-400" />
									</div>
								</div>
							</CardHeader>
							<CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
								{[
									{ title: "Member Directory", desc: `${metrics?.totalUsers || '...'} Registered Accounts`, href: "/admin/users", icon: Users, color: "bg-blue-50 text-blue-500" },
									{ title: "Academic Catalog", desc: `${metrics?.totalCourses || '...'} Modules Provisioned`, href: "/admin/courses", icon: BookOpen, color: "bg-emerald-50 text-emerald-500" },
								].map((item) => (
									<a
										key={item.title}
										href={item.href}
										className="group flex items-start gap-4 p-6 rounded-3xl border border-slate-50 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-100 transition-all duration-300"
									>
										<div className={cn("p-4 rounded-2xl transition-all group-hover:scale-110", item.color)}>
											<item.icon className="h-6 w-6" />
										</div>
										<div className="flex-1">
											<div className="font-black text-slate-900 tracking-tight flex items-center justify-between">
												{item.title}
												<ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-40 transition-opacity" />
											</div>
											<div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
												{item.desc}
											</div>
										</div>
									</a>
								))}
							</CardContent>
						</Card>

						{/* Activity Feed Section */}
						<Card className="border-none rounded-[40px] shadow-sm bg-slate-900 text-white overflow-hidden">
							<CardHeader className="p-8">
								<CardTitle className="text-2xl font-black tracking-tight">Security Logs</CardTitle>
								<CardDescription className="text-slate-400 font-medium">System-wide transaction events.</CardDescription>
							</CardHeader>
							<CardContent className="px-8 pb-8">
								<div className="space-y-8 relative">
									{/* Vertical timeline line */}
									<div className="absolute left-1 top-2 bottom-2 w-px bg-slate-800" />

									{[
										{ user: "Admin", action: "Policy permissions updated", time: "2m ago", status: "success" },
										{ user: "System", action: "Vault backup completed", time: "1h ago", status: "info" },
										{ user: "Registry", action: "Module catalog expanded", time: "3h ago", status: "success" },
									].map((log, i) => (
										<div key={i} className="flex items-start gap-6 relative">
											<div className={cn(
												"h-2 w-2 rounded-full mt-1.5 z-10 ring-4 ring-slate-900",
												log.status === 'success' ? "bg-emerald-500" : "bg-blue-500"
											)} />
											<div className="flex-1">
												<p className="font-bold text-sm text-slate-200 leading-none">{log.action}</p>
												<div className="flex items-center gap-2 mt-2">
													<div className="text-[9px] font-black bg-white/5 py-0.5 px-1.5 rounded text-slate-400 uppercase tracking-tighter">By {log.user}</div>
													<div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{log.time}</div>
												</div>
											</div>
										</div>
									))}
								</div>
								<Button variant="outline" className="w-full mt-10 rounded-2xl border-white/10 bg-white/5 text-white hover:bg-white hover:text-slate-900 font-black text-xs transition-all h-12">
									Audit Full Registry
								</Button>
							</CardContent>
						</Card>
					</div>
				</div>
			</main>
		</div>
	);
}
