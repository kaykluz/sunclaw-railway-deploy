export const ENV = {
  // Database
  databaseUrl: process.env.DATABASE_URL ?? "",

  // Auth / Session
  cookieSecret: process.env.JWT_SECRET ?? "",
  sessionDomain: process.env.SESSION_COOKIE_DOMAIN ?? ".kiisha.io",

  // App identity
  appId: process.env.VITE_APP_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",

  // Owner info (for admin checks)
  ownerEmail: process.env.OWNER_EMAIL ?? "",

  // Cloudflare R2 Storage (S3-compatible)
  r2Endpoint: process.env.R2_ENDPOINT ?? "",
  r2Bucket: process.env.R2_BUCKET ?? "",
  r2AccessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
  r2SecretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
  r2PublicUrl: process.env.R2_PUBLIC_URL ?? "",

  // Notifications (Resend)
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  notificationFromEmail: process.env.NOTIFICATION_FROM_EMAIL ?? "noreply@mail.kiisha.io",

  // Railway deployment
  railwayApiToken: process.env.RAILWAY_API_TOKEN ?? "",

  // Stripe
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
};
