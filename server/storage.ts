/**
 * Cloudflare R2 storage helpers (S3-compatible).
 * Uses @aws-sdk/client-s3 with a custom endpoint for R2.
 * Requires env vars: R2_ENDPOINT, R2_BUCKET, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY
 * Optional: R2_PUBLIC_URL (custom domain for public access)
 */
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

let _client: S3Client | null = null;

function getR2Client(): S3Client {
  if (_client) return _client;

  const endpoint = process.env.R2_ENDPOINT;
  if (!endpoint) throw new Error("R2_ENDPOINT environment variable is required");

  _client = new S3Client({
    region: "auto",
    endpoint,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
    },
  });

  return _client;
}

function getBucket(): string {
  const bucket = process.env.R2_BUCKET;
  if (!bucket) throw new Error("R2_BUCKET environment variable is required");
  return bucket;
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

/**
 * Upload bytes to R2 and return the public URL.
 * If R2_PUBLIC_URL is set (custom domain), uses that for the URL.
 * Otherwise, returns a presigned URL for access.
 */
export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const client = getR2Client();
  const bucket = getBucket();
  const key = normalizeKey(relKey);

  const body = typeof data === "string" ? Buffer.from(data) : data;

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );

  // Use custom public domain if configured, otherwise generate presigned URL
  const publicUrl = process.env.R2_PUBLIC_URL;
  let url: string;
  if (publicUrl) {
    url = `${publicUrl.replace(/\/+$/, "")}/${key}`;
  } else {
    // Generate a long-lived presigned URL (7 days max for R2)
    url = await getSignedUrl(
      client,
      new GetObjectCommand({ Bucket: bucket, Key: key }),
      { expiresIn: 604800 }
    );
  }

  return { key, url };
}

/**
 * Get a URL for a file in R2.
 * Uses public URL if R2_PUBLIC_URL is set, otherwise generates a presigned URL.
 */
export async function storageGet(
  relKey: string,
  expiresIn = 3600
): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);

  // Use public URL if available
  const publicUrl = process.env.R2_PUBLIC_URL;
  if (publicUrl) {
    return { key, url: `${publicUrl.replace(/\/+$/, "")}/${key}` };
  }

  // Fall back to presigned URL
  const client = getR2Client();
  const bucket = getBucket();
  const url = await getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: bucket, Key: key }),
    { expiresIn }
  );

  return { key, url };
}
