import { CheckCircle } from "lucide-react";

interface FormSuccessProps {
	message: string;
}

export function FormSuccess({ message }: FormSuccessProps) {
	return (
		<div className="flex gap-3 rounded-lg bg-green-50 dark:bg-green-950/20 p-3 text-sm text-green-700 dark:text-green-400">
			<CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
			<p>{message}</p>
		</div>
	);
}
