"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArchiveIcon, type IconName } from "./ArchiveIcon";

type Item = { label: string; href: string; icon: IconName; countKey: string };

const BIOGRAPHIES: Item = { label: "Biographies", href: "/biographies", icon: "people", countKey: "biographies" };
const SUB: Item[] = [
  { label: "Players", href: "/players", icon: "player", countKey: "players" },
  { label: "Head coaches", href: "/head-coach", icon: "coach", countKey: "coaches" },
];
const REST: Item[] = [
  { label: "Clubs", href: "/clubs", icon: "club", countKey: "clubs" },
  { label: "National teams", href: "/national-teams", icon: "team", countKey: "national_teams" },
  { label: "Countries", href: "/countries", icon: "country", countKey: "countries" },
  { label: "Sources", href: "/sources", icon: "source", countKey: "sources" },
];

export default function SidebarNav({ counts }: { counts: Record<string, number> }) {
  const pathname = usePathname();
  const [manual, setManual] = useState<boolean | null>(null); // null = default (open)
  const open = manual ?? true;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");
  const childActive = SUB.some((i) => isActive(i.href));

  const renderLink = (item: Item, extra = "") => (
    <Link
      key={item.href}
      href={item.href}
      className={`sb-link ${extra} ${isActive(item.href) ? "active" : ""}`}
      aria-current={isActive(item.href) ? "page" : undefined}
    >
      <ArchiveIcon name={item.icon} />
      <span className="sb-text">{item.label}</span>
      <span className="sb-count">{counts[item.countKey] ?? 0}</span>
    </Link>
  );

  return (
    <nav aria-label="Archive navigation" className="sb-nav">
      <Link
        href="/"
        className={`sb-link ${isActive("/") ? "active" : ""}`}
        aria-current={isActive("/") ? "page" : undefined}
      >
        <ArchiveIcon name="overview" />
        <span className="sb-text">Overview</span>
      </Link>

      <p className="sb-label">COLLECTION</p>

      <div className="sb-group">
        <div className="sb-grouprow">
          {renderLink(BIOGRAPHIES, "has-toggle")}
          <button
            type="button"
            className={`sb-toggle ${open ? "open" : ""} ${childActive && !open ? "dot" : ""}`}
            aria-expanded={open}
            aria-controls="sb-bio-sub"
            aria-label={open ? "Collapse Players and Head coaches" : "Expand Players and Head coaches"}
            onClick={() => setManual(!open)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>

        <div id="sb-bio-sub" className={`sb-sub ${open ? "open" : ""}`}>
          <div className="sb-sub-inner">
            {SUB.map((item) => renderLink(item, "sb-sub-link"))}
          </div>
        </div>
      </div>

      {REST.map((item) => renderLink(item))}
    </nav>
  );
}