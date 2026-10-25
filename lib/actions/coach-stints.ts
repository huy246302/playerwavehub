"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import { coachClubStintSchema, coachNationalStintSchema } from "@/lib/validation/coach-stints";
import { formValues, type DeleteResult, type FormState } from "@/lib/form-state";

const refresh = (coachId: number) => {
  revalidatePath(`/head-coach/${coachId}`, "page");
  revalidatePath(`/head-coach/${coachId}/stints`, "page");
};

export async function createCoachClubStint(coachId: number, _: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = coachClubStintSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { ok: false, errors: z.flattenError(parsed.error).fieldErrors, values: formValues(fd) };
  const d = parsed.data;

  const { error } = await createAdminClient().from("coach_club_stints").insert({
    coach_id: coachId, club_id: d.club_id, start_year: d.start_year, end_year: d.end_year ?? null,
    is_caretaker: d.is_caretaker, matches: d.matches ?? null, wins: d.wins ?? null, draws: d.draws ?? null, losses: d.losses ?? null,
  });
  if (error) {
    if (error.code === "23505") return { ok: false, message: "This club already has a stint starting that year.", values: formValues(fd) };
    return { ok: false, message: error.message, values: formValues(fd) };
  }
  refresh(coachId);
  return { ok: true, message: "Club stint added." };
}

export async function updateCoachClubStint(stintId: number, coachId: number, _: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = coachClubStintSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { ok: false, errors: z.flattenError(parsed.error).fieldErrors, values: formValues(fd) };
  const d = parsed.data;

  const { error } = await createAdminClient().from("coach_club_stints").update({
    club_id: d.club_id, start_year: d.start_year, end_year: d.end_year ?? null,
    is_caretaker: d.is_caretaker, matches: d.matches ?? null, wins: d.wins ?? null, draws: d.draws ?? null, losses: d.losses ?? null,
  }).eq("id", stintId);
  if (error) {
    if (error.code === "23505") return { ok: false, message: "This club already has a stint starting that year.", values: formValues(fd) };
    return { ok: false, message: error.message, values: formValues(fd) };
  }
  refresh(coachId);
  return { ok: true, message: "Club stint updated." };
}

export async function deleteCoachClubStint(stintId: number, coachId: number): Promise<DeleteResult> {
  await requireAdmin();
  const { error } = await createAdminClient().from("coach_club_stints").delete().eq("id", stintId);
  if (error) return { ok: false, message: error.message };
  refresh(coachId);
  return { ok: true };
}

export async function createCoachNationalStint(coachId: number, _: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = coachNationalStintSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { ok: false, errors: z.flattenError(parsed.error).fieldErrors, values: formValues(fd) };
  const d = parsed.data;

  const { error } = await createAdminClient().from("coach_national_stints").insert({
    coach_id: coachId, national_team_id: d.national_team_id, start_year: d.start_year, end_year: d.end_year ?? null,
    is_caretaker: d.is_caretaker, matches: d.matches ?? null, wins: d.wins ?? null, draws: d.draws ?? null, losses: d.losses ?? null,
  });
  if (error) {
    if (error.code === "23505") return { ok: false, message: "This national team already has a stint starting that year.", values: formValues(fd) };
    return { ok: false, message: error.message, values: formValues(fd) };
  }
  refresh(coachId);
  return { ok: true, message: "National stint added." };
}

export async function updateCoachNationalStint(stintId: number, coachId: number, _: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = coachNationalStintSchema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { ok: false, errors: z.flattenError(parsed.error).fieldErrors, values: formValues(fd) };
  const d = parsed.data;

  const { error } = await createAdminClient().from("coach_national_stints").update({
    national_team_id: d.national_team_id, start_year: d.start_year, end_year: d.end_year ?? null,
    is_caretaker: d.is_caretaker, matches: d.matches ?? null, wins: d.wins ?? null, draws: d.draws ?? null, losses: d.losses ?? null,
  }).eq("id", stintId);
  if (error) {
    if (error.code === "23505") return { ok: false, message: "This national team already has a stint starting that year.", values: formValues(fd) };
    return { ok: false, message: error.message, values: formValues(fd) };
  }
  refresh(coachId);
  return { ok: true, message: "National stint updated." };
}

export async function deleteCoachNationalStint(stintId: number, coachId: number): Promise<DeleteResult> {
  await requireAdmin();
  const { error } = await createAdminClient().from("coach_national_stints").delete().eq("id", stintId);
  if (error) return { ok: false, message: error.message };
  refresh(coachId);
  return { ok: true };
}