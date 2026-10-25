import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { fail, one } from "@/lib/db/util";

type ClubRef = { id: number; name: string } | null;
type TeamRef = { id: number; name: string } | null;

export type CoachClubStint = {
  id: number; club_id: number; start_year: number; end_year: number | null;
  is_caretaker: boolean; matches: number | null; wins: number | null; draws: number | null; losses: number | null;
  club: ClubRef;
};
export type CoachNationalStint = {
  id: number; national_team_id: number; start_year: number; end_year: number | null;
  is_caretaker: boolean; matches: number | null; wins: number | null; draws: number | null; losses: number | null;
  team: TeamRef;
};

export async function listCoachClubStints(coachId: number): Promise<CoachClubStint[]> {
  const { data, error } = await createAdminClient()
    .from("coach_club_stints")
    .select("id, club_id, start_year, end_year, is_caretaker, matches, wins, draws, losses, club:clubs(id, name)")
    .eq("coach_id", coachId).order("start_year", { ascending: false });
  if (error) throw fail(error);
  return (data ?? []).map((r) => ({ ...r, club: one(r.club as ClubRef | ClubRef[]) }));
}

export async function listCoachNationalStints(coachId: number): Promise<CoachNationalStint[]> {
  const { data, error } = await createAdminClient()
    .from("coach_national_stints")
    .select("id, national_team_id, start_year, end_year, is_caretaker, matches, wins, draws, losses, team:national_teams(id, name)")
    .eq("coach_id", coachId).order("start_year", { ascending: false });
  if (error) throw fail(error);
  return (data ?? []).map((r) => ({ ...r, team: one(r.team as TeamRef | TeamRef[]) }));
}