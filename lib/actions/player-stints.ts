"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import { clubStintSchema, nationalStintSchema } from "@/lib/validation/stints";
import { formValues, type DeleteResult, type FormState } from "@/lib/form-state";

const refresh = (playerId: number) => {
  revalidatePath(`/players/${playerId}`, "page");
  revalidatePath(`/players/${playerId}/stints`, "page");
};

export async function createClubStint(playerId: number, _: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = clubStintSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { ok: false, errors: z.flattenError(parsed.error).fieldErrors, values: formValues(fd) };
  const d = parsed.data;

  const { error } = await createAdminClient().from("player_club_stints").insert({
    player_id: playerId, club_id: d.club_id, start_year: d.start_year, end_year: d.end_year ?? null,
    is_loan: d.is_loan, appearances: d.appearances ?? null, goals: d.goals ?? null,
  });
  if (error) {
    if (error.code === "23505") return { ok: false, message: "This club already has a stint starting that year.", values: formValues(fd) };
    return { ok: false, message: error.message, values: formValues(fd) };
  }
  refresh(playerId);
  return { ok: true, message: "Club stint added." };
}

export async function updateClubStint(stintId: number, playerId: number, _: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = clubStintSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { ok: false, errors: z.flattenError(parsed.error).fieldErrors, values: formValues(fd) };
  const d = parsed.data;

  const { error } = await createAdminClient().from("player_club_stints").update({
    club_id: d.club_id, start_year: d.start_year, end_year: d.end_year ?? null,
    is_loan: d.is_loan, appearances: d.appearances ?? null, goals: d.goals ?? null,
  }).eq("id", stintId);
  if (error) {
    if (error.code === "23505") return { ok: false, message: "This club already has a stint starting that year.", values: formValues(fd) };
    return { ok: false, message: error.message, values: formValues(fd) };
  }
  refresh(playerId);
  return { ok: true, message: "Club stint updated." };
}

export async function deleteClubStint(stintId: number, playerId: number): Promise<DeleteResult> {
  await requireAdmin();
  const { error } = await createAdminClient().from("player_club_stints").delete().eq("id", stintId);
  if (error) return { ok: false, message: error.message };
  refresh(playerId);
  return { ok: true };
}

export async function createNationalStint(playerId: number, _: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = nationalStintSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { ok: false, errors: z.flattenError(parsed.error).fieldErrors, values: formValues(fd) };
  const d = parsed.data;

  const { error } = await createAdminClient().from("player_national_stints").insert({
    player_id: playerId, national_team_id: d.national_team_id,
    debut_date: d.debut_date ?? null, last_cap_date: d.last_cap_date ?? null,
    caps: d.caps ?? null, goals: d.goals ?? null,
  });
  if (error) {
    if (error.code === "23505")
      return { ok: false, message: "This player already has a stint for that national team. Edit the existing record instead.", values: formValues(fd) };
    return { ok: false, message: error.message, values: formValues(fd) };
  }
  refresh(playerId);
  return { ok: true, message: "National stint added." };
}

export async function updateNationalStint(stintId: number, playerId: number, _: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = nationalStintSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { ok: false, errors: z.flattenError(parsed.error).fieldErrors, values: formValues(fd) };
  const d = parsed.data;

  const { error } = await createAdminClient().from("player_national_stints").update({
    national_team_id: d.national_team_id,
    debut_date: d.debut_date ?? null, last_cap_date: d.last_cap_date ?? null,
    caps: d.caps ?? null, goals: d.goals ?? null,
  }).eq("id", stintId);
  if (error) {
    if (error.code === "23505") return { ok: false, message: "This player already has a stint for that national team.", values: formValues(fd) };
    return { ok: false, message: error.message, values: formValues(fd) };
  }
  refresh(playerId);
  return { ok: true, message: "National stint updated." };
}

export async function deleteNationalStint(stintId: number, playerId: number): Promise<DeleteResult> {
  await requireAdmin();
  const { error } = await createAdminClient().from("player_national_stints").delete().eq("id", stintId);
  if (error) return { ok: false, message: error.message };
  refresh(playerId);
  return { ok: true };
}