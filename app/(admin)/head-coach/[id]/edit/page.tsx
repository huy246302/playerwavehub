import { notFound } from "next/navigation";
import { getCoach } from "@/lib/db/coach";
import CoachForm from "@/components/coaches/CoachForm";
import { Breadcrumbs } from "@/components/ui/kit";
import { displayName } from "@/lib/names";
import PersonHeader from "@/components/ui/PersonHeader";

export default async function EditCoachPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const num = Number(id);
  if (!Number.isInteger(num)) notFound();
  const coach = await getCoach(num);
  if (!coach) notFound();

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: "Archive", href: "/" }, { label: "Head coaches", href: "/head-coach" },
        { label: displayName(coach.person, `Coach #${coach.id}`), href: `/head-coach/${coach.id}` }, { label: "Edit" },
      ]} />
      <PersonHeader photoUrl={coach.person?.photo_url} title={`Edit ${displayName(coach.person, "head coach")}`} />
      <CoachForm coach={coach} biographies={[]} />
    </div>
  );
}