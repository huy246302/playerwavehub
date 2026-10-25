"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import { ALL_COACH_ATTRIBUTE_FIELDS, coachAttributesSchema } from "@/lib/validation/coach-attributes";
import { ALL_COACH_HIDDEN_FIELDS, coachHiddenAttributesSchema } from "@/lib/validation/coach-hidden-attributes";
import { formValues, type FormState } from "@/lib/form-state";

export async function saveCoachAttributes(coachId: number, _: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = coachAttributesSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { ok: false, errors: z.flattenError(parsed.error).fieldErrors, values: formValues(fd) };

  const payload = Object.fromEntries(ALL_COACH_ATTRIBUTE_FIELDS.map((f) => [f, parsed.data[f as keyof typeof parsed.data] ?? null]));
  const { error } = await createAdminClient().from("coach_attributes").upsert({ coach_id: coachId, ...payload }, { onConflict: "coach_id" });
  if (error) return { ok: false, message: error.message, values: formValues(fd) };

  revalidatePath(`/head-coach/${coachId}`, "page");
  revalidatePath(`/head-coach/${coachId}/attributes`, "page");
  return { ok: true, message: "Attributes saved." };
}

export async function saveCoachHiddenAttributes(coachId: number, _: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = coachHiddenAttributesSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { ok: false, errors: z.flattenError(parsed.error).fieldErrors, values: formValues(fd) };

  const payload = Object.fromEntries(ALL_COACH_HIDDEN_FIELDS.map((f) => [f, parsed.data[f as keyof typeof parsed.data] ?? null]));
  const { error } = await createAdminClient().from("coach_hidden_attributes").upsert({ coach_id: coachId, ...payload }, { onConflict: "coach_id" });
  if (error) return { ok: false, message: error.message, values: formValues(fd) };

  revalidatePath(`/head-coach/${coachId}`, "page");
  revalidatePath(`/head-coach/${coachId}/hidden-attributes`, "page");
  return { ok: true, message: "Hidden attributes saved." };
}