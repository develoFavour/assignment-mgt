"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { LayoutDashboard, FileText, ClipboardCheck, BookOpen } from "lucide-react";

const lecturerNavigationItems = [
	{ href: "/lecturer", label: "Dashboard", icon: LayoutDashboard },
	{ href: "/lecturer/assignments", label: "Assignments", icon: FileText },
	{ href: "/lecturer/grades", label: "Grades", icon: ClipboardCheck },
	{ href: "/lecturer/materials", label: "Course Materials", icon: BookOpen },
];

export default function LecturerLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<DashboardLayout navigationItems={lecturerNavigationItems}>
			{children}
		</DashboardLayout>
	);
}
