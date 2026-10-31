"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import { POSITION_CODES } from "@/lib/validation/position";

type Result = { ok: boolean; message?: string };

const saveSchema = z.object({
  position: z.enum(POSITION_CODES, { error: "Select a position." }),
  rating: z.number({ error: "Enter a rating from 1 to 100." })
    .int("Use a whole number.").min(1, "Rating must be 1 to 100.").max(100, "Rating must be 1 to 100."),
  makePrimary: z.boolean(),
});

const refresh = (playerId: number) => {
  revalidatePath(`/players/${playerId}`, "page");
  revalidatePath(`/players/${playerId}/attributes`, "page");
};

// Add a position or change its rating. The first position becomes primary automatically.
export async function savePlayerPosition(playerId: number, input: unknown): Promise<Result> {
  await requireAdmin();
  const parsed = saveSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Check the form." };
  const d = parsed.data;

  const { error } = await createAdminClient().rpc("save_player_position", {
    p_player_id: playerId, p_position: d.position, p_rating: d.rating, p_make_primary: d.makePrimary,
  });
  if (error) return { ok: false, message: error.message };
  refresh(playerId);
  return { ok: true };
}

// Make one position the primary. The previous primary is demoted in the same transaction.
export async function setPrimaryPosition(playerId: number, position: string): Promise<Result> {
  await requireAdmin();
  const p = z.enum(POSITION_CODES).safeParse(position);
  if (!p.success) return { ok: false, message: "Unknown position." };

  const { error } = await createAdminClient().rpc("set_primary_position", {
    p_player_id: playerId, p_position: p.data,
  });
  if (error) return { ok: false, message: error.message };
  refresh(playerId);
  return { ok: true };
}

// Remove a position. If it was the primary, the highest-rated remaining one takes over.
export async function deletePlayerPosition(playerId: number, position: string): Promise<Result> {
  await requireAdmin();
  const p = z.enum(POSITION_CODES).safeParse(position);
  if (!p.success) return { ok: false, message: "Unknown position." };

  const { error } = await createAdminClient().rpc("delete_player_position", {
    p_player_id: playerId, p_position: p.data,
  });
  if (error) return { ok: false, message: error.message };
  refresh(playerId);
  return { ok: true };
}
