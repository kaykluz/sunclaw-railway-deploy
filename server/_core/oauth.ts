/**
 * Auth middleware — replaces Manus OAuth callback with cookie-parser.
 * Auth is now handled via tRPC procedures (auth.register, auth.login, auth.logout).
 */
import cookieParser from "cookie-parser";
import type { Express } from "express";

export function registerAuthMiddleware(app: Express) {
  // cookie-parser is needed for session cookie reading in context.ts
  app.use(cookieParser());
}
