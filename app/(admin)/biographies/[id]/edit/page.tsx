import { notFound } from "next/navigation";
import { getBiography, listCountryOptions } from "@/lib/db/biographies";
import BiographyForm from "@/components/biographies/BiographyForm";
import { Breadcrumbs, PageHeader } from "@/components/ui/kit";

export default async function EditBiographyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const num = Number(id);
  if (!Number.isInteger(num)) notFound();
  const [biography, countries] = await Promise.all([getBiography(num), listCountryOptions()]);
  if (!biography) notFound();

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: "Archive", href: "/" },
        { label: "Biographies", href: "/biographies" },
        { label: biography.display_name || biography.full_name, href: `/biographies/${biography.id}` },
        { label: "Edit" },
      ]} />
      <PageHeader title={`Edit ${biography.display_name || biography.full_name}`} />
      <BiographyForm biography={biography} countries={countries} />
    </div>
  );
}