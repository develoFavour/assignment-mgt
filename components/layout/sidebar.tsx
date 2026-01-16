"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { useUIStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Settings, GraduationCap } from "lucide-react";

interface NavigationItem {
	href: string;
	label: string;
	icon: React.ComponentType<{ className?: string }>;
}

interface SidebarProps {
	navigationItems: NavigationItem[];
}

export function Sidebar({ navigationItems }: SidebarProps) {
	const { session } = useAuthStore();
	const { sidebarOpen, setSidebarOpen } = useUIStore();
	const pathname = usePathname();

	if (!session) return null;

	return (
		<aside
			className={cn(
				"fixed left-0 top-0 h-screen w-64 border-r border-sidebar-border bg-sidebar transition-all duration-300 lg:translate-x-0 z-40 shadow-sm",
				sidebarOpen ? "translate-x-0" : "-translate-x-full"
			)}
		>
			<div className="flex h-16 items-center gap-3 px-6 border-b border-sidebar-border/50">
				<div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20">
					<GraduationCap className="h-5 w-5" />
				</div>
				<div className="flex flex-col">
					<span className="font-bold text-sm leading-tight text-sidebar-foreground">
						EduHub
					</span>
					<span className="text-[10px] uppercase tracking-wider font-semibold text-sidebar-foreground/60">
						Hallmark University
					</span>
				</div>
			</div>

			<div className="py-6 px-4 space-y-8 overflow-y-auto h-[calc(100vh-4rem)]">
				<div className="space-y-1">
					<p className="px-3 text-[10px] font-bold uppercase tracking-widest text-sidebar-foreground/40 mb-3">
						Main Navigation
					</p>
					{navigationItems.map((link) => {
						const Icon = link.icon;
						const isActive = pathname === link.href;

						return (
							<Link
								key={link.href}
								href={link.href}
								onClick={() => setSidebarOpen(false)}
								className={cn(
									"flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 group relative",
									isActive
										? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
										: "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
								)}
							>
								<div className="flex items-center gap-3">
									<Icon
										className={cn(
											"h-5 w-5 transition-transform duration-200",
											isActive ? "scale-110" : "group-hover:scale-110"
										)}
									/>
									<span>{link.label}</span>
								</div>
								{isActive && (
									<div className="h-1.5 w-1.5 rounded-full bg-primary-foreground animate-pulse" />
								)}
							</Link>
						);
					})}
				</div>

				{/* <div className="space-y-1">
					<p className="px-3 text-[10px] font-bold uppercase tracking-widest text-sidebar-foreground/40 mb-3">
						System
					</p>
					<Link
						href="/settings"
						onClick={() => setSidebarOpen(false)}
						className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all group"
					>
						<Settings className="h-5 w-5 group-hover:rotate-45 transition-transform duration-300" />
						<span>Settings</span>
					</Link>
				</div> */}
			</div>

			<div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border/50 bg-sidebar/50 backdrop-blur-md">
				<div className="flex items-center gap-3 p-2 rounded-xl bg-sidebar-accent/50 border border-sidebar-border/30">
					<div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
						{session.email?.charAt(0).toUpperCase()}
					</div>
					<div className="flex flex-col min-w-0">
						<span className="text-xs font-bold text-sidebar-foreground truncate">
							Portal User
						</span>
						<span className="text-[10px] text-sidebar-foreground/50 truncate">
							{session.email}
						</span>
					</div>
				</div>
			</div>
		</aside>
	);
}
