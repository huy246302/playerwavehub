import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { fail, one } from "@/lib/db/util";

type ClubRef = { id: number; name: string } | null;
type TeamRef = { id: number; name: string } | null;

export type ClubStint = {
  id: number; club_id: number; start_year: number; end_year: number | null;
  is_loan: boolean; appearances: number | null; goals: number | null; club: ClubRef;
};
export type NationalStint = {
  id: number; national_team_id: number; debut_date: string | null; last_cap_date: string | null;
  caps: number | null; goals: number | null; team: TeamRef;
};

export async function listClubStints(playerId: number): Promise<ClubStint[]> {
  const { data, error } = await createAdminClient()
    .from("player_club_stints")
    .select("id, club_id, start_year, end_year, is_loan, appearances, goals, club:clubs(id, name)")
    .eq("player_id", playerId).order("start_year", { ascending: false });
  if (error) throw fail(error);
  return (data ?? []).map((r) => ({ ...r, club: one(r.club as ClubRef | ClubRef[]) }));
}

export async function listNationalStints(playerId: number): Promise<NationalStint[]> {
  const { data, error } = await createAdminClient()
    .from("player_national_stints")
    .select("id, national_team_id, debut_date, last_cap_date, caps, goals, team:national_teams(id, name)")
    .eq("player_id", playerId).order("debut_date", { ascending: false });
  if (error) throw fail(error);
  return (data ?? []).map((r) => ({ ...r, team: one(r.team as TeamRef | TeamRef[]) }));
}