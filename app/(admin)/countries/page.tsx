import Link from "next/link";
import { listCountries, COUNTRY_SORTS } from "@/lib/db/countries";
import { deleteCountries } from "@/lib/actions/countries";
import RecordTable from "@/components/ui/RecordTable";
import {
  Breadcrumbs, PageHeader, Pager, Thumb, fmtDate, primaryBtn,
} from "@/components/ui/kit";
import ClipText from "@/components/ui/ClipText";
import ListToolbar from "@/components/ui/ListToolbar";
import { resolveSort, sortOptions } from "@/lib/db/sort";
import { buildHref } from "@/lib/list-params";

type SP = Record<string, string | undefined>;
const DEFAULT_SORT = "name_asc";
const int = (v?: string) => (v && /^\d{1,9}$/.test(v) ? Number(v) : undefined);


export default async function CountriesPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const historical = sp.historical === "yes" || sp.historical === "no" ? sp.historical : undefined;
  const { key: sort } = resolveSort(sp.sort, COUNTRY_SORTS, DEFAULT_SORT);
  const { rows, total, pageSize, page } = await listCountries({
    q: sp.q, historical, sort, page: int(sp.page) ?? 1,
  });
  const pages = Math.max(1, Math.ceil(total / pageSize));

  const href = (p: number) => buildHref("/countries", {
    q: sp.q, historical, sort: sort === DEFAULT_SORT ? undefined : sort, page: p > 1 ? p : undefined,
  });

  const tableRows = rows.map((c) => ({
    id: c.id,
    cells: [
      <Link key="n" href={`/countries/${c.id}`} className="flex items-center gap-2 font-medium hover:underline">
        <Thumb src={c.flag_url} className="h-4 w-6 rounded-sm object-cover" />
        <ClipText text={c.name} />
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
        <ListToolbar
          basePath="/countries" searchPlaceholder="Search countries by name…"
          sortOptions={sortOptions(COUNTRY_SORTS)} defaultSort={DEFAULT_SORT} total={total}
          fields={[
            { kind: "select", name: "historical", label: "Type", options: [{ value: "no", label: "Current" }, { value: "yes", label: "Historical" }] },
          ]}
        />

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