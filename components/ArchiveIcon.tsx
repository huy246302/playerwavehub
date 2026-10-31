export type IconName =
  | "overview" | "people" | "player" | "coach" | "club"
  | "team" | "country" | "source" | "book" | "federation";

export function ArchiveIcon({ name }: { name: IconName }) {
  const common = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };
  if (name === "overview") return <svg {...common}><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></svg>;
  if (name === "people") return <svg {...common}><circle cx="9" cy="8" r="3"/><path d="M3.5 19v-1.2A3.8 3.8 0 0 1 7.3 14h3.4a3.8 3.8 0 0 1 3.8 3.8V19M16 5.5a3 3 0 0 1 0 5.8M17 14h.7a3 3 0 0 1 3 3v2"/></svg>;
  if (name === "player") return <svg {...common}><path d="m8 4-4 2 2 5 2-1v10h8V10l2 1 2-5-4-2a4 4 0 0 1-8 0Z"/></svg>;
  if (name === "coach") return <svg {...common}><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M9 9h6M9 13h6M9 17h3"/></svg>;
  if (name === "club") return <svg {...common}><path d="m12 3 8 3v5c0 5-3.2 8-8 10-4.8-2-8-5-8-10V6l8-3Z"/></svg>;
  if (name === "federation") return <svg {...common}><path d="M3 10 12 4l9 6M5 10v8M9 10v8M15 10v8M19 10v8M3 20h18"/></svg>;
  if (name === "team") return <svg {...common}><path d="M5 21V4m0 1c5-3 9 3 14 0v10c-5 3-9-3-14 0"/></svg>;
  if (name === "country") return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>;
  if (name === "source") return <svg {...common}><path d="M4 5a2 2 0 0 1 2-2h14v17H6a2 2 0 0 1-2-2V5Z"/><path d="M4 17a2 2 0 0 1 2-2h14M8 7h8"/></svg>;
  return <svg {...common}><path d="M5 4h14v16H5z"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>;
}