"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import { biographySchema } from "@/lib/validation/biography";
import { formValues, type DeleteResult, type FormState } from "@/lib/form-state";

const slugify = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/gi, "d")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export async function createPerson(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireAdmin();
  const parsed = biographySchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { ok: false, errors: z.flattenError(parsed.error).fieldErrors, values: formValues(fd) };

  const d = parsed.data;
  const base = slugify(d.full_name) || "person";
  const sb = createAdminClient();

  for (let i = 0; i < 3; i++) {
    const slug = i === 0 ? base : `${base}-${Math.random().toString(36).slice(2, 6)}`;
    const { error } = await sb.from("biographies").insert({
      slug, full_name: d.full_name, display_name: d.display_name ?? null,
      date_of_birth: d.date_of_birth ?? null, date_of_death: d.date_of_death ?? null,
      birthplace: d.birthplace ?? null, bio: d.bio ?? null,
      created_by: user.id, updated_by: user.id,
    });
    if (!error) {
      revalidatePath("/", "layout");
      return { ok: true, message: "Biography saved." };
    }
    if (error.code !== "23505") return { ok: false, message: error.message, values: formValues(fd) };
  }
  return { ok: false, message: "Could not generate a unique slug.", values: formValues(fd) };
}

export async function updateBiography(id: number, _: FormState, fd: FormData): Promise<FormState> {
  const user = await requireAdmin();
  const parsed = biographySchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { ok: false, errors: z.flattenError(parsed.error).fieldErrors, values: formValues(fd) };
  const d = parsed.data;

  const { error } = await createAdminClient().from("biographies").update({
    full_name: d.full_name,
    display_name: d.display_name ?? null,
    date_of_birth: d.date_of_birth ?? null,
    date_of_death: d.date_of_death ?? null,
    birthplace: d.birthplace ?? null,
    bio: d.bio ?? null,
    updated_by: user.id,
  }).eq("id", id);

  if (error) return { ok: false, message: error.message, values: formValues(fd) };
  revalidatePath("/", "layout");
  return { ok: true, message: "Biography updated." };
}

export async function deleteBiography(ids: number[]): Promise<DeleteResult> {
  await requireAdmin();
  const { error } = await createAdminClient().from("biographies").delete().in("id", ids);
  if (error?.code === "23503") {
    return { ok: false, message: "This biography is linked to a player, coach or source. Remove those first." };
  }
  if (error) return { ok: false, message: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}