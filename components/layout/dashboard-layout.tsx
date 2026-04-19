"use client";

import { ReactNode, useEffect, useState } from "react";
import { Header } from "./header";
import { Sidebar } from "./sidebar";
import { useUIStore, useAuthStore } from "@/lib/store";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavigationItem {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
}

interface DashboardLayoutProps {
    children: ReactNode;
    navigationItems: NavigationItem[];
}

export function DashboardLayout({ children, navigationItems }: DashboardLayoutProps) {
    const { sidebarOpen, setSidebarOpen } = useUIStore();
    const { session } = useAuthStore();
    const pathname = usePathname();
    const router = useRouter();

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Session check and redirect (Handles production auth lag)
    useEffect(() => {
        if (mounted && !session) {
            router.push("/login");
        }
    }, [session, router, mounted]);

    // Close sidebar on navigation (mobile)
    useEffect(() => {
        setSidebarOpen(false);
    }, [pathname, setSidebarOpen]);

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <Sidebar navigationItems={navigationItems} />

            {/* Mobile Backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden transition-all duration-300"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <main
                className={cn(
                    "transition-all duration-300 min-h-screen lg:ml-64",
                    "ml-0"
                )}
            >
                <div className="pt-16"> {/* Spacer for Header */}
                    {children}
                </div>
            </main>
        </div>
    );
}
