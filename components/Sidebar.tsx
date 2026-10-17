import Link from "next/link";

const sections = [
  "Players",
  "Head Coaches",
  "Clubs",
  "National Teams",
  "Countries",
  "Sources",
];

export function Sidebar() {
  return (
    <aside className="w-full shrink-0 border-b border-neutral-200 bg-white px-5 py-5 md:min-h-screen md:w-60 md:border-b-0 md:border-r md:px-6 md:py-8">
      <Link href="/" className="mb-6 block text-base font-semibold text-neutral-950">
        Football Legends Archive
      </Link>

      <nav aria-label="Main navigation" className="flex gap-1 overflow-x-auto md:flex-col">
        <Link
          href="/"
          aria-current="page"
          className="shrink-0 rounded-md bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-900"
        >
          Overview
        </Link>
        {sections.map((section) => (
          <span
            key={section}
            aria-disabled="true"
            title="This page will be added next"
            className="shrink-0 rounded-md px-3 py-2 text-sm text-neutral-600"
          >
            {section}
          </span>
        ))}
      </nav>
    </aside>
  );
}