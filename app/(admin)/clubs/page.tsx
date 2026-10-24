import Link from "next/link";
import { listClubs } from "@/lib/db/clubs";
import { listCountryOptions } from "@/lib/db/countries";
import { deleteClubs } from "@/lib/actions/clubs";
import RecordTable from "@/components/ui/RecordTable";
import {
  Breadcrumbs, PageHeader, Pager, Thumb, fmtDate, inputCls, ghostBtn, primaryBtn,
} from "@/components/ui/kit";

type SP = Record<string, string | undefined>;

export default async function ClubsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const countryId = sp.country ? Number(sp.country) : undefined;

  const [{ rows, total, pageSize, page }, countries] = await Promise.all([
    listClubs({ q: sp.q, countryId, page: sp.page ? Number(sp.page) : 1 }),
    listCountryOptions(),
  ]);
  const pages = Math.max(1, Math.ceil(total / pageSize));

  const href = (p: number) => {
    const u = new URLSearchParams();
    if (sp.q) u.set("q", sp.q);
    if (countryId) u.set("country", String(countryId));
    if (p > 1) u.set("page", String(p));
    const s = u.toString();
    return s ? `/clubs?${s}` : "/clubs";
  };

  const tableRows = rows.map((c) => ({
    id: c.id,
    cells: [
      <Link key="n" href={`/clubs/${c.id}`} className="flex items-center gap-2 font-medium hover:underline">
        <Thumb src={c.logo_url} className="h-6 w-6 rounded-full border border-neutral-200 object-cover" />
        <span>{c.name}{c.short_name && <span className="ml-1 text-neutral-400">({c.short_name})</span>}</span>
      </Link>,
      <span key="c" className="text-neutral-600">{c.city ?? "—"}</span>,
      <span key="co" className="text-neutral-600">{c.country?.name ?? "—"}</span>,
      <span key="f" className="text-neutral-600">{c.founded_year ?? "—"}</span>,
      <span key="u" className="text-neutral-500">{fmtDate(c.updated_at)}</span>,
    ],
  }));

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Archive", href: "/" }, { label: "Clubs" }]} />
      <PageHeader
        title="Clubs"
        description="Club histories and identities."
        actions={<Link href="/clubs/new" className={primaryBtn}>+ Add club</Link>}
      />

      <section className="rounded-xl border border-neutral-200 bg-[#fbfaf6]">
        <form method="get" className="flex flex-wrap gap-2 border-b border-neutral-200 p-4">
          <input name="q" defaultValue={sp.q} placeholder="Search by club name…" className={`${inputCls} min-w-56 flex-1`} />
          <select name="country" defaultValue={countryId ? String(countryId) : ""} className={`${inputCls} w-auto`}>
            <option value="">Country: All</option>
            {countries.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button className={ghostBtn}>Apply</button>
          {(sp.q || countryId) && <Link href="/clubs" className="px-2 py-2 text-sm text-neutral-500 underline">Clear</Link>}
        </form>

        <RecordTable
          basePath="/clubs"
          noun="club"
          headers={["Club", "City", "Country", "Founded", "Updated"]}
          rows={tableRows}
          deleteAction={deleteClubs}
          emptyTitle="No clubs yet"
          emptyText="Add your first club, then link it to player and coach career stints."
        />
        <Pager total={total} page={page} pages={pages} href={href} />
      </section>
    </div>
  );
}