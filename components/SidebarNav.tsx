"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArchiveIcon, type IconName } from "./ArchiveIcon";

type Item = { label: string; href: string; icon: IconName; countKey?: string; sub?: boolean };

const collection: Item[] = [
  { label: "Biographies", href: "/people", icon: "people", countKey: "people" },
  { label: "Players", href: "/players", icon: "player", countKey: "players", sub: true },
  { label: "Head coaches", href: "/head-coaches", icon: "coach", countKey: "coaches", sub: true },
  { label: "Clubs", href: "/clubs", icon: "club", countKey: "clubs" },
  { label: "National teams", href: "/national-teams", icon: "team", countKey: "national_teams" },
  { label: "Countries", href: "/countries", icon: "country", countKey: "countries" },
  { label: "Sources", href: "/sources", icon: "source", countKey: "sources" },
];

export default function SidebarNav({ counts }: { counts: Record<string, number> }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  const cls = (item: Item) =>
    ["sidebar-link", item.sub && "sub-link", isActive(item.href) && "active"]
      .filter(Boolean)
      .join(" ");

  return (
    <nav aria-label="Archive navigation" className="sidebar-nav">
      <Link
        href="/"
        className={cls({ label: "Overview", href: "/", icon: "overview" })}
        aria-current={pathname === "/" ? "page" : undefined}
      >
        <ArchiveIcon name="overview" />
        <span>Overview</span>
      </Link>

      <p className="sidebar-label">COLLECTION</p>

      {collection.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cls(item)}
          aria-current={isActive(item.href) ? "page" : undefined}
        >
          <ArchiveIcon name={item.icon} />
          <span>{item.label}</span>
          <small>{item.countKey ? counts[item.countKey] ?? 0 : ""}</small>
        </Link>
      ))}
    </nav>
  );
}