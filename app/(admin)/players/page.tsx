import Link from "next/link";
import { listPlayers, listAvailableBiographies, getPlayer, statusCounts } from "@/lib/db/players";
import PlayersTable from "@/components/players/PlayersTable";
import PlayerForm from "@/components/players/PlayerForm";

type SP = Record<string, string | undefined>;

const url = (o: Record<string, string | number | undefined>) => {
  const p = new URLSearchParams();
  Object.entries(o).forEach(([k, v]) => { if (v !== undefined && v !== "") p.set(k, String(v)); });
  const s = p.toString();
  return s ? `/players?${s}` : "/players";
};

const fmt = (d?: string | null) => (d ? new Date(d).toLocaleString() : "—");

export default async function PlayersPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const status = sp.status === "draft" || sp.status === "published" ? sp.status : undefined;
  const page = sp.page ? Number(sp.page) : 1;
  const selectedId = sp.id ? Number(sp.id) : null;
  const editing = sp.edit === "1" && selectedId !== null;

  const [{ rows, total, pageSize }, counts, biographies, selected] = await Promise.all([
    listPlayers({
      q: sp.q, status, page,
      from: sp.from ? Number(sp.from) : undefined,
      to: sp.to ? Number(sp.to) : undefined,
    }),
    statusCounts(),
    listAvailableBiographies(),
    selectedId ? getPlayer(selectedId) : Promise.resolve(null),
  ]);

  const base = { q: sp.q, from: sp.from, to: sp.to };
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const tab = (label: string, value: string | undefined, n: number) => (
    <Link href={url({ ...base, status: value })}
      className={`border-b-2 px-1 pb-2 text-sm ${status === value ? "border-[#254a39] font-medium text-neutral-900" : "border-transparent text-neutral-500"}`}>
      {label} <span className="ml-1 rounded bg-neutral-200 px-1.5 text-xs">{n}</span>
    </Link>
  );

  return (
    <div className="space-y-8">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-4xl text-neutral-900">Players</h1>
          <p className="mt-1 text-sm text-neutral-500">Preserve playing careers and the stories that make them legendary.</p>
        </div>
        <Link href="/players#new" className="rounded-md bg-[#47d392] px-4 py-2 text-sm font-medium text-white">+ Add player</Link>
      </header>

      <section className="rounded-xl border border-neutral-200 bg-[#fbfaf6]">
        <div className="flex gap-6 border-b border-neutral-200 px-4 pt-3">
          {tab("All records", undefined, counts.all)}
          {tab("Draft", "draft", counts.draft)}
          {tab("Published", "published", counts.published)}
        </div>

        <form method="get" className="flex flex-wrap gap-2 border-b border-neutral-200 p-4">
          {status && <input type="hidden" name="status" value={status} />}
          <input name="q" defaultValue={sp.q} placeholder="Search linked person…"
            className="min-w-56 flex-1 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm" />
          <input name="from" defaultValue={sp.from} inputMode="numeric" placeholder="Career from"
            className="w-32 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm" />
          <input name="to" defaultValue={sp.to} inputMode="numeric" placeholder="Retired by"
            className="w-32 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm" />
          <button className="rounded-md border border-neutral-300 px-4 py-2 text-sm">Apply</button>
          {(sp.q || sp.from || sp.to) && <Link href={url({ status })} className="px-2 py-2 text-sm text-neutral-500 underline">Clear</Link>}
        </form>

        <PlayersTable rows={rows} />

        <div className="flex items-center justify-between border-t border-neutral-200 px-4 py-3 text-sm text-neutral-500">
          <span>{total} records</span>
          <div className="flex items-center gap-3">
            <span>Page {page} of {pages}</span>
            {page > 1 && <Link href={url({ ...base, status, page: page - 1 })}>‹ Prev</Link>}
            {page < pages && <Link href={url({ ...base, status, page: page + 1 })}>Next ›</Link>}
          </div>
        </div>
      </section>

      <section id="new" className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <h2 className="mb-3 font-serif text-2xl text-neutral-900">{editing ? "Edit player" : "New player"}</h2>
          <div className="rounded-xl border border-neutral-200 bg-[#fbfaf6] p-5">
            <PlayerForm biographies={biographies} player={editing ? selected : null} />
          </div>
        </div>

        <div className="space-y-4 pt-10">
          <div className="rounded-xl border border-neutral-200 bg-[#fbfaf6] p-4 text-sm">
            <div className="font-medium">Attributes</div>
            <p className="mt-2 text-neutral-500">Technical, mental, physical and hidden attributes will be edited here.</p>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-[#fbfaf6] p-4 text-sm">
            <div className="mb-3 font-medium">Record details</div>
            {selected ? (
              <dl className="space-y-1.5 text-neutral-600">
                <div className="flex justify-between"><dt>Record ID</dt><dd>{selected.id}</dd></div>
                <div className="flex justify-between"><dt>Linked person ID</dt><dd>{selected.biography_id}</dd></div>
                <div className="flex justify-between"><dt>Created at</dt><dd>{fmt(selected.created_at)}</dd></div>
                <div className="flex justify-between"><dt>Created by</dt><dd>{selected.created_by_name ?? "—"}</dd></div>
                <div className="flex justify-between"><dt>Updated at</dt><dd>{fmt(selected.updated_at)}</dd></div>
                <div className="flex justify-between"><dt>Updated by</dt><dd>{selected.updated_by_name ?? "—"}</dd></div>
              </dl>
            ) : (
              <p className="text-neutral-500">Select a saved record to view its identity and history.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}