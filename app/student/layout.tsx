"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { LayoutDashboard, BookOpen, Book, FileText } from "lucide-react";

const studentNavigationItems = [
	{ href: "/student", label: "Dashboard", icon: LayoutDashboard },
	{ href: "/student/courses", label: "My Courses", icon: BookOpen },
	{ href: "/student/materials", label: "Course Materials", icon: Book },
	{ href: "/student/assignments", label: "Assignments", icon: FileText },
];

export default function StudentLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<DashboardLayout navigationItems={studentNavigationItems}>
			{children}
		</DashboardLayout>
	);
}
