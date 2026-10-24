import Link from "next/link";
import { listCountries } from "@/lib/db/countries";
import { deleteCountries } from "@/lib/actions/countries";
import RecordTable from "@/components/ui/RecordTable";
import {
  Breadcrumbs, PageHeader, Pager, Thumb, fmtDate, inputCls, ghostBtn, primaryBtn,
} from "@/components/ui/kit";

type SP = Record<string, string | undefined>;

export default async function CountriesPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const historical = sp.historical === "yes" || sp.historical === "no" ? sp.historical : undefined;
  const { rows, total, pageSize, page } = await listCountries({
    q: sp.q, historical, page: sp.page ? Number(sp.page) : 1,
  });
  const pages = Math.max(1, Math.ceil(total / pageSize));

  const href = (p: number) => {
    const u = new URLSearchParams();
    if (sp.q) u.set("q", sp.q);
    if (historical) u.set("historical", historical);
    if (p > 1) u.set("page", String(p));
    const s = u.toString();
    return s ? `/countries?${s}` : "/countries";
  };

  const tableRows = rows.map((c) => ({
    id: c.id,
    cells: [
      <Link key="n" href={`/countries/${c.id}`} className="flex items-center gap-2 font-medium hover:underline">
        <Thumb src={c.flag_url} className="h-4 w-6 rounded-sm object-cover" />
        {c.name}
      </Link>,
      <span key="i" className="text-neutral-600">{c.iso_code ?? "—"}</span>,
      <span key="t" className={`rounded-full px-2 py-0.5 text-xs ${c.is_historical ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"}`}>
        {c.is_historical ? "Historical" : "Current"}
      </span>,
      <span key="d" className="text-neutral-500">{fmtDate(c.created_at)}</span>,
    ],
  }));

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Archive", href: "/" }, { label: "Countries" }]} />
      <PageHeader
        title="Countries"
        description="One consistent list for nationality, birth country, clubs and national teams."
        actions={<Link href="/countries/new" className={primaryBtn}>+ Add country</Link>}
      />

      <section className="rounded-xl border border-neutral-200 bg-[#fbfaf6]">
        <form method="get" className="flex flex-wrap gap-2 border-b border-neutral-200 p-4">
          <input name="q" defaultValue={sp.q} placeholder="Search by country name…"
            className={`${inputCls} min-w-56 flex-1`} />
          <select name="historical" defaultValue={historical ?? ""} className={`${inputCls} w-auto`}>
            <option value="">Type: All</option>
            <option value="no">Current</option>
            <option value="yes">Historical</option>
          </select>
          <button className={ghostBtn}>Apply</button>
          {(sp.q || historical) && (
            <Link href="/countries" className="px-2 py-2 text-sm text-neutral-500 underline">Clear</Link>
          )}
        </form>

        <RecordTable
          basePath="/countries"
          noun="country"
          headers={["Country", "ISO code", "Type", "Added"]}
          rows={tableRows}
          deleteAction={deleteCountries}
          emptyTitle="No countries yet"
          emptyText="Add your first country, then use it for clubs, national teams and biographies."
        />
        <Pager total={total} page={page} pages={pages} href={href} />
      </section>
    </div>
  );
}