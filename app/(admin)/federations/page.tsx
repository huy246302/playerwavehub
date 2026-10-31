import Link from "next/link";
import { listFederations, statusCounts, type FederationStatus } from "@/lib/db/federations";
import { listCountryOptions } from "@/lib/db/countries";
import { deleteFederations } from "@/lib/actions/federations";
import RecordTable from "@/components/ui/RecordTable";
import {
  Breadcrumbs, PageHeader, Pager, Thumb, fmtDate, inputCls, ghostBtn, primaryBtn,
} from "@/components/ui/kit";

type SP = Record<string, string | undefined>;

export default async function FederationsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const countryId = sp.country ? Number(sp.country) : undefined;
  const status: FederationStatus | undefined =
    sp.status === "active" || sp.status === "defunct" ? sp.status : undefined;

  const [{ rows, total, pageSize, page }, countries, counts] = await Promise.all([
    listFederations({ q: sp.q, countryId, status, page: sp.page ? Number(sp.page) : 1 }),
    listCountryOptions(),
    statusCounts(),
  ]);
  const pages = Math.max(1, Math.ceil(total / pageSize));

  const qs = (o: Record<string, string | number | undefined>) => {
    const u = new URLSearchParams();
    Object.entries(o).forEach(([k, v]) => { if (v !== undefined && v !== "") u.set(k, String(v)); });
    const s = u.toString();
    return s ? `/federations?${s}` : "/federations";
  };
  const base = { q: sp.q, country: countryId };
  const href = (p: number) => qs({ ...base, status, page: p > 1 ? p : undefined });
  const tab = (label: string, value: FederationStatus | undefined, n: number) => (
    <Link href={qs({ ...base, status: value })}
      className={`border-b-2 px-1 pb-2 text-sm ${status === value ? "border-[#254a39] font-medium text-neutral-900" : "border-transparent text-neutral-500"}`}>
      {label} <span className="ml-1 rounded bg-neutral-200 px-1.5 text-xs">{n}</span>
    </Link>
  );

  const tableRows = rows.map((f) => ({
    id: f.id,
    cells: [
      <Link key="n" href={`/federations/${f.id}`} className="flex items-center gap-2 font-medium hover:underline">
        <Thumb src={f.logo_url} className="h-6 w-6 rounded-full border border-neutral-200 object-cover" />
        <span>{f.name}{f.short_name && <span className="ml-1 text-neutral-400">({f.short_name})</span>}</span>
      </Link>,
      <span key="co" className="text-neutral-600">{f.country?.name ?? "—"}</span>,
      <span key="cf" className="text-neutral-600">{f.confederation ?? "—"}</span>,
      <span key="y" className="text-neutral-600">{f.founded_year}–{f.ended_year ?? "present"}</span>,
      <span key="s" className={`rounded-full px-2 py-0.5 text-xs ${f.ended_year != null ? "bg-neutral-200 text-neutral-700" : "bg-green-100 text-green-800"}`}>
        {f.ended_year != null ? "Defunct" : "Active"}
      </span>,
      <span key="u" className="text-neutral-500">{fmtDate(f.updated_at)}</span>,
    ],
  }));

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Archive", href: "/" }, { label: "Federations" }]} />
      <PageHeader
        title="Federations"
        description="Football federations and the years they existed. National teams take their dates from them."
        actions={<Link href="/federations/new" className={primaryBtn}>+ Add federation</Link>}
      />

      <section className="rounded-xl border border-neutral-200 bg-[#fbfaf6]">
        <div className="flex gap-6 border-b border-neutral-200 px-4 pt-3">
          {tab("All records", undefined, counts.all)}
          {tab("Active", "active", counts.active)}
          {tab("Defunct", "defunct", counts.defunct)}
        </div>

        <form method="get" className="flex flex-wrap gap-2 border-b border-neutral-200 p-4">
          {status && <input type="hidden" name="status" value={status} />}
          <input name="q" defaultValue={sp.q} placeholder="Search by federation name…" className={`${inputCls} min-w-56 flex-1`} />
          <select name="country" defaultValue={countryId ? String(countryId) : ""} className={`${inputCls} w-auto`}>
            <option value="">Country: All</option>
            {countries.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button className={ghostBtn}>Apply</button>
          {(sp.q || countryId) && <Link href={qs({ status })} className="px-2 py-2 text-sm text-neutral-500 underline">Clear</Link>}
        </form>

        <RecordTable
          basePath="/federations"
          noun="federation"
          headers={["Federation", "Country", "Confederation", "Years", "Status", "Updated"]}
          rows={tableRows}
          deleteAction={deleteFederations}
          emptyTitle="No federations yet"
          emptyText="Add the first federation, then link national teams to it."
        />
        <Pager total={total} page={page} pages={pages} href={href} />
      </section>
    </div>
  );
}
