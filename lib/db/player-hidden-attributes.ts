import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { fail } from "@/lib/db/util";

export async function getPlayerHiddenAttributes(playerId: number) {
  const { data, error } = await createAdminClient()
    .from("player_hidden_attributes").select("*").eq("player_id", playerId).maybeSingle();
  if (error) throw fail(error);
  return data as Record<string, number | null> | null;
}