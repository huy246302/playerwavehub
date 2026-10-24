"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import { insertWithSlug } from "@/lib/slug";
import { nationalTeamSchema, type NationalTeamInput } from "@/lib/validation/national-team";
import { formValues, type DeleteResult, type FormState } from "@/lib/form-state";

const fields = (d: NationalTeamInput) => ({
  country_id: d.country_id,
  crest_url: d.crest_url ?? null,
  description: d.description ?? null,
});

export async function createNationalTeam(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireAdmin();
  const parsed = nationalTeamSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) {
    return { ok: false, errors: z.flattenError(parsed.error).fieldErrors, values: formValues(fd) };
  }
  const d = parsed.data;

  const { id, error } = await insertWithSlug("national_teams", d.name, {
    name: d.name,
    ...fields(d),
    created_by: user.id,
    updated_by: user.id,
  });
  if (error) return { ok: false, message: error.message, values: formValues(fd) };

  revalidatePath("/", "layout");
  redirect(`/national-teams/${id}`);
}

export async function updateNationalTeam(id: number, _: FormState, fd: FormData): Promise<FormState> {
  const user = await requireAdmin();
  const parsed = nationalTeamSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) {
    return { ok: false, errors: z.flattenError(parsed.error).fieldErrors, values: formValues(fd) };
  }
  const d = parsed.data;

  const { error } = await createAdminClient().from("national_teams").update({
    name: d.name,
    ...fields(d),
    updated_by: user.id,
    updated_at: new Date().toISOString(),
  }).eq("id", id);
  if (error) return { ok: false, message: error.message, values: formValues(fd) };

  revalidatePath("/", "layout");
  redirect(`/national-teams/${id}`);
}

export async function deleteNationalTeams(ids: number[]): Promise<DeleteResult> {
  await requireAdmin();
  const { error } = await createAdminClient().from("national_teams").delete().in("id", ids);
  if (error?.code === "23503") {
    return { ok: false, message: "This national team is linked to player or coach career stints. Remove those first." };
  }
  if (error) return { ok: false, message: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}