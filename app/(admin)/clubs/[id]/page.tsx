import Link from "next/link";
import { notFound } from "next/navigation";
import { getClub } from "@/lib/db/clubs";
import { deleteClubs } from "@/lib/actions/clubs";
import DeleteRecordButton from "@/components/ui/DeleteRecordButton";
import {
  Breadcrumbs, Card, DefList, PageHeader, Thumb, fmtDateTime, primaryBtn,
} from "@/components/ui/kit";

export default async function ClubPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const num = Number(id);
  if (!Number.isInteger(num)) notFound();
  const club = await getClub(num);
  if (!club) notFound();

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: "Archive", href: "/" }, { label: "Clubs", href: "/clubs" }, { label: club.name },
      ]} />
      <PageHeader
        title={club.name}
        description={`${club.short_name ? club.short_name + " · " : ""}Record #${club.id}`}
        actions={
          <>
            <DeleteRecordButton id={club.id} name={club.name} noun="club" action={deleteClubs} redirectTo="/clubs" />
            <Link href={`/clubs/${club.id}/edit`} className={primaryBtn}>Edit club</Link>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card title="Overview">
            <DefList rows={[
              ["Name", club.name],
              ["Short name", club.short_name],
              ["City", club.city],
              ["Country", club.country?.name],
              ["Founded", club.founded_year],
              ["Slug", club.slug],
            ]} />
          </Card>
          <Card title="Logo">
            {club.logo_url ? (
              <div className="flex items-center gap-4">
                <Thumb src={club.logo_url} className="h-16 w-16 rounded-full border border-neutral-200 object-cover" />
                <div className="text-xs text-neutral-500">
                  {club.logo_credit && <div>Credit: {club.logo_credit}</div>}
                  {club.logo_license && <div>License: {club.logo_license}</div>}
                  {club.logo_source_url && <div className="break-all">Source: {club.logo_source_url}</div>}
                </div>
              </div>
            ) : (
              <p className="text-sm text-neutral-500">No logo yet. Add one from Edit club.</p>
            )}
          </Card>
          {club.description && (
            <Card title="Description">
              <p className="whitespace-pre-wrap text-sm text-neutral-700">{club.description}</p>
            </Card>
          )}
        </div>

        <aside className="space-y-6">
          <Card title="Used by" note="Read only">
            <DefList rows={[
              ["Player career stints", club.usage.playerStints],
              ["Coach career stints", club.usage.coachStints],
              ["Linked sources", club.usage.sources],
            ]} />
            <p className="mt-3 text-xs text-neutral-400">A club that is in use cannot be deleted.</p>
          </Card>
          <Card title="Record history" note="Read only">
            <DefList rows={[
              ["Created", fmtDateTime(club.created_at)],
              ["Created by", club.created_by_name ?? "—"],
              ["Updated", fmtDateTime(club.updated_at)],
              ["Updated by", club.updated_by_name ?? "—"],
            ]} />
          </Card>
        </aside>
      </div>

      <Link href="/clubs" className="inline-block text-sm text-neutral-500 hover:underline">← Back to clubs</Link>
    </div>
  );
}