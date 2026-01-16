"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const checkAuth = useAuthStore((state) => state.checkAuth);

    useEffect(() => {
        // Hydrate session from server on mount
        checkAuth();
    }, [checkAuth]);

    return <>{children}</>;
}
