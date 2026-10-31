import { notFound } from "next/navigation";
import { getPlayer } from "@/lib/db/players";
import PlayerForm from "@/components/players/PlayerForm";
import { Breadcrumbs, PageHeader } from "@/components/ui/kit";
import { displayName } from "@/lib/names";

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
        { label: displayName(player.person, `Player #${player.id}`), href: `/players/${player.id}` }, { label: "Edit" },
      ]} />
      <PageHeader title={`Edit ${displayName(player.person, "player")}`} />
      <PlayerForm player={player} biographies={[]} />
    </div>
  );
}