"use server";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import { insertPerson } from "@/lib/biographies";
import { playerSchema, type PlayerInput } from "@/lib/validation/player";
import { z } from "zod";

export type FormState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string[] | undefined>;
};

const playerFields = (d: PlayerInput) => ({
  career_start_year: d.career_start_year ?? null,
  retired_year: d.retired_year ?? null,
  height_cm: d.height_cm ?? null,
  legacy_summary: d.legacy_summary ?? null,
  is_published: d.status === "published",
});

export async function createPlayer(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireAdmin();
  const parsed = playerSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { ok: false, errors: z.flattenError(parsed.error).fieldErrors };
  const d = parsed.data;
  const sb = createAdminClient();

  let personId = d.biography_id!;
  let createdPersonId: number | null = null;

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
    if (res.error || !res.id) return { ok: false, message: res.error ?? "Could not create the person." };
    personId = res.id;
    createdPersonId = res.id;
  }

  const { error } = await sb
    .from("players")
    .insert({ ...playerFields(d), biography_id: personId, created_by: user.id, updated_by: user.id });

  if (error) {
    if (createdPersonId) await sb.from("biographies").delete().eq("id", createdPersonId);
    if (error.code === "23505")
      return { ok: false, errors: { biography_id: ["This person already has a player record."] } };
    return { ok: false, message: error.message };
  }

  revalidatePath("/", "layout");
  return { ok: true, message: "Player saved." };
}

export async function updatePlayer(id: number, _: FormState, fd: FormData): Promise<FormState> {
  const user = await requireAdmin();
  const parsed = playerSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { ok: false, errors: z.flattenError(parsed.error).fieldErrors };

  const { error } = await createAdminClient()
    .from("players")
    .update({ ...playerFields(parsed.data), updated_by: user.id, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { ok: false, message: error.message };
  revalidatePath("/", "layout");
  return { ok: true, message: "Player updated." };
}

export async function deletePlayers(ids: number[]) {
  await requireAdmin();
  const sb = createAdminClient();
  // child tables have no ON DELETE CASCADE, so delete them first
  for (const t of ["player_attributes", "player_hidden_attributes", "player_positions", "player_club_stints", "player_national_stints"]) {
    await sb.from(t).delete().in("player_id", ids);
  }
  const { error } = await sb.from("players").delete().in("id", ids);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}