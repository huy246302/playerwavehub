// lib/actions/players.ts
"use server";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import { playerSchema } from "@/lib/validation/player";

export type FormState = { ok: boolean; message?: string; errors?: Record<string, string[] | undefined> };

function toRow(d: ReturnType<typeof playerSchema.parse>) {
  return {
    person_id: d.person_id,
    career_start_year: d.career_start_year ?? null,
    retired_year: d.retired_year ?? null,
    height_cm: d.height_cm ?? null,
    legacy_summary: d.legacy_summary || null,
    is_published: d.status === "published",
  };
}

export async function createPlayer(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireAdmin();
  const parsed = playerSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { ok: false, errors: parsed.error.flatten().fieldErrors };

  const { error } = await createAdminClient()
    .from("players")
    .insert({ ...toRow(parsed.data), created_by: user.id, updated_by: user.id });

  if (error?.code === "23505") return { ok: false, errors: { person_id: ["This person already has a player record."] } };
  if (error) return { ok: false, message: error.message };

  revalidatePath("/players");
  return { ok: true, message: "Player saved." };
}

export async function updatePlayer(id: number, _: FormState, fd: FormData): Promise<FormState> {
  const user = await requireAdmin();
  const parsed = playerSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { ok: false, errors: parsed.error.flatten().fieldErrors };

  const { error } = await createAdminClient()
    .from("players")
    .update({ ...toRow(parsed.data), updated_by: user.id, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { ok: false, message: error.message };
  revalidatePath("/players");
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
  revalidatePath("/players");
}