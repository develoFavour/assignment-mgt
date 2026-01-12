"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function Error({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error("[v0] Error:", error);
	}, [error]);

	return (
		<div className="min-h-screen flex items-center justify-center p-4 bg-background">
			<div className="max-w-md w-full space-y-6">
				<div className="flex justify-center">
					<AlertCircle className="h-12 w-12 text-destructive" />
				</div>
				<div className="text-center space-y-2">
					<h1 className="text-2xl font-bold text-foreground">
						Something went wrong
					</h1>
					<p className="text-sm text-muted-foreground">
						An unexpected error occurred. Please try again.
					</p>
				</div>
				<div className="flex gap-2">
					<Button onClick={() => reset()} className="flex-1">
						Try again
					</Button>
					<Button
						onClick={() => (window.location.href = "/")}
						variant="outline"
						className="flex-1"
					>
						Go Home
					</Button>
				</div>
			</div>
		</div>
	);
}
