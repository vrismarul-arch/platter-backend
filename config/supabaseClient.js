import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config(); // Load .env variables

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL or Key is missing in .env");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
