"use client";
import { Component, type ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
	children: ReactNode;
}

interface State {
	hasError: boolean;
	error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error) {
		console.error("[v0] Error caught by boundary:", error);
	}

	render() {
		if (this.state.hasError) {
			return (
				<div className="flex flex-col items-center justify-center gap-4 p-6 text-center">
					<AlertCircle className="h-12 w-12 text-destructive" />
					<div>
						<h2 className="font-semibold text-foreground">
							Something went wrong
						</h2>
						<p className="text-sm text-muted-foreground mt-1">
							{this.state.error?.message}
						</p>
					</div>
					<Button
						onClick={() => this.setState({ hasError: false, error: null })}
					>
						Try again
					</Button>
				</div>
			);
		}

		return this.props.children;
	}
}
