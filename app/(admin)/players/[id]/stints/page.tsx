import { notFound } from "next/navigation";
import { getPlayer } from "@/lib/db/players";
import { listClubStints, listNationalStints } from "@/lib/db/player-stints";
import { listClubOptions } from "@/lib/db/clubs";
import { listNationalTeamOptions } from "@/lib/db/national-teams";
import ClubStintsCard from "@/components/players/stints/ClubStintsCard";
import NationalStintsCard from "@/components/players/stints/NationalStintsCard";
import { DetailTabs } from "@/components/ui/DetailTabs";
import { Breadcrumbs, PageHeader } from "@/components/ui/kit";

const TABS = [
  { key: "overview", label: "Overview" }, { key: "attributes", label: "Attributes" },
  { key: "hidden-attributes", label: "Hidden attributes" }, { key: "stints", label: "Career stints" },
  { key: "sources", label: "Sources" },
];

export default async function PlayerStintsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const num = Number(id);
  if (!Number.isInteger(num)) notFound();
  const [player, clubStints, nationalStints, clubs, teams] = await Promise.all([
    getPlayer(num), listClubStints(num), listNationalStints(num), listClubOptions(), listNationalTeamOptions(),
  ]);
  if (!player) notFound();
  const basePath = `/players/${player.id}`;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: "Archive", href: "/" }, { label: "Players", href: "/players" },
        { label: player.person?.full_name ?? `Player #${player.id}`, href: basePath }, { label: "Career stints" },
      ]} />
      <PageHeader title="Career stints" description="Club and national team spells." />
      <DetailTabs basePath={basePath} current="stints" tabs={TABS} />
      <div className="space-y-6">
        <ClubStintsCard playerId={player.id} stints={clubStints} clubs={clubs} />
        <NationalStintsCard playerId={player.id} stints={nationalStints} teams={teams} />
      </div>
    </div>
  );
}