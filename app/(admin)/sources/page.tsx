import Link from "next/link";
import { listSources } from "@/lib/db/sources";
import { deleteSources } from "@/lib/actions/sources";
import RecordTable from "@/components/ui/RecordTable";
import { Breadcrumbs, PageHeader, Pager, fmtDate, inputCls, ghostBtn, primaryBtn } from "@/components/ui/kit";

type SP = Record<string, string | undefined>;

export default async function SourcesPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const { rows, total, pageSize, page } = await listSources({ q: sp.q, page: sp.page ? Number(sp.page) : 1 });
  const pages = Math.max(1, Math.ceil(total / pageSize));

  const href = (p: number) => {
    const u = new URLSearchParams();
    if (sp.q) u.set("q", sp.q);
    if (p > 1) u.set("page", String(p));
    const s = u.toString();
    return s ? `/sources?${s}` : "/sources";
  };

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
        <form method="get" className="flex flex-wrap gap-2 border-b border-neutral-200 p-4">
          <input name="q" defaultValue={sp.q} placeholder="Search by title, publisher or author…" className={`${inputCls} min-w-56 flex-1`} />
          <button className={ghostBtn}>Apply</button>
          {sp.q && <Link href="/sources" className="px-2 py-2 text-sm text-neutral-500 underline">Clear</Link>}
        </form>

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