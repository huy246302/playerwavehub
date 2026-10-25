import { notFound } from "next/navigation";
import { getCoach } from "@/lib/db/coach";
import { listCoachClubStints, listCoachNationalStints } from "@/lib/db/coach-stints";
import { listClubOptions } from "@/lib/db/clubs";
import { listNationalTeamOptions } from "@/lib/db/national-teams";
import CoachClubStintsCard from "@/components/coaches/stints/ClubStintsCard";
import CoachNationalStintsCard from "@/components/coaches/stints/NationalStintsCard";
import { DetailTabs } from "@/components/ui/DetailTabs";
import { Breadcrumbs, PageHeader } from "@/components/ui/kit";

const TABS = [
  { key: "overview", label: "Overview" }, { key: "attributes", label: "Attributes" },
  { key: "hidden-attributes", label: "Hidden attributes" }, { key: "stints", label: "Career stints" },
  { key: "sources", label: "Sources" },
];

export default async function CoachStintsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const num = Number(id);
  if (!Number.isInteger(num)) notFound();
  const [coach, clubStints, nationalStints, clubs, teams] = await Promise.all([
    getCoach(num), listCoachClubStints(num), listCoachNationalStints(num), listClubOptions(), listNationalTeamOptions(),
  ]);
  if (!coach) notFound();
  const basePath = `/head-coach/${coach.id}`;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: "Archive", href: "/" }, { label: "Head coaches", href: "/head-coach" },
        { label: coach.person?.full_name ?? `Coach #${coach.id}`, href: basePath }, { label: "Career stints" },
      ]} />
      <PageHeader title="Career stints" description="Club and national team spells." />
      <DetailTabs basePath={basePath} current="stints" tabs={TABS} />
      <div className="space-y-6">
        <CoachClubStintsCard coachId={coach.id} stints={clubStints} clubs={clubs} />
        <CoachNationalStintsCard coachId={coach.id} stints={nationalStints} teams={teams} />
      </div>
    </div>
  );
}