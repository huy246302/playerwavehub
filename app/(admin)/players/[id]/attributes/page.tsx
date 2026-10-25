import { notFound } from "next/navigation";
import { getPlayer } from "@/lib/db/players";
import { getPlayerAttributes } from "@/lib/db/player-attributes";
import { listPlayerPositions } from "@/lib/db/player-positions";
import { getPlayerFeet } from "@/lib/db/player-feet";
import AttributesForm from "@/components/players/AttributesForm";
import PositionsFeetCard from "@/components/players/PositionsFeetCard";
import { DetailTabs } from "@/components/ui/DetailTabs";
import { Breadcrumbs, PageHeader } from "@/components/ui/kit";

const TABS = [
  { key: "overview", label: "Overview" }, { key: "attributes", label: "Attributes" },
  { key: "hidden-attributes", label: "Hidden attributes" }, { key: "stints", label: "Career stints" },
  { key: "sources", label: "Sources" },
];

export default async function PlayerAttributesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const num = Number(id);
  if (!Number.isInteger(num)) notFound();
  const [player, attrs, positions, feet] = await Promise.all([
    getPlayer(num), getPlayerAttributes(num), listPlayerPositions(num), getPlayerFeet(num),
  ]);
  if (!player) notFound();
  const basePath = `/players/${player.id}`;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: "Archive", href: "/" }, { label: "Players", href: "/players" },
        { label: player.person?.full_name ?? `Player #${player.id}`, href: basePath }, { label: "Attributes" },
      ]} />
      <PageHeader title="Player attributes" description="Technical, mental, physical, goalkeeping ratings, positions and foot." />
      <DetailTabs basePath={basePath} current="attributes" tabs={TABS} />
      <AttributesForm playerId={player.id} attributes={attrs} backHref={basePath} />
      <PositionsFeetCard playerId={player.id} positions={positions} feet={feet} />
    </div>
  );
}