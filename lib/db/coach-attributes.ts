import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { fail } from "@/lib/db/util";

export async function getCoachAttributes(coachId: number) {
  const { data, error } = await createAdminClient()
    .from("coach_attributes").select("*").eq("coach_id", coachId).maybeSingle();
  if (error) throw fail(error);
  return data as Record<string, number | null> | null;
}

export async function getCoachHiddenAttributes(coachId: number) {
  const { data, error } = await createAdminClient()
    .from("coach_hidden_attributes").select("*").eq("coach_id", coachId).maybeSingle();
  if (error) throw fail(error);
  return data as Record<string, number | null> | null;
}