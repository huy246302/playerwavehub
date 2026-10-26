import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export const BIOGRAPHY_PAGE_SIZE = 20;

type RoleRef = { id: number; is_published: boolean };
type CountryRef = { id: number; name: string };

const first = <T,>(v: T | T[] | null | undefined): T | null =>
  Array.isArray(v) ? v[0] ?? null : v ?? null;

export type BiographyListRow = {
  id: number;
  full_name: string;
  display_name: string | null;
  date_of_birth: string | null;
  date_of_death: string | null;
  birthplace: string | null;
  created_at: string;
  player: RoleRef | null;
  coach: RoleRef | null;
};

export type Biography = {
  id: number;
  slug: string;
  full_name: string;
  display_name: string | null;
  date_of_birth: string | null;
  date_of_death: string | null;
  birthplace: string | null;
  birth_country_id: number | null;
  nationality_id: number | null;
  photo_url: string | null;
  photo_credit: string | null;
  photo_license: string | null;
  photo_source_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
  player: RoleRef | null;
  coach: RoleRef | null;
  birth_country: CountryRef | null;
  nationality: CountryRef | null;
  sources: number;
};

export async function listBiographies({
  q, role, page = 1,
}: { q?: string; role?: "player" | "coach"; page?: number }) {
  const sb = createAdminClient();
  const pageNo = Number.isInteger(page) && page > 0 ? page : 1;
  const from = (pageNo - 1) * BIOGRAPHY_PAGE_SIZE;

  // !inner turns the embed into an inner join, which filters the parent rows by role
  const columns =
    "id, full_name, display_name, date_of_birth, date_of_death, birthplace, created_at, " +
    `players${role === "player" ? "!inner" : ""}(id, is_published), ` +
    `coaches${role === "coach" ? "!inner" : ""}(id, is_published)`;

  let query = sb
    .from("biographies")
    .select(columns, { count: "exact" })
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .range(from, from + BIOGRAPHY_PAGE_SIZE - 1);

  const term = q?.replace(/[,()%*\\]/g, " ").trim();
  if (term) query = query.or(`full_name.ilike.%${term}%,display_name.ilike.%${term}%`);

  const { data, count } = await query;

  type Raw = Omit<BiographyListRow, "player" | "coach"> & {
    players: RoleRef | RoleRef[] | null;
    coaches: RoleRef | RoleRef[] | null;
  };
  const rows: BiographyListRow[] = ((data ?? []) as unknown as Raw[]).map(
    ({ players, coaches, ...r }) => ({ ...r, player: first(players), coach: first(coaches) })
  );

  return { rows, total: count ?? 0, pageSize: BIOGRAPHY_PAGE_SIZE, page: pageNo };
}

export async function getBiography(id: number): Promise<Biography | null> {
  const { data } = await createAdminClient()
    .from("biographies")
    .select(
      `*, players(id, is_published), coaches(id, is_published),
       birth_country:countries!birth_country_id(id, name),
       nationality:countries!nationality_id(id, name),
       biography_sources(count)`
    )
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;

  const { players, coaches, birth_country, nationality, biography_sources, ...rest } =
    data as Record<string, unknown>;
  return {
    ...(rest as object),
    player: first(players as RoleRef | RoleRef[] | null),
    coach: first(coaches as RoleRef | RoleRef[] | null),
    birth_country: first(birth_country as CountryRef | CountryRef[] | null),
    nationality: first(nationality as CountryRef | CountryRef[] | null),
    sources: (biography_sources as { count: number }[] | null)?.[0]?.count ?? 0,
  } as Biography;
}

export async function listCountryOptions() {
  const { data } = await createAdminClient()
    .from("countries").select("id, name").order("name");
  return (data ?? []) as { id: number; name: string }[];
}