import { type NextRequest, NextResponse } from "next/server";
import { getUsersCollection } from "@/lib/db";
import { isValidEmail } from "@/lib/auth";

export async function POST(request: NextRequest) {
	try {
		const { email, identifier } = await request.json();

		// Validate input
		if (!email || !identifier) {
			return NextResponse.json(
				{ error: "Email and identifier are required" },
				{ status: 400 }
			);
		}

		if (!isValidEmail(email)) {
			return NextResponse.json(
				{ error: "Invalid email format" },
				{ status: 400 }
			);
		}

		const usersCollection = await getUsersCollection();

		const user = await usersCollection.findOne({
			email: email.toLowerCase(),
			$or: [
				{ matric_number: identifier },
				{ lecturer_number: identifier },
				{ admin_id: identifier },
			],
		});

		if (!user) {
			return NextResponse.json(
				{ error: "Invalid email or identifier" },
				{ status: 401 }
			);
		}

		return NextResponse.json({
			userId: user._id.toString(),
			email: user.email,
			role: user.role,
			isPasswordSet: user.isPasswordSet,
		});
	} catch (error) {
		console.error("[v0] Login error:", error);
		return NextResponse.json(
			{ error: "An error occurred during login" },
			{ status: 500 }
		);
	}
}
