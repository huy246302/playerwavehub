import { notFound } from "next/navigation";
import { getCoach } from "@/lib/db/coach";
import { getCoachHiddenAttributes } from "@/lib/db/coach-attributes";
import CoachHiddenAttributesForm from "@/components/coaches/HiddenAttributesForm";
import { DetailTabs } from "@/components/ui/DetailTabs";
import { Breadcrumbs, PageHeader } from "@/components/ui/kit";

const TABS = [
  { key: "overview", label: "Overview" }, { key: "attributes", label: "Attributes" },
  { key: "hidden-attributes", label: "Hidden attributes" }, { key: "stints", label: "Career stints" },
  { key: "sources", label: "Sources" },
];

export default async function CoachHiddenAttributesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const num = Number(id);
  if (!Number.isInteger(num)) notFound();
  const [coach, attrs] = await Promise.all([getCoach(num), getCoachHiddenAttributes(num)]);
  if (!coach) notFound();
  const basePath = `/head-coach/${coach.id}`;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: "Archive", href: "/" }, { label: "Head coaches", href: "/head-coach" },
        { label: coach.person?.full_name ?? `Coach #${coach.id}`, href: basePath }, { label: "Hidden attributes" },
      ]} />
      <PageHeader title="Hidden attributes" description="Reputation, personality and managed-separately values." />
      <DetailTabs basePath={basePath} current="hidden-attributes" tabs={TABS} />
      <CoachHiddenAttributesForm coachId={coach.id} attributes={attrs} backHref={basePath} />
    </div>
  );
}