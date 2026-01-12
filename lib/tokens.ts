import crypto from "crypto";

// Generate secure verification token
export function generateVerificationToken(): string {
	return crypto.randomBytes(32).toString("hex");
}

// Generate token with expiration
export function generateEmailVerificationToken(): {
	token: string;
	expiresAt: Date;
} {
	const token = generateVerificationToken();
	const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
	return { token, expiresAt };
}

// Verify token is not expired
export function isTokenExpired(expiresAt: Date): boolean {
	return new Date() > expiresAt;
}

// Generate secure password reset token
export function generatePasswordResetToken(): {
	token: string;
	expiresAt: Date;
} {
	const token = generateVerificationToken();
	const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
	return { token, expiresAt };
}
