"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import {
  fillEmptyDefaults, playerAttributesSchema, playerKindFromPrimary,
} from "@/lib/validation/player-attributes";
import { formValues, type FormState } from "@/lib/form-state";

export async function savePlayerAttributes(playerId: number, _: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const sb = createAdminClient();

  // Goalkeeper or outfield comes from the primary position. Empty fields that do not
  // apply to that kind of player are saved as 1.
  const { data: primary } = await sb.from("player_positions")
    .select("position").eq("player_id", playerId).eq("is_primary", true).maybeSingle();
  const kind = playerKindFromPrimary(primary?.position);
  const { values, filled } = fillEmptyDefaults(kind, Object.fromEntries(fd));

  const parsed = playerAttributesSchema.safeParse(values);
  if (!parsed.success) return { ok: false, errors: z.flattenError(parsed.error).fieldErrors, values: formValues(fd) };

  const { error } = await sb.from("player_attributes").upsert({ player_id: playerId, ...parsed.data });
  if (error) return { ok: false, message: error.message, values: formValues(fd) };

  revalidatePath(`/players/${playerId}`, "page");
  revalidatePath(`/players/${playerId}/attributes`, "page");
  const note = filled.length
    ? ` ${filled.length} empty ${kind === "outfield" ? "goalkeeping" : "outfield"} field${filled.length === 1 ? "" : "s"} set to 1.`
    : "";
  return { ok: true, message: `Attributes saved.${note}` };
}
