import Link from "next/link";
import { listClubs, CLUB_SORTS } from "@/lib/db/clubs";
import { listCountryOptions } from "@/lib/db/countries";
import { deleteClubs } from "@/lib/actions/clubs";
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


export default async function ClubsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const countryId = int(sp.country);
  const from = int(sp.from), to = int(sp.to);
  const { key: sort } = resolveSort(sp.sort, CLUB_SORTS, DEFAULT_SORT);

  const [{ rows, total, pageSize, page }, countries] = await Promise.all([
    listClubs({ q: sp.q, countryId, foundedFrom: from, foundedTo: to, sort, page: int(sp.page) ?? 1 }),
    listCountryOptions(),
  ]);
  const pages = Math.max(1, Math.ceil(total / pageSize));

  const href = (p: number) => buildHref("/clubs", {
    q: sp.q, country: countryId, from, to, sort: sort === DEFAULT_SORT ? undefined : sort, page: p > 1 ? p : undefined,
  });

  const tableRows = rows.map((c) => ({
    id: c.id,
    cells: [
      <Link key="n" href={`/clubs/${c.id}`} className="flex items-center gap-2 font-medium hover:underline">
        <Thumb src={c.logo_url} className="h-6 w-6 rounded-full border border-neutral-200 object-cover" />
        <span>{c.name}{c.short_name && <span className="ml-1 text-neutral-400">({c.short_name})</span>}</span>
      </Link>,
      <span key="c" className="text-neutral-600">{c.city ?? "—"}</span>,
      <span key="co" className="text-neutral-600">{c.country ? <ClipText text={c.country.name} /> : "—"}</span>,
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
        <ListToolbar
          basePath="/clubs" searchPlaceholder="Search clubs by name…"
          sortOptions={sortOptions(CLUB_SORTS)} defaultSort={DEFAULT_SORT} total={total}
          fields={[
            { kind: "select", name: "country", label: "Country", options: countries.map((c) => ({ value: String(c.id), label: clip(c.name) })) },
            { kind: "number", name: "from", label: "Founded from (year)", placeholder: "YYYY" },
            { kind: "number", name: "to", label: "Founded to (year)", placeholder: "YYYY" },
          ]}
        />

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