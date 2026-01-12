"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { FormError } from "@/components/form-error";
import { LoadingSpinner } from "@/components/loading-spinner";

export default function LoginPage() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [identifier, setIdentifier] = useState("");
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
				body: JSON.stringify({ email, identifier }),
			});

			const data = await res.json();

			if (!res.ok) {
				setError(data.error || "Invalid credentials. Please try again.");
				return;
			}

			sessionStorage.setItem("temp_user", JSON.stringify(data));

			if (!data.isPasswordSet) {
				router.push(`/onboarding/set-password?userId=${data.userId}`);
			} else {
				// User already has password set, redirect to dashboard
				router.push("/dashboard");
			}
		} catch (err) {
			console.error("[v0] Login error:", err);
			setError(
				"An error occurred. Please check your connection and try again."
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<AuthLayout>
			<Card>
				<CardHeader className="space-y-2">
					<div className="flex items-center gap-2">
						<div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
							HA
						</div>
						<CardTitle className="text-2xl">Hallmark Assignment</CardTitle>
					</div>
					<CardDescription>Sign in with your credentials</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleLogin} className="space-y-4">
						{error && <FormError message={error} />}

						<div className="space-y-2">
							<label htmlFor="email" className="text-sm font-medium">
								Email Address
							</label>
							<Input
								id="email"
								type="email"
								placeholder="your.email@hallmark.edu"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								disabled={loading}
								required
							/>
						</div>

						<div className="space-y-2">
							<label htmlFor="identifier" className="text-sm font-medium">
								Matric / Lecturer / Admin Number
							</label>
							<Input
								id="identifier"
								type="text"
								placeholder="e.g., HU/CS/21/0045 or ADMIN001"
								value={identifier}
								onChange={(e) => setIdentifier(e.target.value)}
								disabled={loading}
								required
							/>
						</div>

						<Button type="submit" className="w-full" disabled={loading}>
							{loading ? <LoadingSpinner size="sm" /> : "Sign In"}
						</Button>

						<p className="text-xs text-center text-muted-foreground">
							For the first time, use your email and identifier. You&apos;ll set
							a password on first login.
						</p>
					</form>
				</CardContent>
			</Card>
		</AuthLayout>
	);
}
