export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

/**
 * Returns the login page URL. Uses local email/password auth (no external OAuth).
 */
export const getLoginUrl = (returnPath?: string) => {
  const base = "/auth/login";
  if (returnPath) {
    return `${base}?returnTo=${encodeURIComponent(returnPath)}`;
  }
  return base;
};
