import { type NextRequest, NextResponse } from "next/server";
import { getUsersCollection } from "@/lib/db";
import { hashPassword, isStrongPassword } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function POST(request: NextRequest) {
	try {
		const { password } = await request.json();

		if (!password || !isStrongPassword(password)) {
			return NextResponse.json(
				{ error: "Password must be at least 8 characters" },
				{ status: 400 }
			);
		}

		// Get verification token from cookie
		const verificationToken = request.cookies.get("verification_token");
		if (!verificationToken) {
			return NextResponse.json(
				{ error: "Verification token not found" },
				{ status: 401 }
			);
		}

		const usersCollection = await getUsersCollection();
		const passwordHash = await hashPassword(password);

		// Find user by verification token
		const user = await usersCollection.findOne({
			verification_token: verificationToken.value,
			isPasswordSet: false,
		});

		if (!user) {
			return NextResponse.json(
				{ error: "Invalid or expired verification token" },
				{ status: 401 }
			);
		}

		// Update user with new password and clear verification token
		const result = await usersCollection.updateOne(
			{ _id: new ObjectId(user._id) },
			{
				$set: {
					password_hash: passwordHash,
					isPasswordSet: true,
				},
				$unset: {
					verification_token: "",
					verification_expires_at: "",
					temp_password_hash: "",
				},
			}
		);

		if (result.matchedCount === 0) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		// Create session and clear verification token
		const response = NextResponse.json({
			success: true,
			user: {
				userId: user._id,
				email: user.email,
				role: user.role,
				isPasswordSet: true,
			},
		});

		// Set session cookie
		response.cookies.set(
			"session",
			JSON.stringify({
				userId: user._id,
				role: user.role,
				email: user.email,
			}),
			{
				path: "/",
				httpOnly: false,
				sameSite: "lax",
			}
		);

		// Clear verification token
		response.cookies.set("verification_token", "", {
			path: "/",
			httpOnly: true,
			sameSite: "lax",
			maxAge: 0,
		});

		return response;
	} catch (error) {
		console.error("[v0] Set password error:", error);
		return NextResponse.json(
			{ error: "Failed to set password" },
			{ status: 500 }
		);
	}
}
