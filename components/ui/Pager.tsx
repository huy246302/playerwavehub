import Link from "next/link";
import PageJump from "@/components/ui/PageJump";

type Item = number | "gap-start" | "gap-end";

// Which page buttons to show: 1 … 4 5 6 … 10  (every page when there are only a few)
export function pageItems(page: number, pages: number): Item[] {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
  const keep = new Set([1, pages, page - 1, page, page + 1]);
  if (page <= 3) [2, 3, 4].forEach((n) => keep.add(n));
  if (page >= pages - 2) [pages - 3, pages - 2, pages - 1].forEach((n) => keep.add(n));
  const nums = [...keep].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b);
  const out: Item[] = [];
  nums.forEach((n, i) => {
    const prev = nums[i - 1];
    if (prev !== undefined && n - prev === 2) out.push(prev + 1);        // a single missing page: show it
    else if (prev !== undefined && n - prev > 2) out.push(i === 1 && prev === 1 ? "gap-start" : "gap-end");
    out.push(n);
  });
  return out;
}

const btn = "inline-flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm";

export default function Pager({
  total, page, pages, href,
}: { total: number; page: number; pages: number; href: (p: number) => string }) {
  // the current search / sort / filters, so "go to page" keeps them
  const base = new URL(href(1), "http://x");
  const params = Object.fromEntries([...base.searchParams].filter(([k]) => k !== "page"));

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-neutral-200 px-4 py-3 text-sm text-neutral-500">
      <span>{total.toLocaleString("en")} record{total === 1 ? "" : "s"}</span>

      {pages > 1 && (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <span className="hidden sm:inline">Page {page} of {pages}</span>
          <nav aria-label="Pagination" className="flex items-center gap-1">
            {page > 1
              ? <Link href={href(page - 1)} aria-label="Previous page" className={`${btn} text-neutral-700 hover:bg-neutral-100`}>‹ <span className="ml-1 hidden sm:inline">Prev</span></Link>
              : <span aria-hidden="true" className={`${btn} text-neutral-300`}>‹ <span className="ml-1 hidden sm:inline">Prev</span></span>}

            {pageItems(page, pages).map((it) =>
              typeof it !== "number" ? (
                <span key={it} aria-hidden="true" className={`${btn} text-neutral-400`}>…</span>
              ) : it === page ? (
                <span key={it} aria-current="page" className={`${btn} bg-[#254a39] font-semibold text-white`}>{it}</span>
              ) : (
                <Link key={it} href={href(it)} aria-label={`Page ${it}`} className={`${btn} text-neutral-700 hover:bg-neutral-100`}>{it}</Link>
              )
            )}

            {page < pages
              ? <Link href={href(page + 1)} aria-label="Next page" className={`${btn} text-neutral-700 hover:bg-neutral-100`}><span className="mr-1 hidden sm:inline">Next</span> ›</Link>
              : <span aria-hidden="true" className={`${btn} text-neutral-300`}><span className="mr-1 hidden sm:inline">Next</span> ›</span>}
          </nav>
          {pages > 5 && <PageJump pages={pages} page={page} path={base.pathname} params={params} />}
        </div>
      )}
    </div>
  );
}
