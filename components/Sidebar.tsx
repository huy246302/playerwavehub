import Link from "next/link";
import { ArchiveIcon } from "./ArchiveIcon";
import SidebarNav from "./SidebarNav";
import { getCounts } from "@/lib/db/counts";

export async function Sidebar() {
  const counts = await getCounts();

  return (
    <aside className="sb">
      <Link href="/" className="sb-brand">
        <span className="sb-mark">F</span>
        <span>
          <strong>Football Legends</strong>
          <small>ARCHIVE</small>
        </span>
      </Link>

      <SidebarNav counts={counts} />

      <div className="sb-spacer" />
      <section className="sb-note">
        <ArchiveIcon name="book" />
        <h2>The game remembered.<br />One story at a time.</h2>
        <p>A home for football&apos;s biographies, places and history.</p>
      </section>
    </aside>
  );
}