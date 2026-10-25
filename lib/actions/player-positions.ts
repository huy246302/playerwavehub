"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import { positionSchema } from "@/lib/validation/position";
import { formValues, type DeleteResult, type FormState } from "@/lib/form-state";

export async function savePlayerPosition(playerId: number, _: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = positionSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { ok: false, errors: z.flattenError(parsed.error).fieldErrors, values: formValues(fd) };
  const d = parsed.data;
  const sb = createAdminClient();

  if (d.is_primary) {
    // only one primary position per player — clear any existing one first
    await sb.from("player_positions").update({ is_primary: false })
      .eq("player_id", playerId).eq("is_primary", true);
  }

  const { error } = await sb
    .from("player_positions")
    .upsert({ player_id: playerId, position: d.position, rating: d.rating, is_primary: d.is_primary },
      { onConflict: "player_id,position" });
  if (error) return { ok: false, message: error.message, values: formValues(fd) };

  revalidatePath(`/players/${playerId}`, "page");
  revalidatePath(`/players/${playerId}/attributes`, "page");
  return { ok: true, message: "Position saved." };
}

export async function deletePlayerPosition(playerId: number, position: string): Promise<DeleteResult> {
  await requireAdmin();
  const { error } = await createAdminClient()
    .from("player_positions").delete().eq("player_id", playerId).eq("position", position);
  if (error) return { ok: false, message: error.message };
  revalidatePath(`/players/${playerId}`, "page");
  revalidatePath(`/players/${playerId}/attributes`, "page");
  return { ok: true };
}