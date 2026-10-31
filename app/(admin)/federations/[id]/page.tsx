import Link from "next/link";
import { notFound } from "next/navigation";
import { getFederation } from "@/lib/db/federations";
import { deleteFederations } from "@/lib/actions/federations";
import DeleteRecordButton from "@/components/ui/DeleteRecordButton";
import {
  Breadcrumbs, Card, DefList, PageHeader, Thumb, fmtDateTime, primaryBtn,
} from "@/components/ui/kit";

export default async function FederationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const num = Number(id);
  if (!Number.isInteger(num)) notFound();
  const federation = await getFederation(num);
  if (!federation) notFound();

  const defunct = federation.ended_year != null;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: "Archive", href: "/" }, { label: "Federations", href: "/federations" }, { label: federation.name },
      ]} />
      <PageHeader
        title={federation.name}
        description={`${federation.short_name ? federation.short_name + " · " : ""}Record #${federation.id}`}
        actions={
          <>
            <DeleteRecordButton id={federation.id} name={federation.name} noun="federation"
              action={deleteFederations} redirectTo="/federations" />
            <Link href={`/federations/${federation.id}/edit`} className={primaryBtn}>Edit federation</Link>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card title="Overview">
            <DefList rows={[
              ["Name", federation.name],
              ["Short name", federation.short_name],
              ["Country", federation.country?.name],
              ["Confederation", federation.confederation],
              ["Founded", federation.founded_year],
              ["Ended", defunct ? federation.ended_year : "Still active"],
              ["Status", (
                <span key="s" className={`rounded-full px-2 py-0.5 text-xs ${defunct ? "bg-neutral-200 text-neutral-700" : "bg-green-100 text-green-800"}`}>
                  {defunct ? "Defunct" : "Active"}
                </span>
              )],
              ["Slug", federation.slug],
            ]} />
          </Card>
          <Card title="Logo">
            {federation.logo_url ? (
              <div className="flex items-center gap-4">
                <Thumb src={federation.logo_url} className="h-16 w-16 rounded-full border border-neutral-200 object-cover" />
                <div className="text-xs text-neutral-500">
                  {federation.logo_credit && <div>Credit: {federation.logo_credit}</div>}
                  {federation.logo_license && <div>License: {federation.logo_license}</div>}
                  {federation.logo_source_url && <div className="break-all">Source: {federation.logo_source_url}</div>}
                </div>
              </div>
            ) : (
              <p className="text-sm text-neutral-500">No logo yet. Add one from Edit federation.</p>
            )}
          </Card>
          {federation.description && (
            <Card title="Description">
              <p className="whitespace-pre-wrap text-sm text-neutral-700">{federation.description}</p>
            </Card>
          )}
        </div>

        <aside className="space-y-6">
          <Card title="Used by" note="Read only">
            <DefList rows={[
              ["National teams", federation.usage.nationalTeams],
              ["Clubs", federation.usage.clubs],
            ]} />
            <p className="mt-3 text-xs text-neutral-400">A federation with national teams cannot be deleted.</p>
          </Card>
          <Card title="Record history" note="Read only">
            <DefList rows={[
              ["Created", fmtDateTime(federation.created_at)],
              ["Created by", federation.created_by_name ?? "—"],
              ["Updated", fmtDateTime(federation.updated_at)],
              ["Updated by", federation.updated_by_name ?? "—"],
            ]} />
          </Card>
        </aside>
      </div>

      <Link href="/federations" className="inline-block text-sm text-neutral-500 hover:underline">← Back to federations</Link>
    </div>
  );
}
