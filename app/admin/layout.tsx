"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { LayoutDashboard, Users, BookOpen } from "lucide-react";

const adminNavigationItems = [
	{ href: "/admin", label: "Dashboard", icon: LayoutDashboard },
	{ href: "/admin/users", label: "Users", icon: Users },
	{ href: "/admin/courses", label: "Courses", icon: BookOpen },
];

export default function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<DashboardLayout navigationItems={adminNavigationItems}>
			{children}
		</DashboardLayout>
	);
}
