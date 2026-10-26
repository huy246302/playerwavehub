"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import { insertPerson } from "@/lib/biographies";
import { biographySchema } from "@/lib/validation/biography";
import { formValues, type DeleteResult, type FormState } from "@/lib/form-state";

export async function createBiography(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireAdmin();
  const parsed = biographySchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) {
    return { ok: false, errors: z.flattenError(parsed.error).fieldErrors, values: formValues(fd) };
  }

  const res = await insertPerson(parsed.data, user.id);
  if (!res.id) return { ok: false, message: res.error ?? "Could not save.", values: formValues(fd) };

  revalidatePath("/", "layout");
  redirect(`/biographies/${res.id}`);
}

export async function updateBiography(id: number, _: FormState, fd: FormData): Promise<FormState> {
  const user = await requireAdmin();
  const parsed = biographySchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) {
    return { ok: false, errors: z.flattenError(parsed.error).fieldErrors, values: formValues(fd) };
  }
  const d = parsed.data;

  const { error } = await createAdminClient().from("biographies").update({
    full_name: d.full_name,
    display_name: d.display_name ?? null,
    date_of_birth: d.date_of_birth ?? null,
    date_of_death: d.date_of_death ?? null,
    birthplace: d.birthplace ?? null,
    birth_country_id: d.birth_country_id ?? null,
    nationality_id: d.nationality_id ?? null,
    bio: d.bio ?? null,
    photo_url: d.photo_url ?? null,
    photo_credit: d.photo_credit ?? null,
    photo_license: d.photo_license ?? null,
    photo_source_url: d.photo_source_url ?? null,
    updated_by: user.id,
  }).eq("id", id);

  if (error) return { ok: false, message: error.message, values: formValues(fd) };
  revalidatePath("/", "layout");
  redirect(`/biographies/${id}`);
}

export async function deleteBiography(ids: number[]): Promise<DeleteResult> {
  await requireAdmin();
  const { error } = await createAdminClient().from("biographies").delete().in("id", ids);
  if (error?.code === "23503") {
    return {
      ok: false,
      message: "This biography still has a player or head coach record. Delete that record first.",
    };
  }
  if (error) return { ok: false, message: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}