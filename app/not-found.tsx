import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
	return (
		<div className="min-h-screen flex items-center justify-center p-4 bg-background">
			<div className="max-w-md w-full space-y-6">
				<div className="text-center space-y-2">
					<h1 className="text-5xl font-bold text-foreground">404</h1>
					<p className="text-xl font-semibold text-foreground">
						Page not found
					</p>
					<p className="text-sm text-muted-foreground">
						The page you are looking for does not exist.
					</p>
				</div>
				<Link href="/">
					<Button className="w-full">Go Home</Button>
				</Link>
			</div>
		</div>
	);
}
