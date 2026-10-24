"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import { insertWithSlug } from "@/lib/slug";
import { clubSchema, type ClubInput } from "@/lib/validation/club";
import { formValues, type DeleteResult, type FormState } from "@/lib/form-state";

const fields = (d: ClubInput) => ({
  short_name: d.short_name ?? null,
  city: d.city ?? null,
  country_id: d.country_id ?? null,
  founded_year: d.founded_year ?? null,
  logo_url: d.logo_url ?? null,
  logo_credit: d.logo_credit ?? null,
  logo_license: d.logo_license ?? null,
  logo_source_url: d.logo_source_url ?? null,
  description: d.description ?? null,
});

export async function createClub(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireAdmin();
  const parsed = clubSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) {
    return { ok: false, errors: z.flattenError(parsed.error).fieldErrors, values: formValues(fd) };
  }
  const d = parsed.data;

  const { id, error } = await insertWithSlug("clubs", d.name, {
    name: d.name,
    ...fields(d),
    created_by: user.id,
    updated_by: user.id,
  });
  if (error) return { ok: false, message: error.message, values: formValues(fd) };

  revalidatePath("/", "layout");
  redirect(`/clubs/${id}`);
}

export async function updateClub(id: number, _: FormState, fd: FormData): Promise<FormState> {
  const user = await requireAdmin();
  const parsed = clubSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) {
    return { ok: false, errors: z.flattenError(parsed.error).fieldErrors, values: formValues(fd) };
  }
  const d = parsed.data;

  const { error } = await createAdminClient().from("clubs").update({
    name: d.name,
    ...fields(d),
    updated_by: user.id,
    updated_at: new Date().toISOString(),
  }).eq("id", id);
  if (error) return { ok: false, message: error.message, values: formValues(fd) };

  revalidatePath("/", "layout");
  redirect(`/clubs/${id}`);
}

export async function deleteClubs(ids: number[]): Promise<DeleteResult> {
  await requireAdmin();
  const { error } = await createAdminClient().from("clubs").delete().in("id", ids);
  if (error?.code === "23503") {
    return { ok: false, message: "This club is linked to player or coach career stints. Remove those first." };
  }
  if (error) return { ok: false, message: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}