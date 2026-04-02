import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log("[supabaseClient] URL:", supabaseUrl ?? "MISSING");
console.log("[supabaseClient] KEY:", supabaseKey ? "set" : "MISSING");

if (!supabaseUrl || !supabaseKey) {
  console.error("[supabaseClient] ❌ Missing env vars — image upload will not work");
}

export const supabaseClient = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;