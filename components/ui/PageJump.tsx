"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

// "Go to page [ 5 ] of 10": type a page number and press Enter (or Go) to jump straight there.
// Any number outside the range is moved to the nearest page (0 -> 1, 99 -> the last page).
export default function PageJump({
  pages, page, path, params,
}: {
  pages: number;
  page: number;
  path: string;                       // e.g. /national-teams
  params: Record<string, string>;    // the current search / sort / filters, without "page"
}) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [pending, start] = useTransition();

  const go = () => {
    if (!value) return;
    const n = Math.min(pages, Math.max(1, parseInt(value, 10) || 1));
    setValue("");
    if (n === page) return;
    const u = new URLSearchParams(params);
    if (n > 1) u.set("page", String(n)); else u.delete("page");
    const qs = u.toString();
    start(() => router.push(qs ? `${path}?${qs}` : path));
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); go(); }} aria-busy={pending}
      className="flex items-center gap-2 text-sm text-neutral-500">
      <label htmlFor="page-jump">Go to page</label>
      <input id="page-jump" type="text" inputMode="numeric" autoComplete="off" value={value}
        placeholder={String(page)} aria-describedby="page-jump-total"
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, "").slice(0, String(pages).length);
          setValue(digits !== "" && Number(digits) > pages ? String(pages) : digits);
        }}
        className="h-8 w-14 rounded-md border border-neutral-300 bg-white px-2 text-center text-neutral-800 focus:border-[#254a39] focus:outline-none focus:ring-2 focus:ring-[#254a39]/20" />
      <span id="page-jump-total">of {pages}</span>
      <button type="submit" disabled={!value || pending}
        className="h-8 rounded-md border border-neutral-300 bg-white px-3 font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-40">
        Go
      </button>
    </form>
  );
}
