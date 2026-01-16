"use client";

import { useAuthStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, Bell, Search, User } from "lucide-react";
import { useUIStore } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function Header() {
	const { session, logout } = useAuthStore();
	const { setSidebarOpen, sidebarOpen } = useUIStore();
	const router = useRouter();

	const handleLogout = () => {
		logout();
		toast.success("Logout successful");
		router.push("/login");
	};
	return (
		<header className={cn(
			"fixed top-0 right-0 h-16 border-b border-border bg-card/80 backdrop-blur-md z-30 transition-all duration-300 left-0 lg:left-64"
		)}>
			<div className="flex h-full items-center justify-between px-6">
				<div className="flex items-center gap-4">
					<button
						onClick={() => setSidebarOpen(!sidebarOpen)}
						className="p-2 rounded-lg hover:bg-muted transition-colors lg:hidden"
					>
						<Menu className="h-5 w-5 text-foreground" />
					</button>

					<div className="hidden md:flex items-center relative max-w-sm">
						<Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search assignments, courses..."
							className="pl-9 bg-muted/50 border-none h-9 w-64 lg:w-80 focus-visible:ring-primary/20 transition-all"
						/>
					</div>
				</div>

				<div className="flex items-center gap-3">
					<button className="relative p-2 rounded-full hover:bg-muted transition-colors">
						<Bell className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
						<span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive border-2 border-card" />
					</button>

					<div className="h-8 w-px bg-border mx-2" />

					{session && (
						<div className="flex items-center gap-3">
							<div className="hidden sm:flex flex-col items-end text-xs">
								<span className="font-bold text-foreground">
									{session.role === "admin" ? "Admin Portal" : session.role === "lecturer" ? "Lecturer Portal" : "Student Portal"}
								</span>
								<span className="text-muted-foreground capitalize">
									{session.role} Account
								</span>
							</div>

							<div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
								<User className="h-5 w-5" />
							</div>

							<Button
								variant="ghost"
								size="icon"
								onClick={handleLogout}
								className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
								title="Logout"
							>
								<LogOut className="h-5 w-5" />
							</Button>
						</div>
					)}
				</div>
			</div>
		</header>
	);
}

