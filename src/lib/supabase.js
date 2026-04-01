/**
 * Direct Supabase client — NOT used in this version.
 * All database access goes through the Express server (src/lib/api.js).
 *
 * This file is kept as a placeholder in case you want to add
 * real-time subscriptions or other client-side Supabase features later.
 *
 * To enable: install @supabase/supabase-js, add VITE_SUPABASE_URL
 * and VITE_SUPABASE_ANON_KEY to your .env, then:
 *
 *   import { createClient } from "@supabase/supabase-js";
 *   export const supabase = createClient(
 *     import.meta.env.VITE_SUPABASE_URL,
 *     import.meta.env.VITE_SUPABASE_ANON_KEY
 *   );
 */
export const supabase = null;
