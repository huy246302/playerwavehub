import CountryForm from "@/components/countries/CountryForm";
import { Breadcrumbs, PageHeader } from "@/components/ui/kit";

export default function NewCountryPage() {
  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: "Archive", href: "/" },
        { label: "Countries", href: "/countries" },
        { label: "Add country" },
      ]} />
      <PageHeader title="Add country" description="Add a current or historical country to the shared list." />
      <CountryForm />
    </div>
  );
}