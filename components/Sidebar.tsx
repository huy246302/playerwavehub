import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { ArchiveIcon } from "./ArchiveIcon";
import SidebarNav from "./SidebarNav";

async function getCounts() {
  const sb = createAdminClient();
  const tables = ["biographies", "players", "coaches", "clubs", "national_teams", "countries", "sources"];
  const results = await Promise.all(
    tables.map((t) => sb.from(t).select("*", { count: "exact", head: true }))
  );
  return Object.fromEntries(tables.map((t, i) => [t, results[i].count ?? 0]));
}

export async function Sidebar() {
  const counts = await getCounts();

  return (
    <aside className="sidebar">
      <Link href="/" className="archive-brand">
        <span className="brand-mark">F</span>
        <span>
          <strong>Football Legends</strong>
          <small>ARCHIVE</small>
        </span>
      </Link>

      <SidebarNav counts={counts} />

      <div className="sidebar-spacer" />
      <section className="sidebar-note">
        <ArchiveIcon name="book" />
        <h2>The game remembered.<br />One story at a time.</h2>
        <p>A home for football&apos;s biographies, places and history.</p>
      </section>
    </aside>
  );
}