const totals = [
  { label: "People", count: 0 },
  { label: "Players", count: 0 },
  { label: "Head coaches", count: 0 },
  { label: "Clubs", count: 0 },
  { label: "National teams", count: 0 },
  { label: "Countries", count: 0 },
  { label: "Sources", count: 0 },
];

const numberFormat = new Intl.NumberFormat("en");

export default function Home() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <header className="mb-12 max-w-2xl">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.14em] text-emerald-800">
          Football Legends Archive
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
          Welcome to your archive
        </h1>
        <p className="mt-4 text-base leading-7 text-neutral-600">
          A home for the stories and records of football&apos;s legendary players and head coaches.
        </p>
      </header>

      <section aria-labelledby="totals-heading">
        <div className="mb-5">
          <h2 id="totals-heading" className="text-lg font-semibold text-neutral-900">
            Archive totals
          </h2>
          <p className="mt-1 text-sm text-neutral-600">A count of each kind of record in your schema.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {totals.map(({ label, count }) => (
            <article key={label} className="rounded-lg border border-neutral-200 bg-white p-5">
              <h3 className="text-sm font-medium text-neutral-600">{label}</h3>
              <p className="mt-6 text-3xl font-semibold tabular-nums text-neutral-950">
                {numberFormat.format(count)}
              </p>
            </article>
          ))}
        </div>
      </section>

      <p className="mt-8 text-sm text-neutral-500">
        Counts are set to zero for the clean starting state and can be connected to Supabase next.
      </p>
    </main>
  );
}