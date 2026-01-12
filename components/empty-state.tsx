"use client";

import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

interface EmptyStateProps {
	icon?: ReactNode;
	title: string;
	description: string;
	action?: {
		label: string;
		onClick: () => void;
	};
}

export function EmptyState({
	icon,
	title,
	description,
	action,
}: EmptyStateProps) {
	return (
		<div className="flex flex-col items-center justify-center gap-4 p-12 text-center">
			{icon || <Package className="h-12 w-12 text-muted-foreground" />}
			<div>
				<h3 className="font-semibold text-foreground">{title}</h3>
				<p className="text-sm text-muted-foreground mt-1">{description}</p>
			</div>
			{action && (
				<Button onClick={action.onClick} size="sm" className="mt-2">
					{action.label}
				</Button>
			)}
		</div>
	);
}
