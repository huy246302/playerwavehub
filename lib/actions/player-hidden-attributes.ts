"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import { ALL_HIDDEN_FIELDS, playerHiddenAttributesSchema } from "@/lib/validation/player-hidden-attributes";
import { formValues, type FormState } from "@/lib/form-state";

export async function savePlayerHiddenAttributes(playerId: number, _: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = playerHiddenAttributesSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { ok: false, errors: z.flattenError(parsed.error).fieldErrors, values: formValues(fd) };

  const payload = Object.fromEntries(
    ALL_HIDDEN_FIELDS.map((f) => [f, parsed.data[f as keyof typeof parsed.data] ?? null])
  );

  const { error } = await createAdminClient()
    .from("player_hidden_attributes")
    .upsert({ player_id: playerId, ...payload }, { onConflict: "player_id" });
  if (error) return { ok: false, message: error.message, values: formValues(fd) };

  revalidatePath(`/players/${playerId}`, "page");
  revalidatePath(`/players/${playerId}/hidden-attributes`, "page");
  return { ok: true, message: "Hidden attributes saved." };
}