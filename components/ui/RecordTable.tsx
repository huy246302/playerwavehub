"use client";
import { useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { DeleteResult } from "@/lib/form-state";

type Row = { id: number; cells: ReactNode[] };

const btn =
  "inline-flex items-center rounded-md border px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-40";

export default function RecordTable({
  basePath, noun, headers, rows, deleteAction, emptyTitle, emptyText,
}: {
  basePath: string;
  noun: string;
  headers: string[];
  rows: Row[];
  deleteAction: (ids: number[]) => Promise<DeleteResult>;
  emptyTitle: string;
  emptyText: string;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<number[]>([]);
  const [pending, start] = useTransition();

  const valid = selected.filter((id) => rows.some((r) => r.id === id));
  const one = valid.length === 1 ? valid[0] : null;
  const allOn = rows.length > 0 && valid.length === rows.length;
  const toggle = (id: number) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const remove = () => {
    if (!confirm(`Delete ${valid.length} ${noun}${valid.length > 1 ? "s" : ""}? This cannot be undone.`)) return;
    start(async () => {
      const res = await deleteAction(valid);
      if (!res.ok) {
        alert(res.message ?? "Could not delete.");
        return;
      }
      setSelected([]);
      router.refresh();
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-2.5 text-sm">
        <span className="text-neutral-500">
          {valid.length} selected
          {valid.length === 0 && <span className="ml-3 text-xs text-neutral-400">Select a record to manage</span>}
        </span>
        <div className="flex gap-2">
          <button className={btn} disabled={one === null} onClick={() => one && router.push(`${basePath}/${one}`)}>
            View details
          </button>
          <button className={btn} disabled={one === null} onClick={() => one && router.push(`${basePath}/${one}/edit`)}>
            Edit
          </button>
          <button className={`${btn} border-red-200 text-red-700`} disabled={!valid.length || pending} onClick={remove}>
            {pending ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>

      <table className="w-full text-sm">
        <thead className="bg-neutral-100 text-left text-xs uppercase tracking-wide text-neutral-500">
          <tr>
            <th className="w-10 px-4 py-2">
              <input type="checkbox" aria-label="Select all" checked={allOn}
                onChange={() => setSelected(allOn ? [] : rows.map((r) => r.id))} />
            </th>
            {headers.map((h) => <th key={h} className="px-2 py-2">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={headers.length + 1} className="px-4 py-14 text-center text-neutral-500">
                <div className="font-serif text-lg text-neutral-900">{emptyTitle}</div>
                <p className="mt-1">{emptyText}</p>
              </td>
            </tr>
          )}
          {rows.map((r) => (
            <tr key={r.id} onClick={() => toggle(r.id)}
              className={`cursor-pointer border-t border-neutral-200 ${valid.includes(r.id) ? "bg-[#e8efe9]" : ""}`}>
              <td className="px-4 py-2.5">
                <input type="checkbox" checked={valid.includes(r.id)}
                  onClick={(e) => e.stopPropagation()} onChange={() => toggle(r.id)} />
              </td>
              {r.cells.map((c, i) => <td key={i} className="px-2 py-2.5">{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}