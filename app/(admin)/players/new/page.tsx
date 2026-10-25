import PlayerForm from "@/components/players/PlayerForm";
import { listAvailableBiographies } from "@/lib/db/players";
import { Breadcrumbs, PageHeader } from "@/components/ui/kit";

export default async function NewPlayerPage() {
  const biographies = await listAvailableBiographies();
  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Archive", href: "/" }, { label: "Players", href: "/players" }, { label: "Add player" }]} />
      <PageHeader title="Add player" description="Link a biography, record a playing career and preserve its legacy." />
      <PlayerForm biographies={biographies} />
    </div>
  );
}