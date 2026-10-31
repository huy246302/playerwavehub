import FederationForm from "@/components/federations/FederationForm";
import { listCountryOptions } from "@/lib/db/countries";
import { Breadcrumbs, PageHeader } from "@/components/ui/kit";

export default async function NewFederationPage() {
  const countries = await listCountryOptions();
  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: "Archive", href: "/" }, { label: "Federations", href: "/federations" }, { label: "Add federation" },
      ]} />
      <PageHeader title="Add federation"
        description="A football federation and the years it existed. National teams are linked to it afterwards." />
      <FederationForm countries={countries} />
    </div>
  );
}
