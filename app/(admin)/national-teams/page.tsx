import Link from "next/link";
import { listNationalTeams, NATIONAL_TEAM_SORTS } from "@/lib/db/national-teams";
import { listCountryOptions } from "@/lib/db/countries";
import { deleteNationalTeams } from "@/lib/actions/national-teams";
import RecordTable from "@/components/ui/RecordTable";
import {
  Breadcrumbs, PageHeader, Pager, Thumb, fmtDate, primaryBtn,
} from "@/components/ui/kit";
import { clip } from "@/lib/names";
import ClipText from "@/components/ui/ClipText";
import ListToolbar from "@/components/ui/ListToolbar";
import { resolveSort, sortOptions } from "@/lib/db/sort";
import { buildHref } from "@/lib/list-params";

type SP = Record<string, string | undefined>;
const DEFAULT_SORT = "name_asc";
const int = (v?: string) => (v && /^\d{1,9}$/.test(v) ? Number(v) : undefined);


export default async function NationalTeamsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const countryId = int(sp.country);
  const { key: sort } = resolveSort(sp.sort, NATIONAL_TEAM_SORTS, DEFAULT_SORT);

  const [{ rows, total, pageSize, page }, countries] = await Promise.all([
    listNationalTeams({ q: sp.q, countryId, sort, page: int(sp.page) ?? 1 }),
    listCountryOptions(),
  ]);
  const pages = Math.max(1, Math.ceil(total / pageSize));

  const href = (p: number) => buildHref("/national-teams", {
    q: sp.q, country: countryId, sort: sort === DEFAULT_SORT ? undefined : sort, page: p > 1 ? p : undefined,
  });

  const tableRows = rows.map((t) => ({
    id: t.id,
    cells: [
      <Link key="n" href={`/national-teams/${t.id}`} className="flex items-center gap-2 font-medium hover:underline">
        <Thumb src={t.crest_url} className="h-6 w-6 rounded-full border border-neutral-200 object-cover" />
        {t.name}
      </Link>,
      <span key="co" className="text-neutral-600">{t.country ? <ClipText text={t.country.name} /> : "—"}</span>,
      <span key="u" className="text-neutral-500">{fmtDate(t.updated_at)}</span>,
    ],
  }));

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Archive", href: "/" }, { label: "National teams" }]} />
      <PageHeader
        title="National teams"
        description="International football teams, one level only."
        actions={<Link href="/national-teams/new" className={primaryBtn}>+ Add national team</Link>}
      />

      <section className="rounded-xl border border-neutral-200 bg-[#fbfaf6]">
        <ListToolbar
          basePath="/national-teams" searchPlaceholder="Search national teams by name…"
          sortOptions={sortOptions(NATIONAL_TEAM_SORTS)} defaultSort={DEFAULT_SORT} total={total}
          fields={[
            { kind: "select", name: "country", label: "Country", options: countries.map((c) => ({ value: String(c.id), label: clip(c.name) })) },
          ]}
        />

        <RecordTable
          basePath="/national-teams"
          noun="national team"
          headers={["Team", "Country", "Updated"]}
          rows={tableRows}
          deleteAction={deleteNationalTeams}
          emptyTitle="No national teams yet"
          emptyText="Add your first national team, then link it to player and coach career stints."
        />
        <Pager total={total} page={page} pages={pages} href={href} />
      </section>
    </div>
  );
}