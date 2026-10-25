import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { fail } from "@/lib/db/util";

export type PlayerPosition = { position: string; rating: number; is_primary: boolean };

export async function listPlayerPositions(playerId: number): Promise<PlayerPosition[]> {
  const { data, error } = await createAdminClient()
    .from("player_positions").select("position, rating, is_primary")
    .eq("player_id", playerId)
    .order("is_primary", { ascending: false }).order("rating", { ascending: false });
  if (error) throw fail(error);
  return (data ?? []) as PlayerPosition[];
}