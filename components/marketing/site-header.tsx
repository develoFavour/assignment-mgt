"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
	{ label: "Home", href: "/" },
	{ label: "All Courses", href: "/all-courses" },
	{ label: "About", href: "/about" },
];

type SiteHeaderProps = {
	scrolled?: boolean;
	fixed?: boolean;
};

export function SiteHeader({
	scrolled = false,
	fixed = false,
}: SiteHeaderProps) {
	const pathname = usePathname();

	return (
		<nav
			className={cn(
				"left-0 right-0 z-[100] px-6 py-4 transition-all duration-500",
				fixed ? "fixed top-0" : "sticky top-0",
				scrolled ? "py-3" : "py-6",
			)}
		>
			<div
				className={cn(
					"mx-auto flex max-w-7xl items-center justify-between rounded-2xl px-6 py-3 transition-all duration-500",
					scrolled
						? "border border-white/40 bg-white/70 shadow-xl shadow-slate-200/20 backdrop-blur-xl"
						: fixed
							? "bg-transparent"
							: "border border-slate-200 bg-white/90 shadow-sm backdrop-blur-xl",
				)}
			>
				<Link href="/" className="flex items-center gap-2">
					<div className="relative h-11 w-11 overflow-hidden rounded-xl bg-white shadow-lg shadow-slate-200/60 ring-1 ring-slate-200">
						<Image
							src="/hallmark-logo.svg"
							alt="Hallmark University logo"
							fill
							className="object-contain p-1.5"
							priority
						/>
					</div>
					<div className="leading-tight">
						<p className="text-[11px] font-black uppercase tracking-[0.22em] text-primary">
							Hallmark University
						</p>
						<span className="text-lg font-black tracking-tight text-slate-900">
							Assignment Manager
						</span>
					</div>
				</Link>

				<div className="hidden items-center gap-8 lg:flex">
					{navItems.map((item) => {
						const active = pathname === item.href;

						return (
							<Link
								key={item.href}
								href={item.href}
								className={cn(
									"text-[13px] font-bold uppercase tracking-tight transition-colors",
									active ? "text-primary" : "text-slate-500 hover:text-primary",
								)}
							>
								{item.label}
							</Link>
						);
					})}
				</div>

				<div className="flex items-center gap-3">
					<Link href="/login">
						<Button
							variant="ghost"
							className="hidden text-[13px] font-bold uppercase tracking-widest text-slate-600 sm:flex"
						>
							Log In
						</Button>
					</Link>
					<Link href="/login">
						<Button className="h-11 rounded-xl bg-primary px-6 text-[13px] font-bold uppercase tracking-widest text-white shadow-lg shadow-primary/20 transition-all active:scale-95 hover:bg-slate-900">
							Portal Access
						</Button>
					</Link>
				</div>
			</div>
		</nav>
	);
}
