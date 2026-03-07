import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testUpdate() {
  // Try to update any customer
  const { data, error } = await supabase
    .from("customers")
    .update({ is_archived: true })
    .neq("id", "00000000-0000-0000-0000-000000000000") // dummy
    .limit(1);

  if (error) {
    console.error("SUPABASE ERROR:", error);
  } else {
    console.log("SUCCESS:", data);
  }
}

testUpdate();
