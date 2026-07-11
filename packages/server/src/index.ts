/**
 * @outreach/server — backend service layer barrel export.
 *
 * Import services from here in API route handlers.
 * This module MUST only be imported in server contexts (API routes, Server Components).
 *
 * Future scalability: This layer can be extracted into a standalone
 * Express/Hono service without changing any API route handler signatures.
 */

export * from "./services/lead.service";
export * from "./services/activity.service";
export * from "./services/email.service";
export * from "./services/followup.service";
export * from "./services/meeting.service";
export * from "./services/note.service";
export * from "./services/tag.service";
export * from "./services/template.service";
export * from "./services/notification.service";
export * from "./services/settings.service";
export * from "./services/analytics.service";
export * from "./services/dashboard.service";
export * from "./services/attachment.service";

export { auth } from "./auth";
export type { Auth } from "./auth";
export { resend, FROM_EMAIL } from "./resend";
export { resolveUser } from "./api-key-auth";
export type { ResolvedUser } from "./api-key-auth";
