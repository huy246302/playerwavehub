// app/players/page.tsx
import { listPlayers, listAvailablePeople } from "@/lib/db/players";
import PlayerForm from "@/components/players/PlayerForm";

export default async function PlayersPage({
  searchParams,
}: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams; // Next 15+: searchParams is a Promise
  const [{ rows, total }, people] = await Promise.all([
    listPlayers({
      q: sp.q,
      status: sp.status as "draft" | "published" | undefined,
      from: sp.from ? Number(sp.from) : undefined,
      to: sp.to ? Number(sp.to) : undefined,
      page: sp.page ? Number(sp.page) : 1,
    }),
    listAvailablePeople(),
  ]);

  return (
    <>
      {/* header, tabs, filter bar: plain <form method="get"> or links that set searchParams */}
      <table>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.person?.full_name}</td>
              <td>{r.career_start_year}–{r.retired_year ?? "…"}</td>
              <td>{r.height_cm ?? "—"}</td>
              <td>{r.is_published ? "Published" : "Draft"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p>{total} records</p>
      <PlayerForm people={people} />
    </>
  );
}