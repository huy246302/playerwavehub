"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import { insertPerson } from "@/lib/biographies";
import { coachSchema, type CoachInput } from "@/lib/validation/coach";
import type { FormState } from "@/lib/actions/players";

const coachFields = (d: CoachInput) => ({
  career_start_year: d.career_start_year ?? null,
  retired_year: d.retired_year ?? null,
  legacy_summary: d.legacy_summary ?? null,
  is_published: d.status === "published",
});

export async function createCoach(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireAdmin();
  const parsed = coachSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { ok: false, errors: z.flattenError(parsed.error).fieldErrors };
  const d = parsed.data;
  const sb = createAdminClient();

  let biographyId = d.biography_id!;
  let createdId: number | null = null;

  if (d.person_mode === "new") {
    const res = await insertPerson(
      {
        full_name: d.full_name!,
        display_name: d.display_name,
        date_of_birth: d.date_of_birth,
        date_of_death: d.date_of_death,
        birthplace: d.birthplace,
      },
      user.id
    );
    if (res.error || !res.id) return { ok: false, message: res.error ?? "Could not create the biography." };
    biographyId = res.id;
    createdId = res.id;
  }

  const { error } = await sb
    .from("coaches")
    .insert({ ...coachFields(d), biography_id: biographyId, created_by: user.id, updated_by: user.id });

  if (error) {
    if (createdId) await sb.from("biographies").delete().eq("id", createdId);
    if (error.code === "23505")
      return { ok: false, errors: { biography_id: ["This biography already has a head coach record."] } };
    return { ok: false, message: error.message };
  }

  revalidatePath("/", "layout");
  return { ok: true, message: "Head coach saved." };
}

export async function updateCoach(id: number, _: FormState, fd: FormData): Promise<FormState> {
  const user = await requireAdmin();
  const parsed = coachSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { ok: false, errors: z.flattenError(parsed.error).fieldErrors };

  const { error } = await createAdminClient()
    .from("coaches")
    .update({ ...coachFields(parsed.data), updated_by: user.id, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { ok: false, message: error.message };
  revalidatePath("/", "layout");
  return { ok: true, message: "Head coach updated." };
}

export async function deleteCoaches(ids: number[]) {
  await requireAdmin();
  // attributes and stints are removed by ON DELETE CASCADE
  const { error } = await createAdminClient().from("coaches").delete().in("id", ids);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}