"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import { playerAttributesSchema } from "@/lib/validation/player-attributes";
import { formValues, type FormState } from "@/lib/form-state";

export async function savePlayerAttributes(playerId: number, _: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = playerAttributesSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { ok: false, errors: z.flattenError(parsed.error).fieldErrors, values: formValues(fd) };

  const { error } = await createAdminClient()
    .from("player_attributes")
    .upsert({ player_id: playerId, ...parsed.data });
  if (error) return { ok: false, message: error.message, values: formValues(fd) };

  revalidatePath(`/players/${playerId}`, "page");
  revalidatePath(`/players/${playerId}/attributes`, "page");
  return { ok: true, message: "Attributes saved." };
}