import { AlertCircle } from "lucide-react";

interface FormErrorProps {
	message: string;
}

export function FormError({ message }: FormErrorProps) {
	return (
		<div className="flex gap-3 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
			<AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
			<p>{message}</p>
		</div>
	);
}
