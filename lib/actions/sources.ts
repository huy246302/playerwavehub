"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import { sourceSchema } from "@/lib/validation/source";
import { formValues, type DeleteResult, type FormState } from "@/lib/form-state";

export async function createSource(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = sourceSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { ok: false, errors: z.flattenError(parsed.error).fieldErrors, values: formValues(fd) };
  const d = parsed.data;

  const { data, error } = await createAdminClient().from("sources").insert({
    title: d.title, url: d.url ?? null, publisher: d.publisher ?? null, author: d.author ?? null,
    published_on: d.published_on ?? null, accessed_on: d.accessed_on ?? null, notes: d.notes ?? null,
  }).select("id").single();
  if (error) return { ok: false, message: error.message, values: formValues(fd) };

  revalidatePath("/", "layout");
  redirect(`/sources/${data.id}`);
}

export async function updateSource(id: number, _: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = sourceSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { ok: false, errors: z.flattenError(parsed.error).fieldErrors, values: formValues(fd) };
  const d = parsed.data;

  const { error } = await createAdminClient().from("sources").update({
    title: d.title, url: d.url ?? null, publisher: d.publisher ?? null, author: d.author ?? null,
    published_on: d.published_on ?? null, accessed_on: d.accessed_on ?? null, notes: d.notes ?? null,
  }).eq("id", id);
  if (error) return { ok: false, message: error.message, values: formValues(fd) };

  revalidatePath("/", "layout");
  redirect(`/sources/${id}`);
}

export async function deleteSources(ids: number[]): Promise<DeleteResult> {
  await requireAdmin();
  const sb = createAdminClient();
  // link rows have no FK-restrict in the schema (cascade via biography/club deletion only),
  // so unlink explicitly before removing the source itself
  await sb.from("biography_sources").delete().in("source_id", ids);
  await sb.from("club_sources").delete().in("source_id", ids);
  const { error } = await sb.from("sources").delete().in("id", ids);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}