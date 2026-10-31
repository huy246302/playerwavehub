"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import { insertWithSlug } from "@/lib/slug";
import { federationSchema, type FederationInput } from "@/lib/validation/federation";
import { formValues, type DeleteResult, type FormState } from "@/lib/form-state";

const fields = (d: FederationInput) => ({
  short_name: d.short_name ?? null,
  country_id: d.country_id,
  confederation: d.confederation ?? null,
  founded_year: d.founded_year,
  ended_year: d.ended_year ?? null,
  logo_url: d.logo_url ?? null,
  logo_credit: d.logo_credit ?? null,
  logo_license: d.logo_license ?? null,
  logo_source_url: d.logo_source_url ?? null,
  description: d.description ?? null,
});

export async function createFederation(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireAdmin();
  const parsed = federationSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) {
    return { ok: false, errors: z.flattenError(parsed.error).fieldErrors, values: formValues(fd) };
  }
  const d = parsed.data;

  const { id, error } = await insertWithSlug("federations", d.name, {
    name: d.name,
    ...fields(d),
    created_by: user.id,
    updated_by: user.id,
  });
  if (error) return { ok: false, message: error.message, values: formValues(fd) };

  revalidatePath("/", "layout");
  redirect(`/federations/${id}`);
}

export async function updateFederation(id: number, _: FormState, fd: FormData): Promise<FormState> {
  const user = await requireAdmin();
  const parsed = federationSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) {
    return { ok: false, errors: z.flattenError(parsed.error).fieldErrors, values: formValues(fd) };
  }
  const d = parsed.data;

  const { error } = await createAdminClient().from("federations").update({
    name: d.name,
    ...fields(d),
    updated_by: user.id,
    updated_at: new Date().toISOString(),
  }).eq("id", id);
  if (error?.code === "23503") {
    return {
      ok: false,
      message: "National teams are linked to this federation. Change their federation before changing its country.",
      values: formValues(fd),
    };
  }
  if (error) return { ok: false, message: error.message, values: formValues(fd) };

  revalidatePath("/", "layout");
  redirect(`/federations/${id}`);
}

export async function deleteFederations(ids: number[]): Promise<DeleteResult> {
  await requireAdmin();
  const { error } = await createAdminClient().from("federations").delete().in("id", ids);
  if (error?.code === "23503") {
    return { ok: false, message: "This federation is linked to national teams. Remove or move those first." };
  }
  if (error) return { ok: false, message: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}
