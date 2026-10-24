import NationalTeamForm from "@/components/national-teams/NationalTeamForm";
import { listCountryOptions } from "@/lib/db/countries";
import { Breadcrumbs, PageHeader } from "@/components/ui/kit";

export default async function NewNationalTeamPage() {
  const countries = await listCountryOptions();
  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: "Archive", href: "/" }, { label: "National teams", href: "/national-teams" }, { label: "Add national team" },
      ]} />
      <PageHeader title="Add national team" description="One record per country, one level only." />
      <NationalTeamForm countries={countries} />
    </div>
  );
}