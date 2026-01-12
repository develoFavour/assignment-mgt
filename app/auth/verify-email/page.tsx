"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthLayout } from "@/components/layout/auth-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/loading-spinner";
import { AlertCircle, CheckCircle } from "lucide-react";

export default function VerifyEmailPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [status, setStatus] = useState<"loading" | "success" | "error">(
		"loading"
	);
	const [message, setMessage] = useState("");

	useEffect(() => {
		const token = searchParams.get("token");
		const error = searchParams.get("error");

		if (error) {
			setStatus("error");
			switch (error) {
				case "invalid-token":
					setMessage(
						"Invalid verification link. Please contact your administrator."
					);
					break;
				case "token-expired":
					setMessage(
						"Verification link has expired. Please contact your administrator for a new one."
					);
					break;
				case "verification-failed":
					setMessage(
						"Verification failed. Please try again or contact your administrator."
					);
					break;
				default:
					setMessage("An error occurred during verification.");
			}
			return;
		}

		if (!token) {
			setStatus("error");
			setMessage("No verification token provided.");
			return;
		}

		// Redirect to the verification API
		window.location.href = `/api/auth/verify-email?token=${token}`;
	}, [searchParams]);

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
