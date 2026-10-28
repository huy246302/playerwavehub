import Link from "next/link";
import { notFound } from "next/navigation";
import { getPlayer } from "@/lib/db/players";
import { deletePlayers } from "@/lib/actions/players";
import DeleteRecordButton from "@/components/ui/DeleteRecordButton";
import { DetailTabs } from "@/components/ui/DetailTabs";
import NationalityTag from "@/components/ui/NationalityTag";
import { Breadcrumbs, Card, DefList, PageHeader, fmtDateTime, primaryBtn } from "@/components/ui/kit";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "attributes", label: "Attributes" },
  { key: "hidden-attributes", label: "Hidden attributes" },
  { key: "stints", label: "Career stints" },
  { key: "sources", label: "Sources" },
];

export default async function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const num = Number(id);
  if (!Number.isInteger(num)) notFound();
  const player = await getPlayer(num);
  if (!player) notFound();
  const basePath = `/players/${player.id}`;
  const bioPath = `/biographies/${player.biography_id}`;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Archive", href: "/" }, { label: "Players", href: "/players" }, { label: player.person?.full_name ?? `Player #${player.id}` }]} />
      <PageHeader
        title={player.person?.full_name ?? `Player #${player.id}`}
        description={`Player #${player.id} · Linked Biography #${player.biography_id}`}
        actions={
          <>
            <DeleteRecordButton id={player.id} name={player.person?.full_name ?? "this player"} noun="player"
              action={deletePlayers} redirectTo="/players" />
            <Link href={`${basePath}/edit`} className={primaryBtn}>Edit player</Link>
          </>
        }
      />
      <DetailTabs basePath={basePath} current="overview" tabs={TABS} />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card title="Career & legacy" note={`Player #${player.id}`}>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div>
                <p className="text-xs text-neutral-500">Nationality</p>
                <p className="text-lg"><NationalityTag nationality={player.person?.nationality} /></p>
              </div>
              <div><p className="text-xs text-neutral-500">Career</p><p className="text-lg">{player.career_start_year ?? "?"}–{player.retired_year ?? "present"}</p></div>
              <div><p className="text-xs text-neutral-500">Career status</p><p className="text-lg">{player.retired_year ? "Retired" : "Active"}</p></div>
              <div><p className="text-xs text-neutral-500">Height</p><p className="text-lg">{player.height_cm ? `${player.height_cm} cm` : "—"}</p></div>
            </div>
            {player.legacy_summary && (
              <div className="mt-4">
                <p className="text-xs text-neutral-500">Legacy summary</p>
                <p className="mt-1 text-sm text-neutral-700">{player.legacy_summary}</p>
              </div>
            )}
          </Card>

          <Card title="Attributes & playing profile" note={player.hasAttributes ? "Configured" : "Not configured"}>
            <div className="flex items-center justify-between">
              <p className="text-sm text-neutral-500">
                {player.hasAttributes ? "Technical, mental and physical values are set." : "Definitions and scales have not been supplied. No attribute values are displayed."}
              </p>
              <Link href={`${basePath}/attributes`} className="shrink-0 text-sm text-[#254a39] underline">Manage attributes →</Link>
            </div>
          </Card>

          <Card title="Hidden attributes" note="Separate from published content">
            <div className="flex items-center justify-between">
              <p className="text-sm text-neutral-500">
                {player.hasHiddenAttributes ? "Hidden attributes are set." : "No configured hidden attributes."}
              </p>
              <Link href={`${basePath}/hidden-attributes`} className="shrink-0 text-sm text-[#254a39] underline">Manage →</Link>
            </div>
          </Card>

          <Card title="Career stints" note={`${player.clubStintCount + player.nationalStintCount} linked records`}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-md border border-neutral-200 p-3">
                <p className="text-sm font-medium">{player.clubStintCount} club stint{player.clubStintCount === 1 ? "" : "s"}</p>
                <p className="mt-1 text-xs text-neutral-500">{player.clubStintCount ? "Club career recorded." : "No club stints yet."}</p>
                <Link href={`${basePath}/stints`} className="mt-2 inline-block text-xs text-[#254a39] underline">Manage stints →</Link>
              </div>
              <div className="rounded-md border border-neutral-200 p-3">
                <p className="text-sm font-medium">{player.nationalStintCount} national stint{player.nationalStintCount === 1 ? "" : "s"}</p>
                <p className="mt-1 text-xs text-neutral-500">{player.nationalStintCount ? "National team career recorded." : "No national stints yet."}</p>
                <Link href={`${basePath}/stints`} className="mt-2 inline-block text-xs text-[#254a39] underline">Manage stints →</Link>
              </div>
            </div>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card title="Publication">
            <p className="text-xs text-neutral-500">Current status</p>
            <p className={`mt-1 inline-block rounded-full px-2 py-0.5 text-sm ${player.is_published ? "bg-green-100 text-green-800" : "bg-neutral-200 text-neutral-700"}`}>
              {player.is_published ? "Published" : "Draft"}
            </p>
            <p className="mt-2 text-xs text-neutral-500">
              {player.is_published
                ? "This player record is marked as published. Hidden attributes are managed separately."
                : "This record is a draft and not visible on the public site."}
            </p>
          </Card>

          <Card title="Linked biography">
            <p className="text-sm font-medium">{player.person?.full_name}</p>
            <p className="text-xs text-neutral-500">Biography #{player.biography_id}</p>
            <Link href={bioPath} className="mt-2 inline-block text-sm text-[#254a39] underline">View biography →</Link>
            <p className="mt-2 text-xs text-neutral-400">
              Nationality is set on the biography. Change it from Edit biography.
            </p>
          </Card>

          <Card title="Source connections" note={`${player.sourceCount} sources`}>
            <p className="text-sm text-neutral-500">
              {player.sourceCount ? `${player.sourceCount} source(s) linked to Biography #${player.biography_id}.` : `No sources are linked to Biography #${player.biography_id} yet.`}
            </p>
            <Link href={`${basePath}/sources`} className="mt-2 inline-block text-xs text-[#254a39] underline">Manage biography sources →</Link>
          </Card>

          <Card title="Record history" note="Read only">
            <DefList rows={[
              ["Created", fmtDateTime(player.created_at)],
              ["Created by", player.created_by_name ?? "—"],
              ["Updated", fmtDateTime(player.updated_at)],
              ["Updated by", player.updated_by_name ?? "—"],
            ]} />
          </Card>
        </aside>
      </div>

      <Link href="/players" className="inline-block text-sm text-neutral-500 hover:underline">← Back to players</Link>
    </div>
  );
}