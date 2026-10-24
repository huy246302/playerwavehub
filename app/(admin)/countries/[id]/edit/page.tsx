import { notFound } from "next/navigation";
import { getCountry } from "@/lib/db/countries";
import CountryForm from "@/components/countries/CountryForm";
import { Breadcrumbs, PageHeader } from "@/components/ui/kit";

export default async function EditCountryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const num = Number(id);
  if (!Number.isInteger(num)) notFound();
  const country = await getCountry(num);
  if (!country) notFound();

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: "Archive", href: "/" },
        { label: "Countries", href: "/countries" },
        { label: country.name, href: `/countries/${country.id}` },
        { label: "Edit" },
      ]} />
      <PageHeader title={`Edit ${country.name}`} />
      <CountryForm country={country} />
    </div>
  );
}