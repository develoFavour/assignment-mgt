import { type NextRequest, NextResponse } from "next/server";
import { getUsersCollection } from "@/lib/db";
import { isTokenExpired } from "@/lib/tokens";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const token = searchParams.get("token");

		if (!token) {
			return NextResponse.redirect(
				new URL("/login?error=invalid-token", request.url)
			);
		}

		const usersCollection = await getUsersCollection();

		// Find user with valid verification token
		const user = await usersCollection.findOne({
			verification_token: token,
			isPasswordSet: false,
		});

		if (!user) {
			return NextResponse.redirect(
				new URL("/login?error=invalid-token", request.url)
			);
		}

		// Check if token has expired
		if (isTokenExpired(user.verification_expires_at)) {
			return NextResponse.redirect(
				new URL("/login?error=token-expired", request.url)
			);
		}

		// Token is valid, allow user to set password
		// Store user info in temporary storage for password setup
		const response = NextResponse.redirect(
			new URL("/onboarding/set-password", request.url)
		);
		response.cookies.set("verification_token", token, {
			path: "/",
			httpOnly: true,
			sameSite: "lax",
			maxAge: 60 * 60, // 1 hour
		});

		return response;
	} catch (error) {
		console.error("[auth] Email verification error:", error);
		return NextResponse.redirect(
			new URL("/login?error=verification-failed", request.url)
		);
	}
}
