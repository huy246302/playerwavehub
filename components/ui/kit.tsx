import Link from "next/link";
import type { ReactNode } from "react";

export const inputCls =
  "w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none placeholder:text-neutral-400 focus:border-[#254a39] focus:ring-2 focus:ring-[#254a39]/15";
export const primaryBtn =
  "inline-flex items-center rounded-md bg-[#47d392] px-4 py-2 text-sm font-medium text-white hover:bg-[#1d3b2e] disabled:opacity-60";
export const ghostBtn =
  "inline-flex items-center rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50";

// fixed locale + UTC so server and browser print identical text
export const fmtDate = (d?: string | null) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }) : "—";
export const fmtDateTime = (d?: string | null) =>
  d
    ? new Date(d).toLocaleString("en-GB", {
        day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "UTC",
      }) + " UTC"
    : "—";

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-neutral-500">
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 && <span>/</span>}
          {it.href ? (
            <Link href={it.href} className="hover:underline">{it.label}</Link>
          ) : (
            <span className="text-neutral-900">{it.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function PageHeader({
  title, description, actions,
}: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <header className="flex items-start justify-between gap-4">
      <div>
        <h1 className="font-serif text-4xl text-neutral-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-neutral-500">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}

export function Card({
  title, note, children,
}: { title: string; note?: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-neutral-200 bg-[#fbfaf6]">
      <header className="flex items-center justify-between border-b border-neutral-200 px-5 py-3">
        <h2 className="font-serif text-lg text-neutral-900">{title}</h2>
        {note && <span className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">{note}</span>}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Field({
  label, required, hint, error, children,
}: { label: string; required?: boolean; hint?: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-neutral-600">
          {label}{required ? " *" : ""}
        </span>
        {children}
      </label>
      {error ? (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-neutral-400">{hint}</p>
      ) : null}
    </div>
  );
}

export function DefList({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className="space-y-2 text-sm">
      {rows.map(([k, v]) => (
        <div key={k} className="flex justify-between gap-4">
          <dt className="text-neutral-500">{k}</dt>
          <dd className="text-right text-neutral-900">{v ?? "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Thumb({ src, className }: { src?: string | null; className?: string }) {
  if (!src) return <span className={`inline-block bg-neutral-200 ${className ?? ""}`} />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" className={className} />;
}

export function Pager({
  total, page, pages, href,
}: { total: number; page: number; pages: number; href: (p: number) => string }) {
  return (
    <div className="flex items-center justify-between border-t border-neutral-200 px-4 py-3 text-sm text-neutral-500">
      <span>{total} records</span>
      <div className="flex items-center gap-3">
        <span>Page {page} of {pages}</span>
        {page > 1 && <Link href={href(page - 1)}>‹ Prev</Link>}
        {page < pages && <Link href={href(page + 1)}>Next ›</Link>}
      </div>
    </div>
  );
}