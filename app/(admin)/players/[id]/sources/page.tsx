import { notFound } from "next/navigation";
import { getPlayer } from "@/lib/db/players";
import { DetailTabs } from "@/components/ui/DetailTabs";
import { Breadcrumbs, Card, PageHeader } from "@/components/ui/kit";

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

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: "Archive", href: "/" }, { label: "Players", href: "/players" },
        { label: player.person?.full_name ?? `Player #${player.id}`, href: basePath }, { label: "Hidden attributes" },
      ]} />
      <PageHeader title="Hidden attributes" description="Managed separately from published content." />
      <DetailTabs basePath={basePath} current="hidden-attributes" tabs={TABS} />
      <Card title="Not built yet">
        <p className="text-sm text-neutral-500">The hidden attributes editor is coming in the next build.</p>
      </Card>
    </div>
  );
}