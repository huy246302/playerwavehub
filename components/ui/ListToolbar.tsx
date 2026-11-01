"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export type FilterField =
  | { kind: "select"; name: string; label: string; options: { value: string; label: string }[] }
  | { kind: "number"; name: string; label: string; placeholder?: string }
  | { kind: "text"; name: string; label: string; placeholder?: string };

type Props = {
  basePath: string;
  searchPlaceholder: string;
  sortOptions: { value: string; label: string }[];
  defaultSort: string;
  fields?: FilterField[];
  total: number;
  /** other params that must survive a change, e.g. the Draft / Published tab */
  keep?: string[];
};

const ctl =
  "h-10 rounded-lg border border-neutral-300 bg-white text-sm text-neutral-800 focus:border-[#254a39] focus:outline-none focus:ring-2 focus:ring-[#254a39]/20";

const Icon = ({ d, className = "h-4 w-4" }: { d: string; className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
    className={className} aria-hidden="true"><path d={d} /></svg>
);
const SEARCH = "M21 21l-4.3-4.3M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z";
const FUNNEL = "M3 5h18l-7 8.5V19l-4 2v-7.5L3 5Z";
const SORT = "M7 4v16M7 20l-3-3M7 20l3-3M17 20V4M17 4l-3 3M17 4l3 3";
const CLOSE = "M6 6l12 12M18 6 6 18";

export default function ListToolbar({
  basePath, searchPlaceholder, sortOptions, defaultSort, fields = [], total, keep = [],
}: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const urlQ = params.get("q") ?? "";
  const sort = params.get("sort") ?? defaultSort;
  const valueOf = (name: string) => params.get(name) ?? "";

  // ---- navigation: always back to page 1 when something changes ----
  const go = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(changes)) {
      if (v === null || v === "") next.delete(k); else next.set(k, v);
    }
    next.delete("page");
    if (next.get("sort") === defaultSort) next.delete("sort");
    const qs = next.toString();
    startTransition(() => router.push(qs ? `${basePath}?${qs}` : basePath));
  };

  // ---- search: debounced, Enter applies at once ----
  const [term, setTerm] = useState(urlQ);
  const lastPushed = useRef(urlQ);
  useEffect(() => {
    if (urlQ !== lastPushed.current) { lastPushed.current = urlQ; setTerm(urlQ); }
  }, [urlQ]);
  useEffect(() => {
    if (term.trim() === lastPushed.current.trim()) return;
    const t = setTimeout(() => { lastPushed.current = term.trim(); go({ q: term.trim() }); }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term]);
  const searchNow = () => {
    if (term.trim() === lastPushed.current.trim()) return;
    lastPushed.current = term.trim(); go({ q: term.trim() });
  };

  // ---- filter panel ----
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const wrapRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const openPanel = () => {
    setDraft(Object.fromEntries(fields.map((f) => [f.name, valueOf(f.name)])));
    setOpen(true);
  };
  const closePanel = (returnFocus = false) => { setOpen(false); if (returnFocus) btnRef.current?.focus(); };

  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLElement>("input, select")?.focus();
    const onDown = (e: MouseEvent) => { if (!wrapRef.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closePanel(true); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  const apply = () => {
    go(Object.fromEntries(fields.map((f) => [f.name, (draft[f.name] ?? "").trim()])));
    closePanel(true);
  };

  // ---- active filters shown as removable chips ----
  const chips = [
    ...(urlQ ? [{ key: "q", label: "Search", text: urlQ }] : []),
    ...fields.flatMap((f) => {
      const v = valueOf(f.name);
      if (!v) return [];
      const text = f.kind === "select" ? f.options.find((o) => o.value === v)?.label ?? v : v;
      return [{ key: f.name, label: f.label, text }];
    }),
  ];
  const activeFilters = fields.filter((f) => valueOf(f.name)).length;
  const clearAll = () => {
    setTerm(""); lastPushed.current = "";
    go(Object.fromEntries(["q", ...fields.map((f) => f.name)].map((k) => [k, null])));
  };
  void keep; // tabs such as status are plain links and are kept by the page itself

  return (
    <div className="border-b border-neutral-200" aria-busy={pending}>
      <div className="flex flex-wrap items-center gap-2 p-4">
        <div className="relative min-w-56 flex-1">
          <Icon d={SEARCH} className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input type="search" value={term} aria-label={searchPlaceholder} placeholder={searchPlaceholder}
            onChange={(e) => setTerm(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); searchNow(); } }}
            className={`${ctl} w-full pl-9 pr-9 [&::-webkit-search-cancel-button]:hidden`} />
          {term && (
            <button type="button" aria-label="Clear search" onClick={() => { setTerm(""); lastPushed.current = ""; go({ q: null }); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-neutral-400 hover:text-neutral-700">
              <Icon d={CLOSE} className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <label className={`${ctl} flex items-center gap-2 px-3`}>
          <Icon d={SORT} className="h-4 w-4 text-neutral-500" />
          <span className="sr-only sm:not-sr-only text-neutral-500">Sort</span>
          <select aria-label="Sort by" value={sort} onChange={(e) => go({ sort: e.target.value })}
            className="bg-transparent py-1 pr-1 font-medium focus:outline-none">
            {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>

        {fields.length > 0 && (
          <div ref={wrapRef} className="relative">
            <button ref={btnRef} type="button" aria-expanded={open} aria-controls="list-filters"
              onClick={() => (open ? closePanel() : openPanel())}
              className={`${ctl} flex items-center gap-2 px-3 font-medium ${activeFilters ? "border-[#254a39] bg-[#e8efe9]" : ""}`}>
              <Icon d={FUNNEL} />
              Filters
              {activeFilters > 0 && (
                <span className="rounded-full bg-[#254a39] px-1.5 text-xs font-semibold text-white">{activeFilters}</span>
              )}
            </button>

            {open && (
              <div ref={panelRef} id="list-filters" role="dialog" aria-label="Filters"
                className="absolute right-0 z-30 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-xl border border-neutral-200 bg-white p-4 shadow-lg">
                <div className="space-y-3">
                  {fields.map((f) => (
                    <div key={f.name}>
                      <label htmlFor={`f-${f.name}`} className="mb-1 block text-xs font-medium text-neutral-600">{f.label}</label>
                      {f.kind === "select" ? (
                        <select id={`f-${f.name}`} className={`${ctl} w-full px-2`} value={draft[f.name] ?? ""}
                          onChange={(e) => setDraft({ ...draft, [f.name]: e.target.value })}>
                          <option value="">Any</option>
                          {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      ) : (
                        <input id={`f-${f.name}`} className={`${ctl} w-full px-3`} value={draft[f.name] ?? ""}
                          inputMode={f.kind === "number" ? "numeric" : undefined} placeholder={f.placeholder}
                          onChange={(e) => setDraft({ ...draft, [f.name]: e.target.value })}
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); apply(); } }} />
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <button type="button" className="text-sm text-neutral-500 underline"
                    onClick={() => setDraft(Object.fromEntries(fields.map((f) => [f.name, ""])))}>
                    Reset
                  </button>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => closePanel(true)}
                      className="h-9 rounded-lg border border-neutral-300 px-3 text-sm hover:bg-neutral-50">Cancel</button>
                    <button type="button" onClick={apply}
                      className="h-9 rounded-lg bg-[#254a39] px-4 text-sm font-semibold text-white hover:bg-[#1d3b2e]">Apply</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex min-h-9 flex-wrap items-center gap-2 px-4 pb-3 text-sm" aria-live="polite">
        <span className="text-neutral-500">{pending ? "Updating…" : `${total.toLocaleString("en")} result${total === 1 ? "" : "s"}`}</span>
        {chips.map((c) => (
          <span key={c.key} className="inline-flex items-center gap-1 rounded-full border border-neutral-300 bg-white py-0.5 pl-3 pr-1 text-xs text-neutral-700">
            <span className="text-neutral-500">{c.label}:</span> <strong className="max-w-40 truncate font-medium">{c.text}</strong>
            <button type="button" aria-label={`Remove ${c.label} filter`}
              onClick={() => { if (c.key === "q") { setTerm(""); lastPushed.current = ""; } go({ [c.key]: null }); }}
              className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700">
              <Icon d={CLOSE} className="h-3 w-3" />
            </button>
          </span>
        ))}
        {chips.length > 1 && (
          <button type="button" onClick={clearAll} className="text-xs text-neutral-500 underline">Clear all</button>
        )}
      </div>
    </div>
  );
}
