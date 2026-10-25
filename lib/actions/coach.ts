"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import { coachSchema, type CoachInput } from "@/lib/validation/coach";
import { formValues, type DeleteResult, type FormState } from "@/lib/form-state";

const fields = (d: CoachInput) => ({
  career_start_year: d.career_start_year ?? null,
  retired_year: d.retired_year ?? null,
  legacy_summary: d.legacy_summary ?? null,
  is_published: d.status === "published",
});

export async function createCoach(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireAdmin();
  const parsed = coachSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { ok: false, errors: z.flattenError(parsed.error).fieldErrors, values: formValues(fd) };
  const d = parsed.data;

  const { data, error } = await createAdminClient()
    .from("coaches")
    .insert({ ...fields(d), biography_id: d.biography_id, created_by: user.id, updated_by: user.id })
    .select("id").single();

  if (error) {
    if (error.code === "23505")
      return { ok: false, errors: { biography_id: ["This biography already has a head coach record."] }, values: formValues(fd) };
    return { ok: false, message: error.message, values: formValues(fd) };
  }

  revalidatePath("/", "layout");
  redirect(`/head-coach/${data.id}`);
}

export async function updateCoach(id: number, _: FormState, fd: FormData): Promise<FormState> {
  const user = await requireAdmin();
  const parsed = coachSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { ok: false, errors: z.flattenError(parsed.error).fieldErrors, values: formValues(fd) };

  const { error } = await createAdminClient()
    .from("coaches")
    .update({ ...fields(parsed.data), updated_by: user.id, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { ok: false, message: error.message, values: formValues(fd) };

  revalidatePath("/", "layout");
  redirect(`/head-coach/${id}`);
}

export async function deleteCoaches(ids: number[]): Promise<DeleteResult> {
  await requireAdmin();
  const { error } = await createAdminClient().from("coaches").delete().in("id", ids);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}