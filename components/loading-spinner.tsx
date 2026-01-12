import { Loader } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
	size?: "sm" | "md" | "lg";
	text?: string;
	className?: string;
}

export function LoadingSpinner({ size = "md", text, className }: LoadingSpinnerProps) {
	const sizeClasses = {
		sm: "h-6 w-6",
		md: "h-8 w-8",
		lg: "h-12 w-12",
	};

	return (
		<div className={cn("flex flex-col items-center justify-center gap-3", className)}>
			<Loader className={`${sizeClasses[size]} animate-spin text-primary`} />
			{text && <p className="text-sm text-muted-foreground">{text}</p>}
		</div>
	);
}
