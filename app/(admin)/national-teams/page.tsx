import Link from "next/link";
import { listNationalTeams } from "@/lib/db/national-teams";
import { listCountryOptions } from "@/lib/db/countries";
import { deleteNationalTeams } from "@/lib/actions/national-teams";
import RecordTable from "@/components/ui/RecordTable";
import {
  Breadcrumbs, PageHeader, Pager, Thumb, fmtDate, inputCls, ghostBtn, primaryBtn,
} from "@/components/ui/kit";

type SP = Record<string, string | undefined>;

export default async function NationalTeamsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const countryId = sp.country ? Number(sp.country) : undefined;

  const [{ rows, total, pageSize, page }, countries] = await Promise.all([
    listNationalTeams({ q: sp.q, countryId, page: sp.page ? Number(sp.page) : 1 }),
    listCountryOptions(),
  ]);
  const pages = Math.max(1, Math.ceil(total / pageSize));

  const href = (p: number) => {
    const u = new URLSearchParams();
    if (sp.q) u.set("q", sp.q);
    if (countryId) u.set("country", String(countryId));
    if (p > 1) u.set("page", String(p));
    const s = u.toString();
    return s ? `/national-teams?${s}` : "/national-teams";
  };

  const tableRows = rows.map((t) => ({
    id: t.id,
    cells: [
      <Link key="n" href={`/national-teams/${t.id}`} className="flex items-center gap-2 font-medium hover:underline">
        <Thumb src={t.crest_url} className="h-6 w-6 rounded-full border border-neutral-200 object-cover" />
        {t.name}
      </Link>,
      <span key="co" className="text-neutral-600">{t.country?.name ?? "—"}</span>,
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
        <form method="get" className="flex flex-wrap gap-2 border-b border-neutral-200 p-4">
          <input name="q" defaultValue={sp.q} placeholder="Search by team name…" className={`${inputCls} min-w-56 flex-1`} />
          <select name="country" defaultValue={countryId ? String(countryId) : ""} className={`${inputCls} w-auto`}>
            <option value="">Country: All</option>
            {countries.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button className={ghostBtn}>Apply</button>
          {(sp.q || countryId) && <Link href="/national-teams" className="px-2 py-2 text-sm text-neutral-500 underline">Clear</Link>}
        </form>

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