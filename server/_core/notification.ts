import { TRPCError } from "@trpc/server";

export type NotificationPayload = {
  title: string;
  content: string;
};

const TITLE_MAX_LENGTH = 1200;
const CONTENT_MAX_LENGTH = 20000;

const trimValue = (value: string): string => value.trim();
const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const validatePayload = (input: NotificationPayload): NotificationPayload => {
  if (!isNonEmptyString(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required.",
    });
  }
  if (!isNonEmptyString(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required.",
    });
  }

  const title = trimValue(input.title);
  const content = trimValue(input.content);

  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`,
    });
  }

  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`,
    });
  }

  return { title, content };
};

/**
 * Dispatches a project-owner notification via Resend email.
 * Returns `true` if the email was accepted, `false` when the service
 * cannot be reached. Validation errors bubble up as TRPC errors.
 *
 * Requires env vars: RESEND_API_KEY, NOTIFICATION_FROM_EMAIL, OWNER_EMAIL
 */
export async function notifyOwner(
  payload: NotificationPayload
): Promise<boolean> {
  const { title, content } = validatePayload(payload);

  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.NOTIFICATION_FROM_EMAIL || "noreply@mail.kiisha.io";
  const ownerEmail = process.env.OWNER_EMAIL;

  if (!resendApiKey) {
    console.warn("[Notification] RESEND_API_KEY not configured, skipping email.");
    return false;
  }

  if (!ownerEmail) {
    console.warn("[Notification] OWNER_EMAIL not configured, skipping email.");
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
        from: fromEmail,
        to: [ownerEmail],
        subject: `[SunClaw] ${title}`,
        html: `<div style="font-family: sans-serif; max-width: 600px;">
          <h2 style="color: #0a0f1a;">${title}</h2>
          <div style="white-space: pre-wrap; color: #333;">${content}</div>
          <hr style="margin-top: 24px; border-color: #eee;" />
          <p style="font-size: 12px; color: #999;">SunClaw Notification System</p>
        </div>`,
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Resend email failed (${response.status} ${response.statusText})${
          detail ? `: ${detail}` : ""
        }`
      );
      return false;
    }

    return true;
  } catch (error) {
    console.warn("[Notification] Error sending email via Resend:", error);
    return false;
  }
}
