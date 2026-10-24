import ClubForm from "@/components/clubs/ClubForm";
import { listCountryOptions } from "@/lib/db/countries";
import { Breadcrumbs, PageHeader } from "@/components/ui/kit";

export default async function NewClubPage() {
  const countries = await listCountryOptions();
  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: "Archive", href: "/" }, { label: "Clubs", href: "/clubs" }, { label: "Add club" },
      ]} />
      <PageHeader title="Add club" description="Add a club's identity. Career stints are linked afterwards." />
      <ClubForm countries={countries} />
    </div>
  );
}