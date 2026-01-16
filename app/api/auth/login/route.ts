import { type NextRequest, NextResponse } from "next/server";
import { getUsersCollection } from "@/lib/db";
import { isValidEmail, verifyPassword } from "@/lib/auth";
import { logEvent } from "@/lib/logger";

export async function POST(request: NextRequest) {
	try {
		const { identifier, password } = await request.json();

		// Validate input
		if (!identifier || !password) {
			return NextResponse.json(
				{ error: "Identifier and password are required" },
				{ status: 400 }
			);
		}

		const usersCollection = await getUsersCollection();

		let query: Record<string, unknown>;
		if (isValidEmail(identifier)) {
			query = { email: identifier.toLowerCase() };
		} else {
			query = {
				$or: [
					{ matric_number: identifier.toUpperCase() },
					{ lecturer_number: identifier.toUpperCase() },
				],
			};
		}

		const user = await usersCollection.findOne(query);

		if (!user) {
			return NextResponse.json(
				{ error: "Invalid credentials" },
				{ status: 401 }
			);
		}

		// Only allow login if user has set password
		if (!user.isPasswordSet || !user.password_hash) {
			return NextResponse.json(
				{
					error:
						"Please check your email and verify your account before logging in",
				},
				{ status: 401 }
			);
		}

		// Verify password
		const valid = await verifyPassword(password, user.password_hash);
		if (!valid) {
			console.warn("[login] Password mismatch for user", user.email);
			return NextResponse.json(
				{ error: "Invalid credentials" },
				{ status: 401 }
			);
		}

		// Log the successful login
		await logEvent({
			action: `User signed in: ${user.full_name || user.email}`,
			user: user.role,
			level: "success",
		});

		const response = NextResponse.json({
			userId: user._id,
			email: user.email,
			role: user.role,
			isPasswordSet: true,
		});

		// Store session cookie
		response.cookies.set(
			"session",
			JSON.stringify({ userId: user._id, role: user.role, email: user.email }),
			{
				path: "/",
				httpOnly: false,
				sameSite: "lax",
			}
		);

		return response;
	} catch (error) {
		console.error("[v0] Login error:", error);
		return NextResponse.json(
			{ error: "An error occurred during login" },
			{ status: 500 }
		);
	}
}
