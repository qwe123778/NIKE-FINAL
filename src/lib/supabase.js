import { createClient } from "@supabase/supabase-js";

console.log("[Supabase] Initializing...");
console.log("[Supabase] URL:", process.env.SUPABASE_URL ? "✅ set" : "❌ MISSING");
console.log("[Supabase] KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅ set" : "❌ MISSING");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

export default supabase;