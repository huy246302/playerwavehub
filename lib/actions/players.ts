"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import { playerSchema, type PlayerInput } from "@/lib/validation/player";
import { formValues, type DeleteResult, type FormState } from "@/lib/form-state";

const fields = (d: PlayerInput) => ({
  career_start_year: d.career_start_year ?? null,
  retired_year: d.retired_year ?? null,
  height_cm: d.height_cm ?? null,
  legacy_summary: d.legacy_summary ?? null,
  is_published: d.status === "published",
});

function publishError(error: { message: string }, fd: FormData): FormState | null {
  if (error.message?.includes("cannot publish")) {
    return {
      ok: false,
      errors: { status: ["This player needs a full attributes record before it can be published."] },
      values: formValues(fd),
    };
  }
  return null;
}

export async function createPlayer(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireAdmin();
  const parsed = playerSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { ok: false, errors: z.flattenError(parsed.error).fieldErrors, values: formValues(fd) };
  const d = parsed.data;

  const { data, error } = await createAdminClient()
    .from("players")
    .insert({ ...fields(d), biography_id: d.biography_id, created_by: user.id, updated_by: user.id })
    .select("id").single();

  if (error) {
    if (error.code === "23505")
      return { ok: false, errors: { biography_id: ["This biography already has a player record."] }, values: formValues(fd) };
    return publishError(error, fd) ?? { ok: false, message: error.message, values: formValues(fd) };
  }

  revalidatePath("/", "layout");
  redirect(`/players/${data.id}`);
}

export async function updatePlayer(id: number, _: FormState, fd: FormData): Promise<FormState> {
  const user = await requireAdmin();
  const parsed = playerSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { ok: false, errors: z.flattenError(parsed.error).fieldErrors, values: formValues(fd) };

  const { error } = await createAdminClient()
    .from("players")
    .update({ ...fields(parsed.data), updated_by: user.id, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return publishError(error, fd) ?? { ok: false, message: error.message, values: formValues(fd) };

  revalidatePath("/", "layout");
  redirect(`/players/${id}`);
}

export async function deletePlayers(ids: number[]): Promise<DeleteResult> {
  await requireAdmin();
  const { error } = await createAdminClient().from("players").delete().in("id", ids);
  if (error) return { ok: false, message: error.message };
  revalidatePath("/", "layout");
  return { ok: true };
}
