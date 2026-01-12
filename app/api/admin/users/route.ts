import { type NextRequest, NextResponse } from "next/server";
import { getUsersCollection } from "@/lib/db";
import { generateEmailVerificationToken } from "@/lib/tokens";
import { emailService } from "@/lib/email";

export async function GET(request: NextRequest) {
	try {
		const usersCollection = await getUsersCollection();
		const users = await usersCollection
			.find({ role: { $in: ["student", "lecturer"] } })
			.project({
				password_hash: 0,
				temp_password_hash: 0,
				verification_token: 0,
			})
			.toArray();

		return NextResponse.json({ users });
	} catch (error) {
		return NextResponse.json(
			{ error: "Failed to fetch users" },
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const { email, role, first_name, last_name, matric_number, level } =
			await request.json();

		const usersCollection = await getUsersCollection();

		// Check if user already exists
		const existing = await usersCollection.findOne({
			email: email.toLowerCase(),
		});
		if (existing) {
			return NextResponse.json(
				{ error: "User with this email already exists" },
				{ status: 400 }
			);
		}

		// Generate verification token
		const { token, expiresAt } = generateEmailVerificationToken();

		const user = {
			role,
			email: email.toLowerCase(),
			matric_number: role === "student" ? matric_number : undefined,
			lecturer_number: role === "lecturer" ? matric_number : undefined,
			first_name,
			last_name,
			level: role === "student" ? level : undefined,
			isPasswordSet: false,
			verification_token: token,
			verification_expires_at: expiresAt,
			created_at: new Date(),
		};

		const result = await usersCollection.insertOne(user);

		// Send welcome email with verification link
		try {
			await emailService.sendWelcomeEmail(
				email.toLowerCase(),
				`${first_name} ${last_name}`,
				token
			);
		} catch (emailError) {
			console.error("Failed to send welcome email:", emailError);
			// Delete the user since email failed
			await usersCollection.deleteOne({ _id: result.insertedId });
			return NextResponse.json(
				{
					error:
						"Failed to send welcome email. Please check email configuration and try again.",
				},
				{ status: 500 }
			);
		}

		return NextResponse.json({
			user: { _id: result.insertedId, ...user },
			message:
				"User created successfully. Welcome email with verification link has been sent.",
		});
	} catch (error) {
		console.error("[v0] Add user error:", error);
		return NextResponse.json({ error: "Failed to add user" }, { status: 500 });
	}
}
