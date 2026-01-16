import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Session } from "./types";

interface AuthStore {
	session: Session | null;
	setSession: (session: Session | null) => void;
	logout: () => void;
	checkAuth: () => Promise<void>;
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
				// Clear the session cookie via API or locally if non-httpOnly
				if (typeof document !== "undefined") {
					document.cookie = "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
				}
			},
			checkAuth: async () => {
				try {
					const res = await fetch("/api/auth/me");
					if (res.ok) {
						const data = await res.json();
						set({ session: data.session });
					}
				} catch (error) {
					console.error("Failed to check auth status:", error);
					set({ session: null });
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
