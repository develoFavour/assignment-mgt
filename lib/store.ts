import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Session } from "./types";

interface AuthStore {
	session: Session | null;
	setSession: (session: Session | null) => void;
	logout: () => void;
	hydrateFromCookie: () => void;
}

export const useAuthStore = create<AuthStore>()(
	persist(
		(set) => ({
			session: null,
			setSession: (session) => {
				set({ session });
			},
			logout: () => {
				set({ session: null });
				// Clear the session cookie
				if (typeof document !== "undefined") {
					document.cookie = "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
				}
			},
			hydrateFromCookie: () => {
				if (typeof document !== "undefined") {
					const cookies = document.cookie.split("; ");
					const sessionCookie = cookies.find((c) => c.startsWith("session="));
					if (sessionCookie) {
						try {
							const sessionData = JSON.parse(
								decodeURIComponent(sessionCookie.split("=")[1])
							);
							set({ session: sessionData });
						} catch (error) {
							console.error("Failed to parse session cookie:", error);
						}
					}
				}
			},
		}),
		{
			name: "auth-storage",
		}
	)
);

interface UIStore {
	sidebarOpen: boolean;
	setSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
	sidebarOpen: true,
	setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
