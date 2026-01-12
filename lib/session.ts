import type { Session } from "./types";
import { cookies } from "next/headers";

export async function setSession(session: Session): Promise<void> {
	const cookieStore = await cookies();
	cookieStore.set("session", JSON.stringify(session), {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		maxAge: 60 * 60 * 24 * 7, // 7 days
	});
}

export async function getSession(): Promise<Session | null> {
	const cookieStore = await cookies();
	const sessionCookie = cookieStore.get("session");

	if (!sessionCookie) {
		return null;
	}

	try {
		return JSON.parse(sessionCookie.value);
	} catch {
		return null;
	}
}

export async function clearSession(): Promise<void> {
	const cookieStore = await cookies();
	cookieStore.delete("session");
}
