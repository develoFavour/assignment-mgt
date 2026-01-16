"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
	ArrowRight,
	BookOpen,
	Users,
	GraduationCap,
	Calendar,
	ChevronRight,
	ShieldCheck,
	Zap,
	Globe,
	Sparkles,
	ArrowUpRight,
	Star,
	Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Scroll Animation Hook
function useScrollReveal() {
	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						entry.target.classList.add("reveal-visible");
					}
				});
			},
			{ threshold: 0.1 }
		);

		document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
		return () => observer.disconnect();
	}, []);
}

export default function LandingPage() {
	useScrollReveal();
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		const handleScroll = () => setScrolled(window.scrollY > 20);
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<div className="min-h-screen bg-white text-slate-900 selection:bg-primary selection:text-white overflow-x-hidden">
			<style jsx global>{`
				.reveal {
					opacity: 0;
					transform: translateY(30px);
					transition: all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
				}
				.reveal-visible {
					opacity: 1;
					transform: translateY(0);
				}
				.reveal-delay-1 {
					transition-delay: 0.1s;
				}
				.reveal-delay-2 {
					transition-delay: 0.2s;
				}
				.reveal-delay-3 {
					transition-delay: 0.3s;
				}

				.floating {
					animation: floating 3s ease-in-out infinite;
				}
				@keyframes floating {
					0% {
						transform: translateY(0px);
					}
					50% {
						transform: translateY(-15px);
					}
					100% {
						transform: translateY(0px);
					}
				}

				.glass {
					background: rgba(255, 255, 255, 0.7);
					backdrop-filter: blur(12px);
					border: 1px solid rgba(255, 255, 255, 0.3);
				}
			`}</style>

			{/* Navbar */}
			<nav
				className={cn(
					"fixed top-0 left-0 right-0 z-[100] transition-all duration-500 px-6 py-4",
					scrolled ? "py-3" : "py-6"
				)}
			>
				<div
					className={cn(
						"max-w-7xl mx-auto flex items-center justify-between px-6 py-3 rounded-2xl transition-all duration-500",
						scrolled ? "glass shadow-xl shadow-slate-200/20" : "bg-transparent"
					)}
				>
					<div className="flex items-center gap-2 group cursor-pointer">
						<div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/30 group-hover:rotate-12 transition-transform duration-500">
							<GraduationCap className="h-6 w-6" />
						</div>
						<span className="text-xl font-black tracking-tighter text-slate-900 uppercase">
							Edu<span className="text-primary">Hub</span>
						</span>
					</div>

					<div className="hidden lg:flex items-center gap-8">
						{["Home", "All Courses", "About", "Team"].map((item) => (
							<a
								key={item}
								href="#"
								className="text-[13px] font-bold text-slate-500 hover:text-primary transition-colors tracking-tight uppercase"
							>
								{item}
							</a>
						))}
					</div>

					<div className="flex items-center gap-3">
						<Link href="/login">
							<Button
								variant="ghost"
								className="hidden sm:flex text-[13px] font-bold uppercase tracking-widest text-slate-600"
							>
								Log In
							</Button>
						</Link>
						<Link href="/login">
							<Button className="rounded-xl px-6 h-11 bg-primary hover:bg-slate-900 text-white font-bold text-[13px] uppercase tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-95">
								Portal Access
							</Button>
						</Link>
					</div>
				</div>
			</nav>

			{/* Hero Section */}
			<section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 overflow-hidden">
				{/* Decorative Blobs */}
				<div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/[0.03] rounded-full blur-3xl -mr-96 -mt-96 animate-pulse" />
				<div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/[0.02] rounded-full blur-3xl -ml-96 -mb-96" />

				<div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
					{/* Left: Content */}
					<div className="space-y-8">
						<div className="reveal">
							<Badge
								variant="secondary"
								className="bg-primary/5 text-primary border-none px-4 py-1.5 rounded-full font-black text-[11px] uppercase tracking-[0.2em] mb-4"
							>
								Hallmark University
							</Badge>
							<h1 className="text-6xl lg:text-8xl font-black text-slate-900 leading-[0.95] tracking-tighter">
								Welcome to <br />
								<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-600">
									EduHub.
								</span>
							</h1>
						</div>

						<p className="text-xl text-slate-500 font-medium leading-relaxed max-w-xl reveal reveal-delay-1">
							Far beyond the traditional boundaries of grading, Hallmark
							provides a seamless, intelligence-driven portal for academic
							excellence.
						</p>

						<div className="flex flex-wrap gap-4 reveal reveal-delay-2">
							<Link href="/login">
								<Button
									size="lg"
									className="h-16 px-10 rounded-[20px] bg-primary hover:bg-slate-900 text-lg font-black shadow-2xl shadow-primary/20 transition-all hover:scale-[1.05] active:scale-95 group"
								>
									Get Started Now
									<ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
								</Button>
							</Link>
							<Button
								size="lg"
								variant="outline"
								className="h-16 px-10 rounded-[20px] border-2 border-slate-100 bg-white text-lg font-black hover:border-primary/20 transition-all group"
							>
								View Portals
							</Button>
						</div>

						{/* Email Search Bar Pill */}
						<div className="reveal reveal-delay-3">
							<div className="max-w-md p-1.5 bg-white border-2 border-slate-100 rounded-[30px] shadow-xl shadow-slate-200/20 flex items-center group focus-within:border-primary/20 transition-all">
								<input
									type="email"
									placeholder="Enter your student email"
									className="flex-1 bg-transparent px-6 py-3 text-sm font-bold text-slate-700 outline-none placeholder:text-slate-300"
								/>
								<button className="h-12 w-12 bg-primary rounded-full flex items-center justify-center text-white shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all">
									<Play className="h-4 w-4 fill-current ml-1" />
								</button>
							</div>
							<div className="mt-4 flex items-center gap-2 px-6">
								<div className="flex -space-x-3">
									{[1, 2, 3].map((i) => (
										<div
											key={i}
											className="h-8 w-8 rounded-full border-2 border-white bg-slate-100 overflow-hidden"
										>
											<img
												src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${
													i + 10
												}`}
												alt="user"
											/>
										</div>
									))}
								</div>
								<span className="text-xs font-bold text-slate-400 tracking-tight">
									Join <span className="text-slate-900 font-black">2,400+</span>{" "}
									academic researchers
								</span>
							</div>
						</div>
					</div>

					{/* Right: Collage */}
					<div className="relative reveal reveal-delay-2">
						<div className="grid grid-cols-2 gap-4 relative">
							{/* Image 1 */}
							<div className="aspect-square rounded-[60px] overflow-hidden bg-slate-100 shadow-2xl skew-y-3 hover:skew-y-0 transition-transform duration-700">
								<img
									src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800"
									className="w-full h-full object-cover"
									alt="Academic"
								/>
							</div>
							{/* Image 2 */}
							<div className="aspect-square rounded-[80px] overflow-hidden bg-slate-100 shadow-2xl -translate-y-12 -skew-y-3 hover:skew-y-0 transition-transform duration-700">
								<img
									src="https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800"
									className="w-full h-full object-cover"
									alt="Academic"
								/>
							</div>
							{/* Image 3 */}
							<div className="aspect-square rounded-[100px] overflow-hidden bg-slate-100 shadow-2xl translate-x-0 hover:translate-x-12 transition-transform duration-700">
								<img
									src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800"
									className="w-full h-full object-cover"
									alt="Academic"
								/>
							</div>
							{/* Image 4 */}
							<div className="aspect-square rounded-[60px] overflow-hidden bg-slate-100 shadow-2xl -translate-y-8 translate-x-4 skew-x-3 hover:skew-x-0 transition-transform duration-700">
								<img
									src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800"
									className="w-full h-full object-cover"
									alt="Academic"
								/>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* 3D Stats Section */}
			<section className="py-20 px-6 bg-slate-50/50">
				<div className="max-w-7xl mx-auto">
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
						{[
							{
								label: "Success Stories",
								value: "3,000",
								icon: <Star />,
								color: "bg-indigo-50 text-indigo-600",
							},
							{
								label: "Trusted Tutors",
								value: "320",
								icon: <Users />,
								color: "bg-emerald-50 text-emerald-600",
							},
							{
								label: "Schedules",
								value: "1,000",
								icon: <Calendar />,
								color: "bg-amber-50 text-amber-600",
							},
							{
								label: "Courses",
								value: "587",
								icon: <BookOpen />,
								color: "bg-rose-50 text-rose-600",
							},
						].map((stat, i) => (
							<div
								key={i}
								className="reveal group p-8 bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-2 transition-all duration-500"
							>
								<div
									className={cn(
										"h-16 w-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 group-hover:rotate-12",
										stat.color
									)}
								>
									{stat.icon}
								</div>
								<div className="space-y-1">
									<div className="text-3xl font-black text-slate-900 group-hover:text-primary transition-colors">
										{stat.value}
									</div>
									<div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
										{stat.label}
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Quote Section */}
			<section className="py-32 px-6">
				<div className="max-w-5xl mx-auto text-center space-y-12">
					<div className="reveal">
						<h2 className="text-4xl lg:text-7xl font-black text-slate-900 leading-[1.1] tracking-tighter italic">
							"Education is not{" "}
							<span className="text-primary">preparation</span> for life; <br />
							Education is <span className="text-slate-400">life itself.</span>"
						</h2>
					</div>
					<div className="h-2 w-24 bg-primary/20 mx-auto rounded-full reveal reveal-delay-1" />
				</div>
			</section>

			{/* Portals Section */}
			<section className="py-20 px-6">
				<div className="max-w-7xl mx-auto space-y-16">
					<div className="flex flex-col md:flex-row md:items-end justify-between gap-6 overflow-hidden">
						<div className="reveal">
							<h2 className="text-4xl font-black text-slate-900 tracking-tight">
								Select your Portal.
							</h2>
							<p className="text-slate-500 font-medium mt-2">
								Access your assigned academic environment.
							</p>
						</div>
						<Link href="/login" className="reveal reveal-delay-1">
							<Button
								variant="ghost"
								className="font-black uppercase tracking-widest text-[11px] group"
							>
								Direct Portal Switch{" "}
								<ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
							</Button>
						</Link>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						{[
							{
								title: "Student Portal",
								desc: "Submit coursework, view grades, and manage modules.",
								icon: <GraduationCap />,
								img: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600",
								link: "/student",
							},
							{
								title: "Lecturer Hub",
								desc: "Grade assignments, provide feedback, and track progress.",
								icon: <Users />,
								img: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600",
								link: "/lecturer",
							},
							{
								title: "Admin Panel",
								desc: "Manage users, courses, and system orchestration.",
								icon: <ShieldCheck />,
								img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600",
								link: "/admin",
							},
						].map((portal, i) => (
							<Link
								key={i}
								href={portal.link}
								className="block group reveal"
								style={{ transitionDelay: `${i * 0.1}s` }}
							>
								<div className="relative h-[450px] rounded-[40px] overflow-hidden shadow-xl group-hover:shadow-2xl group-hover:shadow-primary/20 transition-all duration-700">
									<img
										src={portal.img}
										className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
										alt={portal.title}
									/>
									<div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

									<div className="absolute inset-0 p-8 flex flex-col justify-end">
										<div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white mb-4 transition-transform group-hover:rotate-12">
											{portal.icon}
										</div>
										<h3 className="text-2xl font-black text-white">
											{portal.title}
										</h3>
										<p className="text-slate-300 font-medium text-sm mt-2 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
											{portal.desc}
										</p>
										<div className="mt-6 flex items-center text-white text-xs font-black uppercase tracking-widest gap-2 opacity-0 group-hover:opacity-100 transition-all">
											Access Now <ArrowUpRight className="h-3 w-3" />
										</div>
									</div>
								</div>
							</Link>
						))}
					</div>
				</div>
			</section>

			{/* Enhanced Footer */}
			<footer className="pt-32 pb-12 px-6 border-t border-slate-50">
				<div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
					<div className="col-span-2 space-y-8">
						<div className="flex items-center gap-2 group cursor-pointer">
							<div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg transition-transform md:group-hover:rotate-12">
								<GraduationCap className="h-6 w-6" />
							</div>
							<span className="text-2xl font-black tracking-tighter text-slate-900 uppercase">
								Edu<span className="text-primary">Hub</span>
							</span>
						</div>
						<p className="text-slate-400 font-medium max-w-sm leading-relaxed">
							Empowering the next generation of researchers with intelligent
							tools for academic management and collaborative learning
							environments.
						</p>
					</div>

					<div className="space-y-6 text-center md:text-left">
						<h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">
							Platform
						</h4>
						<div className="flex flex-col gap-3">
							{["Assignments", "Grading", "Materials", "Stats"].map((link) => (
								<a
									key={link}
									href="#"
									className="text-sm font-bold text-slate-400 hover:text-primary transition-colors"
								>
									{link}
								</a>
							))}
						</div>
					</div>

					<div className="space-y-6 text-center md:text-right">
						<h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">
							Contact
						</h4>
						<div className="flex flex-col gap-3 items-center md:items-end">
							<a
								href="#"
								className="text-sm font-bold text-slate-400 hover:text-primary transition-colors underline decoration-primary/20 font-mono"
							>
								support@hallmark.edu
							</a>
							<p className="text-sm font-bold text-slate-300">
								Available 24/7 for faculty support
							</p>
						</div>
					</div>
				</div>

				<div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 pt-12 border-t border-slate-50">
					<p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
						© 2026 Hallmark University • Academic Systems Team
					</p>
					<div className="flex gap-8">
						<a
							href="#"
							className="text-[10px] font-black text-slate-300 uppercase tracking-widest hover:text-primary transition-colors"
						>
							Privacy
						</a>
						<a
							href="#"
							className="text-[10px] font-black text-slate-300 uppercase tracking-widest hover:text-primary transition-colors"
						>
							Terms
						</a>
					</div>
				</div>
			</footer>
		</div>
	);
}
