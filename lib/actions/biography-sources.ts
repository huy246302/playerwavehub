"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import { sourceLinkSchema } from "@/lib/validation/source-link";
import { formValues, type DeleteResult, type FormState } from "@/lib/form-state";

export async function linkBiographySource(biographyId: number, _: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = sourceLinkSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { ok: false, errors: z.flattenError(parsed.error).fieldErrors, values: formValues(fd) };
  const d = parsed.data;

  const { error } = await createAdminClient()
    .from("biography_sources").insert({ biography_id: biographyId, source_id: d.source_id, note: d.note ?? null });
  if (error) {
    if (error.code === "23505") return { ok: false, message: "This source is already linked to this biography.", values: formValues(fd) };
    return { ok: false, message: error.message, values: formValues(fd) };
  }
  revalidatePath("/", "layout");
  return { ok: true, message: "Source linked." };
}

export async function unlinkBiographySource(biographyId: number, sourceId: number): Promise<DeleteResult> {
  await requireAdmin();
  const { error } = await createAdminClient()
    .from("biography_sources").delete().eq("biography_id", biographyId).eq("source_id", sourceId);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}