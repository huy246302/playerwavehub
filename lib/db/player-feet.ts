import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { fail } from "@/lib/db/util";

export type PlayerFeet = {
  preferred_foot: "left" | "right" | "both";
  left_foot_level: number; left_foot_label: string;
  right_foot_level: number; right_foot_label: string;
  weak_foot_level: number; weak_foot_label: string;
  strong_foot_level: number; foot_summary: string;
};

export async function getPlayerFeet(playerId: number): Promise<PlayerFeet | null> {
  const { data, error } = await createAdminClient()
    .from("player_feet").select("*").eq("player_id", playerId).maybeSingle();
  if (error) throw fail(error);
  return data as PlayerFeet | null;
}