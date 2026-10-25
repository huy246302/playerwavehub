import SourceForm from "@/components/sources/SourceForm";
import { Breadcrumbs, PageHeader } from "@/components/ui/kit";

export default function NewSourcePage() {
  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Archive", href: "/" }, { label: "Sources", href: "/sources" }, { label: "Add source" }]} />
      <PageHeader title="Add source" description="Record where a fact or story came from." />
      <SourceForm />
    </div>
  );
}