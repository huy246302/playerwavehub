import Link from "next/link";

export function DetailTabs({
  basePath, current, tabs,
}: { basePath: string; current: string; tabs: { key: string; label: string }[] }) {
  return (
    <div className="flex gap-6 border-b border-neutral-200">
      {tabs.map((t) => {
        const href = t.key === "overview" ? basePath : `${basePath}/${t.key}`;
        const active = current === t.key;
        return (
          <Link key={t.key} href={href}
            className={`border-b-2 px-1 pb-2 text-sm ${active ? "border-[#254a39] font-medium text-neutral-900" : "border-transparent text-neutral-500"}`}>
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}