import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Initialize the Supabase client
// Note: In a production app, you might want to use generated types from the CLI
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return (
    supabaseUrl !== "" && 
    supabaseAnonKey !== "" && 
    supabaseUrl !== "your_project_url_here" &&
    supabaseAnonKey !== "your_anon_key_here"
  );
};
