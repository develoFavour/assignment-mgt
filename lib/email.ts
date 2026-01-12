interface BrevoEmailRequest {
	sender: {
		name: string;
		email: string;
	};
	to: Array<{
		email: string;
		name?: string;
	}>;
	subject: string;
	htmlContent: string;
}

interface BrevoResponse {
	messageId: string;
}

class BrevoEmailService {
	private apiKey: string;
	private senderEmail: string;
	private senderName: string;

	constructor() {
		this.apiKey = process.env.BREVO_API_KEY || "";
		this.senderEmail = process.env.SENDER_EMAIL || "";
		this.senderName = process.env.SENDER_NAME || "Hallmark Assignment";

		if (!this.apiKey || !this.senderEmail) {
			throw new Error(
				"BREVO_API_KEY and SENDER_EMAIL must be set in environment variables"
			);
		}
	}

	private async sendEmail(
		to: string,
		subject: string,
		htmlContent: string
	): Promise<BrevoResponse> {
		const payload: BrevoEmailRequest = {
			sender: {
				name: this.senderName,
				email: this.senderEmail,
			},
			to: [{ email: to }],
			subject,
			htmlContent,
		};

		const response = await fetch("https://api.brevo.com/v3/smtp/email", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"api-key": this.apiKey,
			},
			body: JSON.stringify(payload),
		});

		if (!response.ok) {
			const errorData = await response.text();
			throw new Error(`Brevo API error: ${response.status} - ${errorData}`);
		}

		return response.json() as Promise<BrevoResponse>;
	}

	async sendWelcomeEmail(
		userEmail: string,
		userName: string,
		verificationToken: string
	): Promise<void> {
		const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
			}/auth/verify-email?token=${verificationToken}`;

		const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to Hallmark Assignment</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4f46e5; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Hallmark Assignment</h1>
          </div>
          <div class="content">
            <p>Hi ${userName},</p>
            <p>Welcome to Hallmark Assignment Management System! Your account has been created by an administrator.</p>
            <p>To get started, please verify your email and set your password by clicking the button below:</p>
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email & Set Password</a>
            </div>
            <p><strong>Important:</strong> This verification link will expire in 24 hours.</p>
            <p>If you didn't expect this email, you can safely ignore it.</p>
            <p>Best regards,<br>The Hallmark Assignment Team</p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

		await this.sendEmail(
			userEmail,
			"Welcome to Hallmark Assignment - Verify Your Email",
			htmlContent
		);
	}

	async sendPasswordResetEmail(
		userEmail: string,
		userName: string,
		resetToken: string
	): Promise<void> {
		const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
			}/auth/reset-password?token=${resetToken}`;

		const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Password Reset - Hallmark Assignment</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset</h1>
          </div>
          <div class="content">
            <p>Hi ${userName},</p>
            <p>You requested to reset your password for Hallmark Assignment Management System.</p>
            <p>Click the button below to reset your password:</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            <p><strong>Important:</strong> This reset link will expire in 1 hour.</p>
            <p>If you didn't request this password reset, you can safely ignore this email.</p>
            <p>Best regards,<br>The Hallmark Assignment Team</p>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

		await this.sendEmail(
			userEmail,
			"Reset Your Hallmark Assignment Password",
			htmlContent
		);
	}
	async sendNewAssignmentEmail(
		studentEmails: string[],
		courseName: string,
		assignmentTitle: string,
		dueDate: string
	): Promise<void> {
		if (studentEmails.length === 0) return;

		// We use BCC for bulk student notifications to protect privacy and save API calls
		const uniqueEmails = [...new Set(studentEmails)];

		const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Assignment Alert</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f1f5f9; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .card { background: #ffffff; padding: 40px; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
          .header { text-align: center; margin-bottom: 30px; }
          .icon { font-size: 48px; margin-bottom: 10px; }
          .title { font-size: 24px; font-weight: 800; color: #0f172a; margin: 0; }
          .subtitle { font-size: 16px; color: #64748b; margin-top: 5px; }
          .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 25px 0; }
          .info-item { margin-bottom: 15px; }
          .info-item:last-child { margin-bottom: 0; }
          .label { display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; font-weight: 700; margin-bottom: 4px; }
          .value { font-size: 16px; font-weight: 600; color: #334155; }
          .button { display: inline-block; background: #0f172a; color: white; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: 600; margin-top: 10px; text-align: center; width: 100%; box-sizing: border-box; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <div class="header">
              <div class="icon">📚</div>
              <h1 class="title">New Assignment Posted</h1>
              <p class="subtitle">${courseName}</p>
            </div>
            
            <p>Hello,</p>
            <p>A new assignment has been uploaded for your course. Please review the details below and ensure you submit before the deadline.</p>
            
            <div class="info-box">
              <div class="info-item">
                <span class="label">Assignment Title</span>
                <div class="value">${assignmentTitle}</div>
              </div>
              <div class="info-item">
                <span class="label">Due Date</span>
                <div class="value">${dueDate}</div>
              </div>
            </div>

            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/student/assignments" class="button">View Assignment Details</a>
          </div>
          <div class="footer">
            <p>Hallmark University • Academic Alerts</p>
          </div>
        </div>
      </body>
      </html>
    `;

		const payload = {
			sender: {
				name: this.senderName,
				email: this.senderEmail,
			},
			to: [{ email: this.senderEmail }], // Send to self (lecturer/system) as primary
			bcc: uniqueEmails.map(email => ({ email })), // Bulk send via BCC
			subject: `[New Assignment] ${courseName}: ${assignmentTitle}`,
			htmlContent,
		};

		try {
			const response = await fetch("https://api.brevo.com/v3/smtp/email", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"api-key": this.apiKey,
				},
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				const errorData = await response.text();
				console.error("Brevo Bulk Email Error:", errorData);
				// Don't throw here to avoid breaking the assignment creation flow
			}
		} catch (error) {
			console.error("Failed to send assignment notification emails:", error);
		}
	}
}

export const emailService = new BrevoEmailService();
