"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormError } from "@/components/form-error";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Lock, CheckCircle2, ShieldCheck, ArrowRight, ShieldAlert, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SetPasswordPage() {
	const router = useRouter();
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);

	const validatePassword = () => {
		if (password.length < 8) {
			setError("Password must be at least 8 characters");
			return false;
		}
		if (password !== confirmPassword) {
			setError("Passwords do not match");
			return false;
		}
		return true;
	};

	const handleSetPassword = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (!validatePassword()) return;

		setLoading(true);
		try {
			const res = await fetch("/api/auth/set-password", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ password }),
			});

			const data = await res.json();

			if (!res.ok) {
				setError(data.error || "Failed to set password");
				return;
			}

			if (data.user) {
				sessionStorage.setItem("user", JSON.stringify(data.user));
				if (data.user.role === "student") {
					router.push("/onboarding/select-courses");
				} else {
					router.push(`/${data.user.role}`);
				}
			} else {
				router.push("/login");
			}
		} catch (err) {
			setError("An error occurred. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<AuthLayout>
			<div className="space-y-12">
				{/* Branding for Mobile */}
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
					<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
						<ShieldCheck className="h-3 w-3" />
						Security Setup
					</div>
					<h2 className="text-4xl font-extrabold tracking-tight text-foreground">
						Secure Your Account.
					</h2>
					<p className="text-muted-foreground text-lg font-medium leading-relaxed">
						Create a strong permanent password to ensure your data remains protected.
					</p>
				</div>

				<form onSubmit={handleSetPassword} className="space-y-8">
					{error && <FormError message={error} />}

					<div className="space-y-6">
						{/* Password Field */}
						<div className="space-y-2 group">
							<label
								htmlFor="password"
								className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 group-focus-within:text-primary transition-colors"
							>
								New Password
							</label>
							<div className="relative group/pass">
								<Lock className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/40 group-focus-within/pass:text-primary transition-colors" />
								<Input
									id="password"
									type={showPassword ? "text" : "password"}
									placeholder="At least 8 characters"
									className="bg-transparent border-0 border-b border-border rounded-none px-7 py-6 h-auto text-lg focus-visible:ring-0 focus-visible:border-primary transition-all placeholder:text-muted-foreground/30 font-medium w-full"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-primary transition-colors pr-1"
								>
									{showPassword ? (
										<EyeOff className="h-5 w-5" />
									) : (
										<Eye className="h-5 w-5" />
									)}
								</button>
							</div>
						</div>

						{/* Confirm Password Field */}
						<div className="space-y-2 group">
							<label
								htmlFor="confirm"
								className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 group-focus-within:text-primary transition-colors"
							>
								Confirm Password
							</label>
							<div className="relative group/confirm">
								<ShieldAlert className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/40 group-focus-within/confirm:text-primary transition-colors" />
								<Input
									id="confirm"
									type={showConfirm ? "text" : "password"}
									placeholder="Must match exactly"
									className="bg-transparent border-0 border-b border-border rounded-none px-7 py-6 h-auto text-lg focus-visible:ring-0 focus-visible:border-primary transition-all placeholder:text-muted-foreground/30 font-medium w-full"
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									required
								/>
								<button
									type="button"
									onClick={() => setShowConfirm(!showConfirm)}
									className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-primary transition-colors pr-1"
								>
									{showConfirm ? (
										<EyeOff className="h-5 w-5" />
									) : (
										<Eye className="h-5 w-5" />
									)}
								</button>
							</div>
						</div>
					</div>

					{/* Feedback Indicators */}
					<div className="space-y-3 pl-1">
						<div className={cn(
							"flex items-center gap-2 text-xs font-bold transition-colors",
							password.length >= 8 ? "text-emerald-600" : "text-muted-foreground/40"
						)}>
							<CheckCircle2 className="h-4 w-4" />
							<span className="uppercase tracking-widest">At least 8 characters</span>
						</div>
						<div className={cn(
							"flex items-center gap-2 text-xs font-bold transition-colors",
							password === confirmPassword && password.length > 0 ? "text-emerald-600" : "text-muted-foreground/40"
						)}>
							<CheckCircle2 className="h-4 w-4" />
							<span className="uppercase tracking-widest">Passwords match</span>
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
									<span>Finalizing...</span>
								</div>
							) : (
								<>
									<span>Continue Setup</span>
									<ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
								</>
							)}
						</Button>

						<p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-relaxed max-w-[180px]">
							Security Step 1 of 2 &bull; Identity Protection
						</p>
					</div>
				</form>

				<div className="pt-12 flex items-center gap-8 text-muted-foreground/40">
					<div className="flex items-center gap-2 font-medium text-[10px]">
						<span>&copy; {new Date().getFullYear()} Hallmark Identity Service</span>
					</div>
				</div>
			</div>
		</AuthLayout>
	);
}

