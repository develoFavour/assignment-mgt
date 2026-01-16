import { type NextRequest, NextResponse } from "next/server";
import { getUsersCollection } from "@/lib/db";
import { generateEmailVerificationToken } from "@/lib/tokens";
import { emailService } from "@/lib/email";
import { logEvent } from "@/lib/logger";

export async function POST(request: NextRequest) {
    try {
        const { users } = await request.json();

        if (!Array.isArray(users) || users.length === 0) {
            return NextResponse.json({ error: "No users provided" }, { status: 400 });
        }

        const usersCollection = await getUsersCollection();
        const results = {
            success: 0,
            failed: 0,
            errors: [] as string[],
        };

        const createdUsers = [];

        for (const userData of users) {
            const { email, role, first_name, last_name, matric_number, level } = userData;

            try {
                // Check if user already exists
                const existing = await usersCollection.findOne({
                    email: email.toLowerCase(),
                });

                if (existing) {
                    results.failed++;
                    results.errors.push(`${email}: User already exists`);
                    continue;
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

                // Send welcome email
                try {
                    await emailService.sendWelcomeEmail(
                        email.toLowerCase(),
                        `${first_name} ${last_name}`,
                        token
                    );
                    results.success++;
                    createdUsers.push({ _id: result.insertedId, ...user });
                } catch (emailError) {
                    console.error(`Failed to send welcome email to ${email}:`, emailError);
                    // We don't delete here in bulk to avoid partial states, 
                    // but we mark it as success since account is created.
                    // Or maybe we should delete? For bulk, maybe more robust to keep it but note the error.
                    results.success++;
                    createdUsers.push({ _id: result.insertedId, ...user });
                }

            } catch (userError) {
                console.error(`Error creating user ${email}:`, userError);
                results.failed++;
                results.errors.push(`${email}: Internal error`);
            }
        }

        // Log the bulk creation
        await logEvent({
            action: `Bulk user import: ${results.success} successful, ${results.failed} failed`,
            user: "admin",
            level: results.failed > 0 ? "warning" : "success",
        });

        return NextResponse.json({
            message: `Processed ${users.length} users`,
            results,
            users: createdUsers,
        });

    } catch (error) {
        console.error("[bulk-users] error:", error);
        return NextResponse.json({ error: "Failed to process bulk upload" }, { status: 500 });
    }
}
