"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { inputCls } from "@/components/ui/kit";

const mask = (raw: string) => {
  const d = raw.replace(/\D/g, "").slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
};

// "dd/mm/yyyy" -> "yyyy-mm-dd", or "" when incomplete or not a real date
const toIso = (text: string) => {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text);
  if (!m) return "";
  const [, d, mo, y] = m;
  const dt = new Date(Date.UTC(+y, +mo - 1, +d));
  const real =
    dt.getUTCFullYear() === +y && dt.getUTCMonth() === +mo - 1 && dt.getUTCDate() === +d;
  return real && +y >= 1800 && +y <= 2100 ? `${y}-${mo}-${d}` : "";
};

const toDisplay = (iso?: string | null) => {
  const m = iso ? /^(\d{4})-(\d{2})-(\d{2})/.exec(iso) : null;
  return m ? `${m[3]}/${m[2]}/${m[1]}` : "";
};

export default function DateInput({
  name, defaultValue, className, required,
}: {
  name: string;
  defaultValue?: string | null;
  className?: string;
  required?: boolean;
}) {
  const [text, setText] = useState(() => toDisplay(defaultValue));
  const iso = useMemo(() => toIso(text), [text]);
  const textRef = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<HTMLInputElement>(null);

  // block form submit while the typed text is not a real date
  useEffect(() => {
    textRef.current?.setCustomValidity(
      text && !iso ? "Enter a valid date as dd/mm/yyyy" : ""
    );
  }, [text, iso]);

  return (
    <div className="relative">
      <input
        ref={textRef}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder="dd/mm/yyyy"
        required={required}
        value={text}
        onChange={(e) => setText(mask(e.target.value))}
        className={`${className ?? inputCls} pr-9`}
      />
      <input type="hidden" name={name} value={iso} />

      {/* native picker, only used to pick a day from a calendar */}
      <input
        ref={pickerRef}
        type="date"
        tabIndex={-1}
        aria-hidden
        value={iso}
        onChange={(e) => setText(toDisplay(e.target.value))}
        className="pointer-events-none absolute bottom-0 right-2 h-0 w-0 opacity-0"
      />
      <button
        type="button"
        aria-label="Open calendar"
        onClick={() => {
          try { pickerRef.current?.showPicker(); } catch { /* needs a user click */ }
        }}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
          strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <rect x="4" y="5" width="16" height="15" rx="2" />
          <path d="M4 10h16M8 3v4M16 3v4" />
        </svg>
      </button>
    </div>
  );
}