import { type NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
	const protectedRoutes = ["/admin", "/lecturer", "/student", "/dashboard"];
	const isProtected = protectedRoutes.some((route) =>
		request.nextUrl.pathname.startsWith(route)
	);

	if (isProtected) {
		// Check for session cookie
		const sessionCookie = request.cookies.get("session");

		if (!sessionCookie) {
			return NextResponse.redirect(new URL("/login", request.url));
		}

		try {
			const session = JSON.parse(sessionCookie.value);

			if (!session.role) {
				return NextResponse.redirect(new URL("/login", request.url));
			}

			// Check role-based access
			const requestedRole = request.nextUrl.pathname.split("/")[1]?.toLowerCase();

			if (requestedRole && session.role !== requestedRole && requestedRole !== "dashboard") {
				return NextResponse.redirect(new URL(`/${session.role}`, request.url));
			}
		} catch (err) {
			return NextResponse.redirect(new URL("/login", request.url));
		}
	}

	// Handle onboarding routes - require valid verification token or session
	const onboardingRoutes = ["/onboarding"];
	const isOnboarding = onboardingRoutes.some((route) =>
		request.nextUrl.pathname.startsWith(route)
	);

	if (isOnboarding) {
		const sessionCookie = request.cookies.get("session");
		const verificationToken = request.cookies.get("verification_token");

		// Allow access if they have verification token (email verification flow)
		if (verificationToken) {
			return NextResponse.next();
		}

		// Or if they have a valid session (shouldn't happen for new users)
		if (sessionCookie) {
			try {
				const session = JSON.parse(sessionCookie.value);
				// Allow students to access course selection onboarding
				if (
					session.role === "student" &&
					request.nextUrl.pathname === "/onboarding/select-courses"
				) {
					return NextResponse.next();
				}
				// User already has session, redirect to their dashboard
				return NextResponse.redirect(new URL(`/${session.role}`, request.url));
			} catch (err) {
				// Invalid session, continue to onboarding
			}
		}

		// No valid token or session, redirect to login
		return NextResponse.redirect(new URL("/login", request.url));
	}

	// Handle auth routes
	const authRoutes = ["/auth"];
	const isAuth = authRoutes.some((route) =>
		request.nextUrl.pathname.startsWith(route)
	);

	if (isAuth) {
		const sessionCookie = request.cookies.get("session");
		if (sessionCookie) {
			try {
				const session = JSON.parse(sessionCookie.value);
				// User already logged in, redirect to dashboard
				return NextResponse.redirect(new URL(`/${session.role}`, request.url));
			} catch (err) {
				// Invalid session, continue
			}
		}
	}

	const publicRoutes = ["/login", "/"];
	const isPublic = publicRoutes.some(
		(route) => request.nextUrl.pathname === route
	);

	if (isPublic) {
		const sessionCookie = request.cookies.get("session");
		if (sessionCookie) {
			try {
				const session = JSON.parse(sessionCookie.value);
				// User already logged in, redirect to their dashboard
				return NextResponse.redirect(new URL(`/${session.role}`, request.url));
			} catch (err) {
				// Invalid session, let them stay on the public page
			}
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
