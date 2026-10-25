import { notFound } from "next/navigation";
import { getSource } from "@/lib/db/sources";
import SourceForm from "@/components/sources/SourceForm";
import { Breadcrumbs, PageHeader } from "@/components/ui/kit";

export default async function EditSourcePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const num = Number(id);
  if (!Number.isInteger(num)) notFound();
  const source = await getSource(num);
  if (!source) notFound();

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: "Archive", href: "/" }, { label: "Sources", href: "/sources" },
        { label: source.title, href: `/sources/${source.id}` }, { label: "Edit" },
      ]} />
      <PageHeader title={`Edit ${source.title}`} />
      <SourceForm source={source} />
    </div>
  );
}