import { type NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
	const protectedRoutes = [
		"/admin",
		"/lecturer",
		"/student",
		"/onboarding",
		"/dashboard",
	];
	const isProtected = protectedRoutes.some((route) =>
		request.nextUrl.pathname.startsWith(route)
	);

	if (isProtected) {
		// Check for session cookie
		const sessionCookie = request.cookies.get("session");

		if (!sessionCookie) {
			return NextResponse.redirect(new URL("/login", request.url));
		}
	}

	const publicRoutes = ["/login"];
	const isPublic = publicRoutes.some(
		(route) => request.nextUrl.pathname === route
	);

	if (isPublic) {
		const sessionCookie = request.cookies.get("session");
		if (sessionCookie) {
			try {
				const session = JSON.parse(sessionCookie.value);
				return NextResponse.redirect(new URL(`/${session.role}`, request.url));
			} catch (err) {
				// Invalid session, let them stay on login
			}
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
