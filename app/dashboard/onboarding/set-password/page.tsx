"use client";

import type React from "react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { AlertCircle, CheckCircle } from "lucide-react";

export default function SetPasswordPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

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
			const userId = searchParams.get("userId");
			if (!userId) {
				setError("Invalid session. Please login again.");
				return;
			}

			const res = await fetch(`/api/auth/set-password?userId=${userId}`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ password }),
			});

			const data = await res.json();

			if (!res.ok) {
				setError(data.error || "Failed to set password");
				return;
			}

			const tempUser = sessionStorage.getItem("temp_user");
			const user = tempUser ? JSON.parse(tempUser) : null;

			if (user?.role === "student") {
				// Students must select courses
				router.push("/onboarding/select-courses");
			} else if (user?.role === "lecturer") {
				// Lecturers go directly to dashboard
				router.push("/lecturer");
			} else if (user?.role === "admin") {
				// Admins go directly to dashboard
				router.push("/admin");
			} else {
				// Fallback
				router.push("/dashboard");
			}

			// Clear temp user
			sessionStorage.removeItem("temp_user");
		} catch (err) {
			setError("An error occurred. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<AuthLayout>
			<Card>
				<CardHeader className="space-y-2">
					<CardTitle className="text-2xl">Create Password</CardTitle>
					<CardDescription>
						Set your secure password to access your account
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSetPassword} className="space-y-4">
						{error && (
							<div className="flex gap-3 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
								<AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
								<p>{error}</p>
							</div>
						)}

						<div className="space-y-2">
							<label htmlFor="password" className="text-sm font-medium">
								Password
							</label>
							<Input
								id="password"
								type="password"
								placeholder="At least 8 characters"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
						</div>

						<div className="space-y-2">
							<label htmlFor="confirm" className="text-sm font-medium">
								Confirm Password
							</label>
							<Input
								id="confirm"
								type="password"
								placeholder="Confirm your password"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								required
							/>
						</div>

						<div className="text-xs text-muted-foreground space-y-1">
							<div className="flex gap-2 items-center">
								<CheckCircle
									className={`h-4 w-4 ${
										password.length >= 8
											? "text-green-600"
											: "text-muted-foreground"
									}`}
								/>
								<span>At least 8 characters</span>
							</div>
							<div className="flex gap-2 items-center">
								<CheckCircle
									className={`h-4 w-4 ${
										password === confirmPassword && password.length > 0
											? "text-green-600"
											: "text-muted-foreground"
									}`}
								/>
								<span>Passwords match</span>
							</div>
						</div>

						<Button type="submit" className="w-full" disabled={loading}>
							{loading ? "Setting Password..." : "Continue"}
						</Button>
					</form>
				</CardContent>
			</Card>
		</AuthLayout>
	);
}
