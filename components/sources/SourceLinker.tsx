"use client";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { FormState, DeleteResult } from "@/lib/form-state";
import { Card, ghostBtn, inputCls, primaryBtn } from "@/components/ui/kit";

type LinkedSource = { source_id: number; note: string | null; source: { id: number; title: string; url: string | null; publisher: string | null } | null };

export default function SourceLinker({
  title, linked, options, linkAction, unlinkAction,
}: {
  title: string;
  linked: LinkedSource[];
  options: { id: number; title: string }[];
  linkAction: (_: FormState, fd: FormData) => Promise<FormState>;
  unlinkAction: (sourceId: number) => Promise<DeleteResult>;
}) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [state, action, pending] = useActionState<FormState, FormData>(linkAction, { ok: false });
  const err = (k: string) => state.errors?.[k]?.[0];
  const available = options.filter((o) => !linked.some((l) => l.source_id === o.id));

  useEffect(() => { if (state.ok) { setAdding(false); router.refresh(); } }, [state, router]);

  const unlink = async (sourceId: number) => {
    if (!confirm("Remove this source link?")) return;
    setBusyId(sourceId);
    const res = await unlinkAction(sourceId);
    setBusyId(null);
    if (!res.ok) { alert(res.message ?? "Could not remove."); return; }
    router.refresh();
  };

  return (
    <Card title={title} note={`${linked.length} linked`}>
      {linked.length === 0 && <p className="mb-2 text-sm text-neutral-500">No sources linked yet.</p>}
      <div className="space-y-2">
        {linked.map((l) => (
          <div key={l.source_id} className="flex items-center justify-between rounded-md border border-neutral-200 px-3 py-2 text-sm">
            <span>
              <Link href={`/sources/${l.source_id}`} className="font-medium hover:underline">{l.source?.title ?? "—"}</Link>
              {l.source?.publisher && <span className="ml-2 text-neutral-500">{l.source.publisher}</span>}
              {l.note && <span className="ml-2 text-neutral-400">· {l.note}</span>}
            </span>
            <button type="button" disabled={busyId === l.source_id} className="text-xs text-red-700 underline disabled:opacity-50"
              onClick={() => unlink(l.source_id)}>
              {busyId === l.source_id ? "Removing…" : "Remove"}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-3">
        {adding ? (
          <form action={action} className="space-y-3 rounded-md border border-neutral-200 p-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-600">Source *</label>
              <select name="source_id" defaultValue="" className={inputCls}>
                <option value="">{available.length ? "Select a source…" : "No sources to add"}</option>
                {available.map((o) => <option key={o.id} value={o.id}>{o.title}</option>)}
              </select>
              {err("source_id") && <p className="mt-1 text-xs text-red-600">{err("source_id")}</p>}
              <Link href="/sources/new" target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-xs text-[#254a39] underline">
                + Add source
              </Link>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-neutral-600">Note</label>
              <input name="note" placeholder="What this source supports here" className={inputCls} />
            </div>
            <div className="flex items-center gap-2">
              {state.message && !state.ok && <span className="text-sm text-red-600">{state.message}</span>}
              <button disabled={pending} className={primaryBtn}>{pending ? "Linking…" : "Link source"}</button>
            </div>
          </form>
        ) : (
          <button type="button" onClick={() => setAdding(true)} className={ghostBtn}>+ Link a source</button>
        )}
      </div>
    </Card>
  );
}