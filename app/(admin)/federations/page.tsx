import Link from "next/link";
import { listFederations, statusCounts, FEDERATION_SORTS, type FederationStatus } from "@/lib/db/federations";
import { listCountryOptions } from "@/lib/db/countries";
import { deleteFederations } from "@/lib/actions/federations";
import RecordTable from "@/components/ui/RecordTable";
import {
  Breadcrumbs, PageHeader, Pager, Thumb, fmtDate, primaryBtn,
} from "@/components/ui/kit";
import { clip } from "@/lib/names";
import ClipText from "@/components/ui/ClipText";
import ListToolbar from "@/components/ui/ListToolbar";
import { resolveSort, sortOptions } from "@/lib/db/sort";
import { CONFEDERATIONS } from "@/lib/validation/federation";

type SP = Record<string, string | undefined>;
const DEFAULT_SORT = "name_asc";
const int = (v?: string) => (v && /^\d{1,9}$/.test(v) ? Number(v) : undefined);


export default async function FederationsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const countryId = int(sp.country);
  const confed = (CONFEDERATIONS as readonly string[]).includes(sp.confed ?? "") ? sp.confed : undefined;
  const from = int(sp.from), to = int(sp.to);
  const { key: sort } = resolveSort(sp.sort, FEDERATION_SORTS, DEFAULT_SORT);
  const status: FederationStatus | undefined =
    sp.status === "active" || sp.status === "defunct" ? sp.status : undefined;

  const [{ rows, total, pageSize, page }, countries, counts] = await Promise.all([
    listFederations({
      q: sp.q, countryId, status, confederation: confed, foundedFrom: from, foundedTo: to, sort, page: int(sp.page) ?? 1,
    }),
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
  const base = { q: sp.q, country: countryId, confed, from, to, sort: sort === DEFAULT_SORT ? undefined : sort };
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
        {f.logo_url ? (
          <Thumb src={f.logo_url} className="h-8 w-8 shrink-0 object-contain" />
        ) : (
          <span className="h-8 w-8 shrink-0 rounded-full bg-neutral-100" aria-hidden />
        )}
        <span>{f.name}{f.short_name && <span className="ml-1 text-neutral-400">({f.short_name})</span>}</span>
      </Link>,
      <span key="co" className="text-neutral-600">{f.country ? <ClipText text={f.country.name} /> : "—"}</span>,
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

        <ListToolbar
          basePath="/federations" searchPlaceholder="Search federations by name…"
          sortOptions={sortOptions(FEDERATION_SORTS)} defaultSort={DEFAULT_SORT} total={total}
          fields={[
            { kind: "select", name: "country", label: "Country", options: countries.map((c) => ({ value: String(c.id), label: clip(c.name) })) },
            { kind: "select", name: "confed", label: "Confederation", options: CONFEDERATIONS.map((c) => ({ value: c, label: c })) },
            { kind: "number", name: "from", label: "Founded from (year)", placeholder: "YYYY" },
            { kind: "number", name: "to", label: "Founded to (year)", placeholder: "YYYY" },
          ]}
        />

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
