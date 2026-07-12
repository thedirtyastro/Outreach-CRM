/**
 * packages/database/src/client.ts
 *
 * Supabase client singleton for server-side use.
 * Import from @outreach/database/client in server contexts only.
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_URL");
}
if (!supabaseServiceKey) {
  throw new Error("Missing environment variable: SUPABASE_SERVICE_ROLE_KEY");
}

/**
 * Service-role client — bypasses Row Level Security.
 * Only use in server-side API routes and services.
 * Never expose to the client bundle.
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
