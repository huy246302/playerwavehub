import BiographyForm from "@/components/biographies/BiographyForm";
import { listCountryOptions } from "@/lib/db/biographies";
import { Breadcrumbs, PageHeader } from "@/components/ui/kit";

export const metadata = { title: "Add biography" };

export default async function NewBiographyPage() {
  const countries = await listCountryOptions();
  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: "Archive", href: "/" },
        { label: "Biographies", href: "/biographies" },
        { label: "Add biography" },
      ]} />
      <PageHeader title="Add biography" description="Start with the life details shared by players and head coaches." />
      <BiographyForm countries={countries} />
    </div>
  );
}