"use client";

import { useEffect, useState } from "react";
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
	ArrowUpRight,
	Star,
	Play,
} from "lucide-react";

import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
			{ threshold: 0.1 },
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
		<div className="min-h-screen overflow-x-hidden bg-white text-slate-900 selection:bg-primary selection:text-white">
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

				.glass {
					background: rgba(255, 255, 255, 0.7);
					backdrop-filter: blur(12px);
					border: 1px solid rgba(255, 255, 255, 0.3);
				}
			`}</style>

			<SiteHeader scrolled={scrolled} fixed />

			<section className="relative overflow-hidden px-6 pb-20 pt-32 lg:pb-28 lg:pt-44">
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.10),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(15,23,42,0.06),transparent_30%)]" />

				<div className="relative z-10 mx-auto max-w-7xl">
					<div className="overflow-hidden rounded-[36px] border border-slate-200 bg-white shadow-[0_32px_120px_-48px_rgba(15,23,42,0.45)]">
						<div className="grid grid-cols-1 items-stretch lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)]">
							<div className="space-y-8 px-8 py-10 sm:px-12 sm:py-14 lg:px-14 lg:py-16">
								<div className="reveal">
									<Badge
										variant="secondary"
										className="mb-4 rounded-full border-none bg-primary/5 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-primary"
									>
										Hallmark University, Ogun State
									</Badge>
									<h1 className="text-5xl font-black leading-[0.98] tracking-tighter text-slate-900 sm:text-6xl lg:text-7xl">
										Your Hallmark
										<br />
										academic portal,
										<br />
										built for action.
									</h1>
								</div>

								<p className="reveal reveal-delay-1 max-w-xl text-lg font-medium leading-relaxed text-slate-500 sm:text-xl">
									Access coursework, grading, schedules, and faculty workflows
									from one streamlined platform shaped around the Hallmark
									University experience.
								</p>

								<div className="reveal reveal-delay-2 flex flex-wrap gap-4">
									<Link href="/login">
										<Button
											size="lg"
											className="group h-16 rounded-[20px] bg-primary px-10 text-lg font-black shadow-2xl shadow-primary/20 transition-all hover:scale-[1.05] hover:bg-slate-900 active:scale-95"
										>
											Get Started Now
											<ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
										</Button>
									</Link>
									<Link href="/all-courses">
										<Button
											size="lg"
											variant="outline"
											className="h-16 rounded-[20px] border-2 border-slate-100 bg-white px-10 text-lg font-black transition-all hover:border-primary/20"
										>
											View Courses
										</Button>
									</Link>
								</div>

								<div className="reveal reveal-delay-3">
									<div className="group flex max-w-md items-center rounded-[30px] border-2 border-slate-100 bg-white p-1.5 shadow-xl shadow-slate-200/20 transition-all focus-within:border-primary/20">
										<input
											type="email"
											placeholder="Enter your student email"
											className="flex-1 bg-transparent px-6 py-3 text-sm font-bold text-slate-700 outline-none placeholder:text-slate-300"
										/>
										<button className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30 transition-all hover:scale-105 active:scale-95">
											<Play className="ml-1 h-4 w-4 fill-current" />
										</button>
									</div>
									<div className="mt-4 flex items-center gap-2 px-6">
										<div className="flex -space-x-3">
											{[1, 2, 3].map((i) => (
												<div
													key={i}
													className="h-8 w-8 overflow-hidden rounded-full border-2 border-white bg-slate-100"
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
										<span className="text-xs font-bold tracking-tight text-slate-400">
											Supporting{" "}
											<span className="font-black text-slate-900">
												students, lecturers,
											</span>{" "}
											and administrators
										</span>
									</div>
								</div>
							</div>

							<div className="reveal reveal-delay-2 relative min-h-[380px] lg:min-h-full">
								<Image
									src="/hallmark_university.jpg"
									alt="Hallmark University campus"
									fill
									priority
									className="object-cover"
									sizes="(min-width: 1024px) 42vw, 100vw"
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-slate-950/10" />
								<div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 lg:p-10">
									<div className="max-w-md rounded-[24px] border border-white/20 bg-white/10 p-6 text-white backdrop-blur-md">
										<p className="text-[11px] font-black uppercase tracking-[0.24em] text-white/70">
											Campus Life
										</p>
										<h2 className="mt-3 text-2xl font-black leading-tight sm:text-3xl">
											A platform that feels rooted in the university it serves.
										</h2>
										<p className="mt-3 text-sm font-medium leading-relaxed text-white/80 sm:text-base">
											Bring students and staff into a familiar, official
											Hallmark experience from the first screen.
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			<section className="bg-slate-50/50 px-6 py-20">
				<div className="mx-auto max-w-7xl">
					<div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
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
								className="reveal group rounded-[32px] border border-slate-100 bg-white p-8 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-slate-200/50"
							>
								<div
									className={cn(
										"mb-6 flex h-16 w-16 items-center justify-center rounded-2xl transition-transform group-hover:rotate-12 group-hover:scale-110",
										stat.color,
									)}
								>
									{stat.icon}
								</div>
								<div className="space-y-1">
									<div className="text-3xl font-black text-slate-900 transition-colors group-hover:text-primary">
										{stat.value}
									</div>
									<div className="text-[11px] font-black uppercase tracking-widest text-slate-400">
										{stat.label}
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			<section className="px-6 py-32">
				<div className="mx-auto max-w-5xl space-y-12 text-center">
					<div className="reveal">
						<h2 className="text-4xl font-black italic leading-[1.1] tracking-tighter text-slate-900 lg:text-7xl">
							&ldquo;Education is not{" "}
							<span className="text-primary">preparation</span> for life; <br />
							Education is <span className="text-slate-400">life itself.</span>
							&rdquo;
						</h2>
					</div>
					<div className="reveal reveal-delay-1 mx-auto h-2 w-24 rounded-full bg-primary/20" />
				</div>
			</section>

			<section className="px-6 py-20">
				<div className="mx-auto max-w-7xl space-y-16">
					<div className="flex flex-col justify-between gap-6 overflow-hidden md:flex-row md:items-end">
						<div className="reveal">
							<h2 className="text-4xl font-black tracking-tight text-slate-900">
								Select your Portal.
							</h2>
							<p className="mt-2 font-medium text-slate-500">
								Access your assigned academic environment.
							</p>
						</div>
						<Link href="/login" className="reveal reveal-delay-1">
							<Button
								variant="ghost"
								className="group text-[11px] font-black uppercase tracking-widest"
							>
								Direct Portal Switch{" "}
								<ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
							</Button>
						</Link>
					</div>

					<div className="grid grid-cols-1 gap-8 md:grid-cols-3">
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
								img: "/matric.jpg",
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
								className="reveal group block"
								style={{ transitionDelay: `${i * 0.1}s` }}
							>
								<div className="relative h-[450px] overflow-hidden rounded-[40px] shadow-xl transition-all duration-700 group-hover:shadow-2xl group-hover:shadow-primary/20">
									<img
										src={portal.img}
										className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
										alt={portal.title}
									/>
									<div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

									<div className="absolute inset-0 flex flex-col justify-end p-8">
										<div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white backdrop-blur-xl transition-transform group-hover:rotate-12">
											{portal.icon}
										</div>
										<h3 className="text-2xl font-black text-white">
											{portal.title}
										</h3>
										<p className="mt-2 translate-y-4 transform text-sm font-medium text-slate-300 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
											{portal.desc}
										</p>
										<div className="mt-6 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white opacity-0 transition-all group-hover:opacity-100">
											Access Now <ArrowUpRight className="h-3 w-3" />
										</div>
									</div>
								</div>
							</Link>
						))}
					</div>
				</div>
			</section>

			<SiteFooter />
		</div>
	);
}
