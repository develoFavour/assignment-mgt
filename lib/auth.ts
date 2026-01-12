import crypto from "crypto";
import * as bcrypt from "bcryptjs";

// Hash password using bcrypt
export async function hashPassword(password: string): Promise<string> {
	const salt = await bcrypt.genSalt(10);
	return bcrypt.hash(password, salt);
}

// Verify password
export async function verifyPassword(
	password: string,
	hash: string
): Promise<boolean> {
	return bcrypt.compare(password, hash);
}

// Generate secure temporary password
export function generateTemporaryPassword(): string {
	const chars =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
	const length = 12;
	let password = "";

	// Ensure at least one of each required character type
	password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[crypto.randomInt(26)];
	password += "abcdefghijklmnopqrstuvwxyz"[crypto.randomInt(26)];
	password += "0123456789"[crypto.randomInt(10)];
	password += "!@#$%"[crypto.randomInt(5)];

	// Fill remaining characters
	for (let i = 4; i < length; i++) {
		password += chars[crypto.randomInt(chars.length)];
	}

	// Shuffle the password
	return password
		.split("")
		.sort(() => crypto.randomInt(3) - 1)
		.join("");
}

// Generate JWT token (simplified - use a proper JWT library in production)
export function generateToken(userId: string): string {
	return crypto.randomBytes(32).toString("hex");
}

// Validate email format
export function isValidEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

// Validate password strength
export function isStrongPassword(password: string): boolean {
	return password.length >= 8;
}
