import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const hasSupabaseEnv = Boolean(supabaseUrl && supabaseAnonKey);

if (!hasSupabaseEnv) {
  throw new Error(
    "Supabase env vars (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are missing. The site requires Supabase to run."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
