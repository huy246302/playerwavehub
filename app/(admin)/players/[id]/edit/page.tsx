import { notFound } from "next/navigation";
import { getPlayer } from "@/lib/db/players";
import PlayerForm from "@/components/players/PlayerForm";
import { Breadcrumbs, PageHeader } from "@/components/ui/kit";

export default async function EditPlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const num = Number(id);
  if (!Number.isInteger(num)) notFound();
  const player = await getPlayer(num);
  if (!player) notFound();

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: "Archive", href: "/" }, { label: "Players", href: "/players" },
        { label: player.person?.full_name ?? `Player #${player.id}`, href: `/players/${player.id}` }, { label: "Edit" },
      ]} />
      <PageHeader title={`Edit ${player.person?.full_name ?? "player"}`} />
      <PlayerForm player={player} biographies={[]} />
    </div>
  );
}