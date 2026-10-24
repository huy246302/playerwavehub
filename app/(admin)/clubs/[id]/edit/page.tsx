import { notFound } from "next/navigation";
import { getClub } from "@/lib/db/clubs";
import { listCountryOptions } from "@/lib/db/countries";
import ClubForm from "@/components/clubs/ClubForm";
import { Breadcrumbs, PageHeader } from "@/components/ui/kit";

export default async function EditClubPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const num = Number(id);
  if (!Number.isInteger(num)) notFound();
  const [club, countries] = await Promise.all([getClub(num), listCountryOptions()]);
  if (!club) notFound();

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: "Archive", href: "/" }, { label: "Clubs", href: "/clubs" },
        { label: club.name, href: `/clubs/${club.id}` }, { label: "Edit" },
      ]} />
      <PageHeader title={`Edit ${club.name}`} />
      <ClubForm club={club} countries={countries} />
    </div>
  );
}