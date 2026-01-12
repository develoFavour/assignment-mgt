import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { ErrorBoundary } from "@/components/error-boundary";
import { AuthProvider } from "@/components/providers/auth-provider";
import { Toaster } from "@/components/ui/sonner";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Hallmark Assignment Management System",
	description:
		"University assignment management system for lecturers, students, and administrators",
	generator: "v0.app",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`font-sans antialiased`}>
				<AuthProvider>
					<ErrorBoundary>
						{children}
						<Toaster position="top-center" expand={true} richColors />
						<Analytics />
					</ErrorBoundary>
				</AuthProvider>
			</body>
		</html>
	);
}
