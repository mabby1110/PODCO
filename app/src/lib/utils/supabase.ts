import type { SupabaseClient } from "@supabase/supabase-js";

export async function getAllProfilesAdmin(
  admin: SupabaseClient
) {
  const { data, error } = await admin
    .from('profiles')
    .select('*');

  if (error) throw error;
  return data;
}