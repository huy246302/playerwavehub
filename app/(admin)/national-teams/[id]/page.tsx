import Link from "next/link";
import { notFound } from "next/navigation";
import { getNationalTeam } from "@/lib/db/national-teams";
import { deleteNationalTeams } from "@/lib/actions/national-teams";
import DeleteRecordButton from "@/components/ui/DeleteRecordButton";
import {
  Breadcrumbs, Card, DefList, PageHeader, Thumb, fmtDateTime, primaryBtn,
} from "@/components/ui/kit";

export default async function NationalTeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const num = Number(id);
  if (!Number.isInteger(num)) notFound();
  const team = await getNationalTeam(num);
  if (!team) notFound();

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: "Archive", href: "/" }, { label: "National teams", href: "/national-teams" }, { label: team.name },
      ]} />
      <PageHeader
        title={team.name}
        description={`${team.country?.name ?? "Unassigned"} · Record #${team.id}`}
        actions={
          <>
            <DeleteRecordButton id={team.id} name={team.name} noun="national team"
              action={deleteNationalTeams} redirectTo="/national-teams" />
            <Link href={`/national-teams/${team.id}/edit`} className={primaryBtn}>Edit national team</Link>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card title="Overview">
            <DefList rows={[
              ["Name", team.name],
              ["Country", team.country?.name],
              ["Slug", team.slug],
            ]} />
          </Card>
          <Card title="Crest">
            {team.crest_url ? (
              <Thumb src={team.crest_url} className="h-16 w-16 rounded-full border border-neutral-200 object-cover" />
            ) : (
              <p className="text-sm text-neutral-500">No crest yet. Add one from Edit national team.</p>
            )}
          </Card>
          {team.description && (
            <Card title="Description">
              <p className="whitespace-pre-wrap text-sm text-neutral-700">{team.description}</p>
            </Card>
          )}
        </div>

        <aside className="space-y-6">
          <Card title="Used by" note="Read only">
            <DefList rows={[
              ["Player career stints", team.usage.playerStints],
              ["Coach career stints", team.usage.coachStints],
            ]} />
            <p className="mt-3 text-xs text-neutral-400">A national team that is in use cannot be deleted.</p>
          </Card>
          <Card title="Record history" note="Read only">
            <DefList rows={[
              ["Created", fmtDateTime(team.created_at)],
              ["Created by", team.created_by_name ?? "—"],
              ["Updated", fmtDateTime(team.updated_at)],
              ["Updated by", team.updated_by_name ?? "—"],
            ]} />
          </Card>
        </aside>
      </div>

      <Link href="/national-teams" className="inline-block text-sm text-neutral-500 hover:underline">← Back to national teams</Link>
    </div>
  );
}