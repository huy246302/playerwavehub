import { notFound } from "next/navigation";
import { getFederation, listFederationCountryOptions } from "@/lib/db/federations";
import FederationForm from "@/components/federations/FederationForm";
import { Breadcrumbs, PageHeader } from "@/components/ui/kit";

export default async function EditFederationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const num = Number(id);
  if (!Number.isInteger(num)) notFound();
  const [federation, countries] = await Promise.all([getFederation(num), listFederationCountryOptions()]);
  if (!federation) notFound();

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: "Archive", href: "/" }, { label: "Federations", href: "/federations" },
        { label: federation.name, href: `/federations/${federation.id}` }, { label: "Edit" },
      ]} />
      <PageHeader title={`Edit ${federation.name}`} />
      <FederationForm federation={federation} countries={countries} />
    </div>
  );
}
