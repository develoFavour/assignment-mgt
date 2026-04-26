import { CheckCircle2, Building2, GraduationCap, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";

const highlights = [
	{
		title: "Built for Hallmark",
		description:
			"A university-facing experience with Hallmark identity, academic clarity, and a polished first impression.",
		icon: Building2,
	},
	{
		title: "Supports every role",
		description:
			"Students, lecturers, and administrators can move through coursework, grading, and portal access with less friction.",
		icon: GraduationCap,
	},
	{
		title: "Reliable by design",
		description:
			"Clear workflows, secure access patterns, and organized surfaces help academic operations stay manageable.",
		icon: ShieldCheck,
	},
];

const values = [
	"Centralized assignment and course access",
	"Cleaner lecturer and student workflows",
	"Branded experience for university use",
	"Simple pathways into each academic portal",
];

export default function AboutPage() {
	return (
		<div className="min-h-screen bg-white text-slate-900">
			<SiteHeader />

			<main className="px-6 pb-20 pt-10 md:pt-14">
				<section className="mx-auto max-w-7xl overflow-hidden rounded-[36px] border border-slate-200 bg-slate-950 text-white">
					<div className="grid grid-cols-1 gap-0 lg:grid-cols-[1.1fr_0.9fr]">
						<div className="space-y-8 px-8 py-12 sm:px-12 sm:py-16 lg:px-16 lg:py-20">
							<Badge className="rounded-full bg-white/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.22em] text-white hover:bg-white/10">
								About Hallmark Assignment Manager
							</Badge>
							<div className="space-y-5">
								<h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
									A focused academic platform for Hallmark University.
								</h1>
								<p className="max-w-2xl text-base font-medium leading-8 text-white/75 sm:text-lg">
									This project gives Hallmark University a cleaner digital front
									door for managing courses, assignments, grading workflows, and
									role-based portal access in one place.
								</p>
							</div>
						</div>

						<div className="bg-[linear-gradient(180deg,rgba(59,130,246,0.22),rgba(15,23,42,0.95))] px-8 py-12 sm:px-12 sm:py-16 lg:px-14 lg:py-20">
							<p className="text-[11px] font-black uppercase tracking-[0.22em] text-white/60">
								What this page is doing
							</p>
							<ul className="mt-8 space-y-5">
								{values.map((item) => (
									<li key={item} className="flex items-start gap-3">
										<CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-sky-300" />
										<span className="text-sm font-medium leading-7 text-white/80 sm:text-base">
											{item}
										</span>
									</li>
								))}
							</ul>
						</div>
					</div>
				</section>

				<section className="mx-auto mt-16 max-w-7xl">
					<div className="max-w-2xl">
						<p className="text-[11px] font-black uppercase tracking-[0.22em] text-primary">
							Platform Highlights
						</p>
						<h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
							A university project with a practical, working shape.
						</h2>
						<p className="mt-4 text-base font-medium leading-8 text-slate-500">
							The goal here is not just presentation. It is to make academic
							tasks easier to navigate, easier to understand, and easier to act
							on.
						</p>
					</div>

					<div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
						{highlights.map((item) => {
							const Icon = item.icon;

							return (
								<div
									key={item.title}
									className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm"
								>
									<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
										<Icon className="h-6 w-6" />
									</div>
									<h3 className="mt-6 text-xl font-black tracking-tight text-slate-900">
										{item.title}
									</h3>
									<p className="mt-3 text-sm font-medium leading-7 text-slate-500">
										{item.description}
									</p>
								</div>
							);
						})}
					</div>
				</section>
			</main>

			<SiteFooter />
		</div>
	);
}
