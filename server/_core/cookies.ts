import type { CookieOptions, Request } from "express";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function isIpAddress(host: string | undefined) {
  if (!host) return false;
  // Basic IPv4 check and IPv6 presence detection.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  return host.includes(":");
}

function isSecureRequest(req: Request) {
  if (req.protocol === "https") return true;

  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;

  const protoList = Array.isArray(forwardedProto)
    ? forwardedProto
    : forwardedProto.split(",");

  return protoList.some(proto => proto.trim().toLowerCase() === "https");
}

export function getSessionCookieOptions(
  req: Request
): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure"> {
  const hostname = req.hostname ?? "localhost";
  const isLocal = LOCAL_HOSTS.has(hostname) || isIpAddress(hostname);
  const secure = isSecureRequest(req);

  // For *.kiisha.io domains, scope cookie to .kiisha.io for shared auth
  // across sunclaw.kiisha.io and app.kiisha.io
  let domain: string | undefined;
  if (!isLocal && hostname.endsWith(".kiisha.io")) {
    domain = ".kiisha.io";
  } else if (!isLocal && !hostname.startsWith(".")) {
    domain = `.${hostname}`;
  }

  return {
    httpOnly: true,
    path: "/",
    sameSite: secure ? "none" : "lax",
    secure,
    ...(domain ? { domain } : {}),
  };
}
