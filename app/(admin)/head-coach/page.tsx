import Link from "next/link";
import { listCoaches, coachStatusCounts } from "@/lib/db/coach";
import { deleteCoaches } from "@/lib/actions/coach";
import RecordTable from "@/components/ui/RecordTable";
import NationalityTag from "@/components/ui/NationalityTag";
import { Breadcrumbs, PageHeader, Pager, fmtDate, inputCls, ghostBtn, primaryBtn } from "@/components/ui/kit";

type SP = Record<string, string | undefined>;

export default async function HeadCoachPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const status = sp.status === "draft" || sp.status === "published" ? sp.status : undefined;

  const [{ rows, total, pageSize, page }, counts] = await Promise.all([
    listCoaches({
      q: sp.q, status, page: sp.page ? Number(sp.page) : 1,
      from: sp.from ? Number(sp.from) : undefined,
      to: sp.to ? Number(sp.to) : undefined,
    }),
    coachStatusCounts(),
  ]);
  const pages = Math.max(1, Math.ceil(total / pageSize));

  const qs = (o: Record<string, string | number | undefined>) => {
    const u = new URLSearchParams();
    Object.entries(o).forEach(([k, v]) => { if (v !== undefined && v !== "") u.set(k, String(v)); });
    const s = u.toString();
    return s ? `/head-coach?${s}` : "/head-coach";
  };
  const base = { q: sp.q, from: sp.from, to: sp.to };
  const href = (p: number) => qs({ ...base, status, page: p > 1 ? p : undefined });
  const tab = (label: string, value: string | undefined, n: number) => (
    <Link href={qs({ ...base, status: value })}
      className={`border-b-2 px-1 pb-2 text-sm ${status === value ? "border-[#254a39] font-medium text-neutral-900" : "border-transparent text-neutral-500"}`}>
      {label} <span className="ml-1 rounded bg-neutral-200 px-1.5 text-xs">{n}</span>
    </Link>
  );

  const tableRows = rows.map((r) => ({
    id: r.id,
    cells: [
      <Link key="n" href={`/head-coach/${r.id}`} className="block hover:underline">
        <span className="font-medium">{r.person?.full_name ?? "—"}</span>
        <br /><span className="text-xs text-neutral-400">Biography #{r.person?.id ?? "—"}</span>
      </Link>,
      <span key="nat" className="text-neutral-600">
        <NationalityTag nationality={r.person?.nationality} />
      </span>,
      <span key="c" className="text-neutral-600">{r.career_start_year ?? "?"}–{r.retired_year ?? "present"}</span>,
      <span key="l" className="block max-w-xs truncate text-neutral-600">{r.legacy_summary ?? "—"}</span>,
      <span key="s" className={`rounded-full px-2 py-0.5 text-xs ${r.is_published ? "bg-green-100 text-green-800" : "bg-neutral-200 text-neutral-700"}`}>
        {r.is_published ? "Published" : "Draft"}
      </span>,
      <span key="u" className="text-neutral-500">
        {fmtDate(r.updated_at)}{r.updated_by_name && <><br /><span className="text-xs">{r.updated_by_name}</span></>}
      </span>,
    ],
  }));

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Archive", href: "/" }, { label: "Head coaches" }]} />
      <PageHeader title="Head coaches" description="Preserve coaching careers and the stories that make them legendary."
        actions={<Link href="/head-coach/new" className={primaryBtn}>+ Add head coach</Link>} />

      <section className="rounded-xl border border-neutral-200 bg-[#fbfaf6]">
        <div className="flex gap-6 border-b border-neutral-200 px-4 pt-3">
          {tab("All records", undefined, counts.all)}
          {tab("Draft", "draft", counts.draft)}
          {tab("Published", "published", counts.published)}
        </div>

        <form method="get" className="flex flex-wrap gap-2 border-b border-neutral-200 p-4">
          {status && <input type="hidden" name="status" value={status} />}
          <input name="q" defaultValue={sp.q} placeholder="Search by coach name…" className={`${inputCls} w-auto! min-w-56 flex-1`} />
          <input name="from" defaultValue={sp.from} inputMode="numeric" placeholder="Career from" className={`${inputCls} w-32!`} />
          <input name="to" defaultValue={sp.to} inputMode="numeric" placeholder="Retired by" className={`${inputCls} w-32!`} />
          <button className={ghostBtn}>Apply</button>
          {(sp.q || sp.from || sp.to) && <Link href={qs({ status })} className="px-2 py-2 text-sm text-neutral-500 underline">Clear</Link>}
        </form>

        <RecordTable
          basePath="/head-coach" noun="head coach"
          headers={["Coach / Biography", "Nationality", "Career", "Legacy summary", "Status", "Updated"]}
          rows={tableRows}
          deleteAction={deleteCoaches}
          emptyTitle="No head coaches yet"
          emptyText="Click Add head coach to create the first record."
        />
        <Pager total={total} page={page} pages={pages} href={href} />
      </section>
    </div>
  );
}