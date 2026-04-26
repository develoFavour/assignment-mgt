import Link from "next/link";
import Image from "next/image";

export function SiteFooter() {
	return (
		<footer className="border-t border-slate-100 px-6 pb-12 pt-20">
			<div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 md:grid-cols-4 md:gap-10">
				<div className="space-y-6 md:col-span-2">
					<Link href="/" className="flex items-center gap-2">
						<div className="relative h-10 w-10 overflow-hidden rounded-xl bg-white shadow-lg shadow-slate-200/60 ring-1 ring-slate-200">
							<Image
								src="/hallmark-logo.svg"
								alt="Hallmark University logo"
								fill
								className="object-contain p-1.5"
							/>
						</div>
						<div className="leading-tight">
							<p className="text-[11px] font-black uppercase tracking-[0.22em] text-primary">
								Hallmark University
							</p>
							<span className="text-2xl font-black tracking-tight text-slate-900">
								Assignment Manager
							</span>
						</div>
					</Link>
					<p className="max-w-sm text-sm font-medium leading-relaxed text-slate-500">
						Supporting academic operations with a clear, university-branded
						workspace for learning, grading, and administration.
					</p>
				</div>

				<div className="space-y-5 text-center md:text-left">
					<h4 className="text-sm font-black uppercase tracking-widest text-slate-900">
						Explore
					</h4>
					<div className="flex flex-col gap-3">
						<Link
							href="/"
							className="text-sm font-bold text-slate-400 transition-colors hover:text-primary"
						>
							Home
						</Link>
						<Link
							href="/all-courses"
							className="text-sm font-bold text-slate-400 transition-colors hover:text-primary"
						>
							All Courses
						</Link>
						<Link
							href="/about"
							className="text-sm font-bold text-slate-400 transition-colors hover:text-primary"
						>
							About
						</Link>
					</div>
				</div>

				<div className="space-y-5 text-center md:text-right">
					<h4 className="text-sm font-black uppercase tracking-widest text-slate-900">
						Contact
					</h4>
					<div className="flex flex-col items-center gap-3 md:items-end">
						<a
							href="mailto:support@hallmark.edu"
							className="font-mono text-sm font-bold text-slate-400 underline decoration-primary/20 transition-colors hover:text-primary"
						>
							support@hallmark.edu
						</a>
						<p className="text-sm font-bold text-slate-300">
							Available 24/7 for faculty support
						</p>
					</div>
				</div>
			</div>

			<div className="mx-auto mt-12 flex max-w-7xl flex-col items-center justify-between gap-6 border-t border-slate-100 pt-10 md:flex-row">
				<p className="text-[10px] font-black uppercase tracking-widest text-slate-300">
					© 2026 Hallmark University • Academic Systems Team
				</p>
				<div className="flex gap-8">
					<span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
						Privacy
					</span>
					<span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
						Terms
					</span>
				</div>
			</div>
		</footer>
	);
}
