import CoachForm from "@/components/coaches/CoachForm";
import { listBiographiesWithoutCoach } from "@/lib/db/coach";
import { Breadcrumbs, PageHeader } from "@/components/ui/kit";

export default async function NewCoachPage() {
  const biographies = await listBiographiesWithoutCoach();
  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Archive", href: "/" }, { label: "Head coaches", href: "/head-coach" }, { label: "Add head coach" }]} />
      <PageHeader title="Add head coach" description="Link a biography, record a coaching career and preserve its legacy." />
      <CoachForm biographies={biographies} />
    </div>
  );
}