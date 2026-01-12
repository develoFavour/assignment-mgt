"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/loading-spinner";
import { AlertCircle, CheckCircle } from "lucide-react";

function VerifyEmailContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get("token");
	const error = searchParams.get("error");
	const success = searchParams.get("success");

	let status: "loading" | "success" | "error" = "loading";
	let message = "";

	if (success) {
		status = "success";
		message = "Email verified successfully.";
	} else if (error) {
		status = "error";
		switch (error) {
			case "invalid-token":
				message =
					"Invalid verification link. Please contact your administrator.";
				break;
			case "token-expired":
				message =
					"Verification link has expired. Please contact your administrator for a new one.";
				break;
			case "verification-failed":
				message =
					"Verification failed. Please try again or contact your administrator.";
				break;
			default:
				message = "An error occurred during verification.";
		}
	} else if (!token) {
		status = "error";
		message = "No verification token provided.";
	} else {
		// Redirect to the verification API
	}

	useEffect(() => {
		if (token && !error && !success) {
			window.location.href = `/api/auth/verify-email?token=${token}`;
		}
	}, [token, error, success]);

	if (status === "loading") {
		return (
			<AuthLayout>
				<Card>
					<CardContent className="pt-6">
						<div className="flex flex-col items-center justify-center py-12">
							<LoadingSpinner text="Verifying your email..." />
						</div>
					</CardContent>
				</Card>
			</AuthLayout>
		);
	}

	return (
		<AuthLayout>
			<Card>
				<CardHeader className="space-y-2">
					<CardTitle className="text-2xl flex items-center gap-2">
						{status === "success" ? (
							<>
								<CheckCircle className="h-6 w-6 text-green-600" />
								Email Verified
							</>
						) : (
							<>
								<AlertCircle className="h-6 w-6 text-red-600" />
								Verification Failed
							</>
						)}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-center space-y-4">
						<p className="text-muted-foreground">{message}</p>
						{status === "error" && (
							<button
								onClick={() => router.push("/login")}
								className="text-primary hover:underline"
							>
								Return to Login
							</button>
						)}
					</div>
				</CardContent>
			</Card>
		</AuthLayout>
	);
}

export default function VerifyEmailPage() {
	return (
		<Suspense
			fallback={
				<AuthLayout>
					<Card>
						<CardContent className="pt-6">
							<div className="flex flex-col items-center justify-center py-12">
								<LoadingSpinner text="Loading..." />
							</div>
						</CardContent>
					</Card>
				</AuthLayout>
			}
		>
			<VerifyEmailContent />
		</Suspense>
	);
}
