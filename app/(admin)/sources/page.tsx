import Link from "next/link";
import { listSources, SOURCE_SORTS } from "@/lib/db/sources";
import { deleteSources } from "@/lib/actions/sources";
import RecordTable from "@/components/ui/RecordTable";
import { Breadcrumbs, PageHeader, Pager, fmtDate, primaryBtn } from "@/components/ui/kit";
import ListToolbar from "@/components/ui/ListToolbar";
import { resolveSort, sortOptions } from "@/lib/db/sort";
import { buildHref } from "@/lib/list-params";

type SP = Record<string, string | undefined>;
const DEFAULT_SORT = "created_desc";
const int = (v?: string) => (v && /^\d{1,9}$/.test(v) ? Number(v) : undefined);


export default async function SourcesPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const fromYear = int(sp.from), toYear = int(sp.to);
  const publisher = sp.publisher?.trim() || undefined;
  const { key: sort } = resolveSort(sp.sort, SOURCE_SORTS, DEFAULT_SORT);
  const { rows, total, pageSize, page } = await listSources({
    q: sp.q, publisher, fromYear, toYear, sort, page: int(sp.page) ?? 1,
  });
  const pages = Math.max(1, Math.ceil(total / pageSize));

  const href = (p: number) => buildHref("/sources", {
    q: sp.q, publisher, from: fromYear, to: toYear, sort: sort === DEFAULT_SORT ? undefined : sort, page: p > 1 ? p : undefined,
  });

  const tableRows = rows.map((s) => ({
    id: s.id,
    cells: [
      <Link key="t" href={`/sources/${s.id}`} className="font-medium hover:underline">{s.title}</Link>,
      <span key="p" className="text-neutral-600">{s.publisher ?? "—"}</span>,
      <span key="a" className="text-neutral-600">{s.author ?? "—"}</span>,
      <span key="d" className="text-neutral-500">{fmtDate(s.published_on)}</span>,
      <span key="c" className="text-neutral-500">{fmtDate(s.created_at)}</span>,
    ],
  }));

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Archive", href: "/" }, { label: "Sources" }]} />
      <PageHeader title="Sources" description="References that support each story."
        actions={<Link href="/sources/new" className={primaryBtn}>+ Add source</Link>} />

      <section className="rounded-xl border border-neutral-200 bg-[#fbfaf6]">
        <ListToolbar
          basePath="/sources" searchPlaceholder="Search by title, publisher or author…"
          sortOptions={sortOptions(SOURCE_SORTS)} defaultSort={DEFAULT_SORT} total={total}
          fields={[
            { kind: "text", name: "publisher", label: "Publisher contains", placeholder: "e.g. Penguin" },
            { kind: "number", name: "from", label: "Published from (year)", placeholder: "YYYY" },
            { kind: "number", name: "to", label: "Published to (year)", placeholder: "YYYY" },
          ]}
        />

        <RecordTable
          basePath="/sources" noun="source"
          headers={["Title", "Publisher", "Author", "Published", "Added"]}
          rows={tableRows}
          deleteAction={deleteSources}
          emptyTitle="No sources yet"
          emptyText="Add your first source, then link it to biographies or clubs."
        />
        <Pager total={total} page={page} pages={pages} href={href} />
      </section>
    </div>
  );
}