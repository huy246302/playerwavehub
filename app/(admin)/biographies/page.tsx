import Link from "next/link";
import { listBiographies } from "@/lib/db/biographies";
import { deleteBiography } from "@/lib/actions/biographies";
import RecordTable from "@/components/ui/RecordTable";
import {
  Breadcrumbs, PageHeader, Pager, fmtDate, inputCls, ghostBtn, primaryBtn,
} from "@/components/ui/kit";

export const metadata = { title: "Biographies" };

type SP = Record<string, string | undefined>;

export default async function BiographiesPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const role = sp.role === "player" || sp.role === "coach" ? sp.role : undefined;
  const { rows, total, pageSize, page } = await listBiographies({
    q: sp.q, role, page: sp.page ? Number(sp.page) : 1,
  });
  const pages = Math.max(1, Math.ceil(total / pageSize));

  const href = (p: number) => {
    const u = new URLSearchParams();
    if (sp.q) u.set("q", sp.q);
    if (role) u.set("role", role);
    if (p > 1) u.set("page", String(p));
    const s = u.toString();
    return s ? `/biographies?${s}` : "/biographies";
  };

  const tableRows = rows.map((b) => ({
    id: b.id,
    cells: [
      <Link key="n" href={`/biographies/${b.id}`} className="font-medium hover:underline">
        {b.full_name}
        {b.display_name && b.display_name !== b.full_name && (
          <span className="ml-2 text-xs font-normal text-neutral-500">{b.display_name}</span>
        )}
      </Link>,
      <span key="r" className="flex gap-1.5">
        {b.player && <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800">Player</span>}
        {b.coach && <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs text-sky-800">Head coach</span>}
        {!b.player && !b.coach && <span className="text-xs text-neutral-400">No role yet</span>}
      </span>,
      <span key="b" className="text-neutral-600">{fmtDate(b.date_of_birth)}</span>,
      <span key="p" className="text-neutral-600">{b.birthplace ?? "—"}</span>,
      <span key="d" className="text-neutral-500">{fmtDate(b.created_at)}</span>,
    ],
  }));

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Archive", href: "/" }, { label: "Biographies" }]} />
      <PageHeader
        title="Biographies"
        description="Shared life details for everyone in the archive: names, dates, places and stories."
        actions={<Link href="/biographies/new" className={primaryBtn}>+ Add biography</Link>}
      />

      <section className="rounded-xl border border-neutral-200 bg-[#fbfaf6]">
        <form method="get" className="flex flex-wrap gap-2 border-b border-neutral-200 p-4">
          <input name="q" defaultValue={sp.q} placeholder="Search by name…"
            className={`${inputCls} min-w-56 flex-1`} />
          <select name="role" defaultValue={role ?? ""} className={`${inputCls} w-auto`}>
            <option value="">Role: All</option>
            <option value="player">Players</option>
            <option value="coach">Head coaches</option>
          </select>
          <button className={ghostBtn}>Apply</button>
          {(sp.q || role) && (
            <Link href="/biographies" className="px-2 py-2 text-sm text-neutral-500 underline">Clear</Link>
          )}
        </form>

        <RecordTable
          basePath="/biographies"
          noun="biography"
          headers={["Name", "Role", "Born", "Birthplace", "Added"]}
          rows={tableRows}
          deleteAction={deleteBiography}
          emptyTitle="No biographies yet"
          emptyText="Add the first life story, then link it to a player or head coach record."
        />
        <Pager total={total} page={page} pages={pages} href={href} />
      </section>
    </div>
  );
}