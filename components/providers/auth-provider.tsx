"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const hydrateFromCookie = useAuthStore((state) => state.hydrateFromCookie);

    useEffect(() => {
        // Hydrate session from cookie on mount
        hydrateFromCookie();
    }, [hydrateFromCookie]);

    return <>{children}</>;
}
