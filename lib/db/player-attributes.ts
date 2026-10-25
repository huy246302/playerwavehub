import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { fail } from "@/lib/db/util";

export async function getPlayerAttributes(playerId: number) {
  const { data, error } = await createAdminClient()
    .from("player_attributes").select("*").eq("player_id", playerId).maybeSingle();
  if (error) throw fail(error);
  return data as Record<string, number> | null;
}