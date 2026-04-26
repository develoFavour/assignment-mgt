import { Badge } from "@/components/ui/badge";
import { CourseCard } from "@/components/marketing/course-card";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";

const courses = [
	{
		code: "CSC 102",
		title: "Introduction to Computing Systems",
		school: "Computer Science",
		level: "100 Level",
		units: "2 Units",
		description:
			"Foundational computing concepts, digital literacy, and basic systems awareness for early-stage students.",
	},
	{
		code: "CSC 412",
		title: "Software Engineering Practice",
		school: "Computer Science",
		level: "400 Level",
		units: "3 Units",
		description:
			"Project-driven software planning, documentation, collaboration, and implementation workflows.",
	},
	{
		code: "BUS 304",
		title: "Business Strategy and Operations",
		school: "Business Administration",
		level: "300 Level",
		units: "3 Units",
		description:
			"Decision-making, operational planning, and organizational strategy across growing business environments.",
	},
	{
		code: "BUS 410",
		title: "Entrepreneurship and Innovation",
		school: "Business Administration",
		level: "400 Level",
		units: "2 Units",
		description:
			"Venture design, innovation thinking, and practical entrepreneurship models for final-year students.",
	},
	{
		code: "ACC 102",
		title: "Principles of Financial Accounting",
		school: "Accounting",
		level: "100 Level",
		units: "2 Units",
		description:
			"Basic accounting records, financial reporting structures, and introductory bookkeeping techniques.",
	},
	{
		code: "BCH 204",
		title: "Introductory Biochemistry",
		school: "Biochemistry",
		level: "200 Level",
		units: "3 Units",
		description:
			"Core biochemical processes, molecular function, and laboratory-linked theory for science students.",
	},
];

export default function AllCoursesPage() {
	return (
		<div className="min-h-screen bg-slate-50 text-slate-900">
			<SiteHeader />

			<main className="px-6 pb-20 pt-10 md:pt-14">
				<section className="mx-auto max-w-7xl rounded-[36px] border border-slate-200 bg-white px-8 py-12 shadow-sm sm:px-12 sm:py-16">
					<Badge className="rounded-full bg-primary/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.22em] text-primary hover:bg-primary/10">
						All Courses
					</Badge>
					<div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
						<div className="max-w-3xl">
							<h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
								Courses
							</h1>
							<p className="mt-4 text-base font-medium leading-8 text-slate-500 sm:text-lg">
								Hallmark University offers a variety of courses across various
								departments
							</p>
						</div>
						<div className="rounded-[24px] border border-slate-200 bg-slate-50 px-6 py-5">
							<p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
								Visible Courses
							</p>
							<p className="mt-3 text-3xl font-black tracking-tight text-slate-900">
								{courses.length}
							</p>
						</div>
					</div>
				</section>

				<section className="mx-auto mt-12 max-w-7xl">
					<div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
						{courses.map((course) => (
							<CourseCard key={course.code} {...course} />
						))}
					</div>
				</section>
			</main>

			<SiteFooter />
		</div>
	);
}
