"use client";
import { useActionState } from "react";
import Link from "next/link";
import { createSource, updateSource } from "@/lib/actions/sources";
import type { FormState } from "@/lib/form-state";
import { Card, DefList, Field, fmtDateTime, ghostBtn, inputCls, primaryBtn } from "@/components/ui/kit";
import DateInput from "@/components/ui/DateInput";

type Source = {
  id: number; title: string; url: string | null; publisher: string | null; author: string | null;
  published_on: string | null; accessed_on: string | null; notes: string | null; created_at: string;
};

export default function SourceForm({ source }: { source?: Source | null }) {
  const editing = !!source;
  const [state, action, pending] = useActionState<FormState, FormData>(
    editing ? updateSource.bind(null, source!.id) : createSource,
    { ok: false }
  );
  const err = (k: string) => state.errors?.[k]?.[0];
  const val = (k: string, fallback?: string | null) => state.values?.[k] ?? fallback ?? "";

  return (
    <form action={action} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card title="Source" note="Required">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="Title" required error={err("title")}>
                  <input name="title" placeholder="Article, book or page title" className={inputCls} defaultValue={val("title", source?.title)} />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="URL" error={err("url")}>
                  <input name="url" placeholder="https://…" className={inputCls} defaultValue={val("url", source?.url)} />
                </Field>
              </div>
              <Field label="Publisher" error={err("publisher")}>
                <input name="publisher" className={inputCls} defaultValue={val("publisher", source?.publisher)} />
              </Field>
              <Field label="Author" error={err("author")}>
                <input name="author" className={inputCls} defaultValue={val("author", source?.author)} />
              </Field>
              <Field label="Published on" error={err("published_on")}>
                <DateInput name="published_on" defaultValue={val("published_on", source?.published_on)} />
              </Field>
              <Field label="Accessed on" error={err("accessed_on")} hint="When you last verified this source.">
                <DateInput name="accessed_on" defaultValue={val("accessed_on", source?.accessed_on)} />
              </Field>
            </div>
          </Card>

          <Card title="Notes" note="Optional">
            <textarea name="notes" rows={4} placeholder="What this source supports, quotes to keep, access notes…"
              className={inputCls} defaultValue={val("notes", source?.notes)} />
            {err("notes") && <p className="mt-1 text-xs text-red-600">{err("notes")}</p>}
          </Card>
        </div>

        <aside className="space-y-6">
          <Card title="Before you save">
            <ul className="list-disc space-y-1.5 pl-4 text-sm text-neutral-600">
              <li>Only the title is required.</li>
              <li>Link this source to a biography or club from its own page.</li>
            </ul>
          </Card>
          <Card title="System information" note="Read only">
            <DefList rows={
              editing
                ? [["Record ID", source!.id], ["Created", fmtDateTime(source!.created_at)]]
                : [["Record ID", "Generated on save"]]
            } />
          </Card>
        </aside>
      </div>

      <div className="flex items-center justify-between border-t border-neutral-200 pt-4 text-xs text-neutral-500">
        <span>* Required field</span>
        <div className="flex items-center gap-2">
          {state.message && <span className="text-sm text-red-600">{state.message}</span>}
          <Link href={editing ? `/sources/${source!.id}` : "/sources"} className={ghostBtn}>Cancel</Link>
          <button disabled={pending} className={primaryBtn}>{pending ? "Saving…" : editing ? "Save changes" : "Save source"}</button>
        </div>
      </div>
    </form>
  );
}