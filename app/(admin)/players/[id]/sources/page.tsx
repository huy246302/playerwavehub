import { notFound } from "next/navigation";
import { getPlayer } from "@/lib/db/players";
import { listBiographySources } from "@/lib/db/biography-sources";
import { listSourceOptions } from "@/lib/db/sources";
import { linkBiographySource, unlinkBiographySource } from "@/lib/actions/biography-sources";
import SourceLinker from "@/components/sources/SourceLinker";
import { DetailTabs } from "@/components/ui/DetailTabs";
import { Breadcrumbs, PageHeader } from "@/components/ui/kit";

const TABS = [
  { key: "overview", label: "Overview" }, { key: "attributes", label: "Attributes" },
  { key: "hidden-attributes", label: "Hidden attributes" }, { key: "stints", label: "Career stints" },
  { key: "sources", label: "Sources" },
];

export default async function PlayerSourcesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const num = Number(id);
  if (!Number.isInteger(num)) notFound();
  const player = await getPlayer(num);
  if (!player) notFound();
  const basePath = `/players/${player.id}`;

  const [linked, options] = await Promise.all([
    listBiographySources(player.biography_id),
    listSourceOptions(),
  ]);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: "Archive", href: "/" }, { label: "Players", href: "/players" },
        { label: player.person?.full_name ?? `Player #${player.id}`, href: basePath }, { label: "Sources" },
      ]} />
      <PageHeader title="Sources" description={`Evidence linked through Biography #${player.biography_id}.`} />
      <DetailTabs basePath={basePath} current="sources" tabs={TABS} />
      <SourceLinker
        title="Biography sources"
        linked={linked}
        options={options}
        linkAction={linkBiographySource.bind(null, player.biography_id)}
        unlinkAction={unlinkBiographySource.bind(null, player.biography_id)}
      />
    </div>
  );
}