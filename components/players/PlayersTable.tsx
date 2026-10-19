"use client";
import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { deletePlayers } from "@/lib/actions/players";
import type { PlayerRow } from "@/lib/db/players";

const btn =
  "inline-flex items-center rounded-md border px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-40";

export default function PlayersTable({ rows }: { rows: PlayerRow[] }) {
  const router = useRouter();
  const sp = useSearchParams();
  const [selected, setSelected] = useState<number[]>([]);
  const [pending, start] = useTransition();

  const one = selected.length === 1 ? selected[0] : null;
  const toggle = (id: number) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const allOn = rows.length > 0 && selected.length === rows.length;

  const go = (extra: Record<string, string>) => {
    const p = new URLSearchParams(sp.toString());
    p.delete("id"); p.delete("edit");
    Object.entries(extra).forEach(([k, v]) => p.set(k, v));
    router.push(`/players?${p.toString()}`);
  };

  const remove = () => {
    if (!confirm(`Delete ${selected.length} player record(s)? This also removes their attributes, positions and stints.`)) return;
    start(async () => {
      await deletePlayers(selected);
      setSelected([]);
      router.refresh();
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-2.5 text-sm">
        <span className="text-neutral-500">{selected.length} selected</span>
        <div className="flex gap-2">
          <button className={btn} disabled={one === null} onClick={() => one && go({ id: String(one) })}>
            View details
          </button>
          <button className={btn} disabled={one === null} onClick={() => one && go({ id: String(one), edit: "1" })}>
            Edit
          </button>
          <button className={`${btn} border-red-200 text-red-700`} disabled={!selected.length || pending} onClick={remove}>
            {pending ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>

      <table className="w-full text-sm">
        <thead className="bg-neutral-100 text-left text-xs uppercase tracking-wide text-neutral-500">
          <tr>
            <th className="w-10 px-4 py-2">
              <input type="checkbox" checked={allOn}
                onChange={() => setSelected(allOn ? [] : rows.map((r) => r.id))} />
            </th>
            <th className="px-2 py-2">Player / Person</th>
            <th className="px-2 py-2">Career</th>
            <th className="px-2 py-2">Height</th>
            <th className="px-2 py-2">Legacy summary</th>
            <th className="px-2 py-2">Status</th>
            <th className="px-2 py-2">Updated</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-14 text-center text-neutral-500">
                <div className="font-serif text-lg text-neutral-900">No players yet</div>
                <p className="mt-1">Click Add player to create the first record.</p>
              </td>
            </tr>
          )}
          {rows.map((r) => (
            <tr key={r.id} className={`border-t border-neutral-200 ${selected.includes(r.id) ? "bg-[#e8efe9]" : ""}`}>
              <td className="px-4 py-2.5">
                <input type="checkbox" checked={selected.includes(r.id)} onChange={() => toggle(r.id)} />
              </td>
              <td className="px-2 py-2.5 font-medium">{r.person?.full_name ?? "—"}</td>
              <td className="px-2 py-2.5">{r.career_start_year ?? "?"}–{r.retired_year ?? "…"}</td>
              <td className="px-2 py-2.5">{r.height_cm ? `${r.height_cm} cm` : "—"}</td>
              <td className="max-w-xs truncate px-2 py-2.5 text-neutral-600">{r.legacy_summary ?? "—"}</td>
              <td className="px-2 py-2.5">
                <span className={`rounded-full px-2 py-0.5 text-xs ${r.is_published ? "bg-green-100 text-green-800" : "bg-neutral-200 text-neutral-700"}`}>
                  {r.is_published ? "Published" : "Draft"}
                </span>
              </td>
              <td className="px-2 py-2.5 text-neutral-500">{new Date(r.updated_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}