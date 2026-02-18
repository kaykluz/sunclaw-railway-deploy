/**
 * Email sending helper using Resend API.
 * Used for email verification, password resets, and transactional emails.
 */

const FROM_EMAIL = process.env.NOTIFICATION_FROM_EMAIL || "noreply@mail.kiisha.io";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(params: SendEmailParams): Promise<boolean> {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    console.warn("[Email] RESEND_API_KEY not configured, skipping email.");
    return false;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [params.to],
        subject: params.subject,
        html: params.html,
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(`[Email] Resend failed (${response.status}): ${detail}`);
      return false;
    }

    console.log(`[Email] Sent "${params.subject}" to ${params.to}`);
    return true;
  } catch (error) {
    console.warn("[Email] Error sending:", error);
    return false;
  }
}

export function buildVerificationEmail(verifyUrl: string, userName?: string): SendEmailParams["html"] {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="display: inline-block; width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, #00d4ff, #f59e0b); line-height: 48px; font-weight: bold; font-size: 20px; color: #0a0f1a;">SC</div>
        <h1 style="margin: 16px 0 0; font-size: 24px; color: #0a0f1a;">Verify Your Email</h1>
      </div>
      <p style="color: #333; font-size: 16px; line-height: 1.6;">
        Hi${userName ? ` ${userName}` : ""},
      </p>
      <p style="color: #333; font-size: 16px; line-height: 1.6;">
        Welcome to SunClaw! Please verify your email address by clicking the button below.
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${verifyUrl}" style="display: inline-block; padding: 14px 32px; background: #00d4ff; color: #0a0f1a; font-weight: 600; font-size: 16px; text-decoration: none; border-radius: 8px;">
          Verify Email Address
        </a>
      </div>
      <p style="color: #666; font-size: 14px; line-height: 1.6;">
        This link expires in 24 hours. If you didn't create a SunClaw account, you can safely ignore this email.
      </p>
      <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;" />
      <p style="color: #999; font-size: 12px; text-align: center;">SunClaw — The AI Agent for Renewable Energy</p>
    </div>
  `;
}

export function buildPasswordResetEmail(resetUrl: string, userName?: string): SendEmailParams["html"] {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="display: inline-block; width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, #00d4ff, #f59e0b); line-height: 48px; font-weight: bold; font-size: 20px; color: #0a0f1a;">SC</div>
        <h1 style="margin: 16px 0 0; font-size: 24px; color: #0a0f1a;">Reset Your Password</h1>
      </div>
      <p style="color: #333; font-size: 16px; line-height: 1.6;">
        Hi${userName ? ` ${userName}` : ""},
      </p>
      <p style="color: #333; font-size: 16px; line-height: 1.6;">
        We received a request to reset your password. Click the button below to choose a new one.
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${resetUrl}" style="display: inline-block; padding: 14px 32px; background: #00d4ff; color: #0a0f1a; font-weight: 600; font-size: 16px; text-decoration: none; border-radius: 8px;">
          Reset Password
        </a>
      </div>
      <p style="color: #666; font-size: 14px; line-height: 1.6;">
        This link expires in 1 hour. If you didn't request this, you can safely ignore this email.
      </p>
      <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;" />
      <p style="color: #999; font-size: 12px; text-align: center;">SunClaw — The AI Agent for Renewable Energy</p>
    </div>
  `;
}
