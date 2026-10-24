import { notFound } from "next/navigation";
import { getNationalTeam } from "@/lib/db/national-teams";
import { listCountryOptions } from "@/lib/db/countries";
import NationalTeamForm from "@/components/national-teams/NationalTeamForm";
import { Breadcrumbs, PageHeader } from "@/components/ui/kit";

export default async function EditNationalTeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const num = Number(id);
  if (!Number.isInteger(num)) notFound();
  const [team, countries] = await Promise.all([getNationalTeam(num), listCountryOptions()]);
  if (!team) notFound();

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: "Archive", href: "/" }, { label: "National teams", href: "/national-teams" },
        { label: team.name, href: `/national-teams/${team.id}` }, { label: "Edit" },
      ]} />
      <PageHeader title={`Edit ${team.name}`} />
      <NationalTeamForm team={team} countries={countries} />
    </div>
  );
}