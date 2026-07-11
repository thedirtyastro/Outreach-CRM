/**
 * Re-export auth from the @outreach/server package.
 * Keeping this shim so existing @/lib/auth imports in legacy code
 * still resolve — though all new code should import from @outreach/server/auth.
 */
export { auth } from "@outreach/server/auth";
export type { Auth } from "@outreach/server/auth";
