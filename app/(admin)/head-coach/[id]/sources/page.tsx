import { notFound } from "next/navigation";
import { getCoach } from "@/lib/db/coach";
import { DetailTabs } from "@/components/ui/DetailTabs";
import { Breadcrumbs, Card, PageHeader } from "@/components/ui/kit";

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

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: "Archive", href: "/" }, { label: "Head coaches", href: "/head-coach" },
        { label: coach.person?.full_name ?? `Coach #${coach.id}`, href: basePath }, { label: "Sources" },
      ]} />
      <PageHeader title="Sources" description="Evidence linked through the biography." />
      <DetailTabs basePath={basePath} current="sources" tabs={TABS} />
      <Card title="Not built yet">
        <p className="text-sm text-neutral-500">The sources editor is coming in the next build.</p>
      </Card>
    </div>
  );
}