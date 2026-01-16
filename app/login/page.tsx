"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormError } from "@/components/form-error";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Lock, User, ArrowRight, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function LoginPage() {
	const router = useRouter();
	const { setSession } = useAuthStore();
	const [identifier, setIdentifier] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			const res = await fetch("/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ identifier, password }),
			});

			const data = await res.json();

			if (!res.ok) {
				setError(data.error || "Invalid credentials. Please try again.");
				return;
			}

			setSession(data as any);
			sessionStorage.setItem("temp_user", JSON.stringify(data));
			toast.success("Login successful");

			if (data.requiresPasswordSetup || !data.isPasswordSet) {
				router.push("/onboarding/set-password");
			} else {
				switch (data.role) {
					case "admin":
						router.push("/admin");
						break;
					case "lecturer":
						router.push("/lecturer");
						break;
					default:
						router.push("/student");
				}
			}
		} catch (err) {
			console.error("[Login] error:", err);
			toast.error("An error occurred. Please check your connection.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<AuthLayout>
			<div className="space-y-12">
				{/* Branding for Mobile (Hidden on Desktop because it's in the Hero) */}
				<div className="lg:hidden flex items-center gap-3 mb-12">
					<div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
						<ShieldCheck className="h-6 w-6" />
					</div>
					<div className="flex flex-col">
						<span className="text-lg font-black tracking-tighter uppercase leading-none">Hallmark</span>
						<span className="text-[10px] font-bold tracking-[0.3em] uppercase opacity-60">University</span>
					</div>
				</div>

				<div className="space-y-4">
					<h2 className="text-4xl font-extrabold tracking-tight text-foreground">
						Welcome Back.
					</h2>
					<p className="text-muted-foreground text-lg font-medium">
						Enter your details to access the management portal.
					</p>
				</div>

				<form onSubmit={handleLogin} className="space-y-8">
					{error && <FormError message={error} />}

					<div className="space-y-6">
						<div className="space-y-2 group">
							<label
								htmlFor="identifier"
								className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 group-focus-within:text-primary transition-colors"
							>
								Email or ID Number
							</label>
							<div className="relative">
								<User className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
								<Input
									id="identifier"
									type="text"
									placeholder="e.g. HU/CS/21/0045"
									className="bg-transparent border-0 border-b border-border rounded-none px-7 py-6 h-auto text-lg focus-visible:ring-0 focus-visible:border-primary transition-all placeholder:text-muted-foreground/30 font-medium"
									value={identifier}
									onChange={(e) => setIdentifier(e.target.value)}
									disabled={loading}
									required
								/>
							</div>
						</div>

						<div className="space-y-2 group">
							<div className="flex items-center justify-between pl-1">
								<label
									htmlFor="password"
									className="text-xs font-bold text-muted-foreground uppercase tracking-widest group-focus-within:text-primary transition-colors"
								>
									Security Password
								</label>
								<button
									type="button"
									className="text-xs font-bold text-primary hover:opacity-70 transition-opacity uppercase tracking-tighter"
								>
									Recovery?
								</button>
							</div>
							<div className="relative">
								<Lock className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
								<Input
									id="password"
									type="password"
									placeholder="••••••••"
									className="bg-transparent border-0 border-b border-border rounded-none px-7 py-6 h-auto text-lg focus-visible:ring-0 focus-visible:border-primary transition-all placeholder:text-muted-foreground/30 font-medium"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									disabled={loading}
									required
								/>
							</div>
						</div>
					</div>

					<div className="pt-4 flex flex-col sm:flex-row items-center gap-6">
						<Button
							type="submit"
							className="w-full sm:w-auto px-10 h-14 text-base font-bold rounded-2xl shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 overflow-hidden group"
							disabled={loading}
						>
							{loading ? (
								<div className="flex items-center gap-2">
									<LoadingSpinner size="sm" />
									<span>Verifying Identity...</span>
								</div>
							) : (
								<>
									<span>Authenticate</span>
									<ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
								</>
							)}
						</Button>

						<p className="text-xs text-muted-foreground font-medium leading-relaxed max-w-[180px]">
							New to the portal? Check your university mail for setup.
						</p>
					</div>
				</form>

				<div className="pt-12 flex items-center gap-8 text-muted-foreground/40">
					<div className="flex items-center gap-2">
						<ShieldCheck className="h-4 w-4" />
						<span className="text-[10px] font-bold uppercase tracking-wider">Secure Access</span>
					</div>
					<div className="flex items-center gap-2 font-medium text-[10px]">
						<span className="h-1 w-1 rounded-full bg-current" />
						<span>ICT Support v4.2</span>
					</div>
				</div>
			</div>
		</AuthLayout>
	);
}


