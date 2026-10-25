import { notFound } from "next/navigation";
import { getCoach } from "@/lib/db/coach";
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

export default async function CoachSourcesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const num = Number(id);
  if (!Number.isInteger(num)) notFound();
  const coach = await getCoach(num);
  if (!coach) notFound();
  const basePath = `/head-coach/${coach.id}`;

  const [linked, options] = await Promise.all([
    listBiographySources(coach.biography_id),
    listSourceOptions(),
  ]);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: "Archive", href: "/" }, { label: "Head coaches", href: "/head-coach" },
        { label: coach.person?.full_name ?? `Coach #${coach.id}`, href: basePath }, { label: "Sources" },
      ]} />
      <PageHeader title="Sources" description={`Evidence linked through Biography #${coach.biography_id}.`} />
      <DetailTabs basePath={basePath} current="sources" tabs={TABS} />
      <SourceLinker
        title="Biography sources"
        linked={linked}
        options={options}
        linkAction={linkBiographySource.bind(null, coach.biography_id)}
        unlinkAction={unlinkBiographySource.bind(null, coach.biography_id)}
      />
    </div>
  );
}