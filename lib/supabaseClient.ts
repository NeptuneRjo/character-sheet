import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePubKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

if (!supabaseUrl) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL is undefined in .env.local");
}
if (!supabasePubKey) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY is undefined in .env.local"
  );
}

export const supabase = createClient(supabaseUrl, supabasePubKey);
