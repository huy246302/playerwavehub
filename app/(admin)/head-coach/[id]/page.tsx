import Link from "next/link";
import { notFound } from "next/navigation";
import { getCoach } from "@/lib/db/coach";
import { deleteCoaches } from "@/lib/actions/coach";
import DeleteRecordButton from "@/components/ui/DeleteRecordButton";
import { DetailTabs } from "@/components/ui/DetailTabs";
import NationalityTag from "@/components/ui/NationalityTag";
import { Breadcrumbs, Card, DefList, PageHeader, fmtDateTime, primaryBtn } from "@/components/ui/kit";

const TABS = [
  { key: "overview", label: "Overview" }, { key: "attributes", label: "Attributes" },
  { key: "hidden-attributes", label: "Hidden attributes" }, { key: "stints", label: "Career stints" },
  { key: "sources", label: "Sources" },
];

export default async function CoachPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const num = Number(id);
  if (!Number.isInteger(num)) notFound();
  const coach = await getCoach(num);
  if (!coach) notFound();
  const basePath = `/head-coach/${coach.id}`;
  const bioPath = `/biographies/${coach.biography_id}`;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Archive", href: "/" }, { label: "Head coaches", href: "/head-coach" }, { label: coach.person?.full_name ?? `Coach #${coach.id}` }]} />
      <PageHeader
        title={coach.person?.full_name ?? `Coach #${coach.id}`}
        description={`Coach #${coach.id} · Linked Biography #${coach.biography_id}`}
        actions={
          <>
            <DeleteRecordButton id={coach.id} name={coach.person?.full_name ?? "this coach"} noun="head coach"
              action={deleteCoaches} redirectTo="/head-coach" />
            <Link href={`${basePath}/edit`} className={primaryBtn}>Edit head coach</Link>
          </>
        }
      />
      <DetailTabs basePath={basePath} current="overview" tabs={TABS} />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card title="Career & legacy" note={`Coach #${coach.id}`}>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-neutral-500">Nationality</p>
                <p className="text-lg"><NationalityTag nationality={coach.person?.nationality} /></p>
              </div>
              <div><p className="text-xs text-neutral-500">Career</p><p className="text-lg">{coach.career_start_year ?? "?"}–{coach.retired_year ?? "present"}</p></div>
              <div><p className="text-xs text-neutral-500">Career status</p><p className="text-lg">{coach.retired_year ? "Retired" : "Active"}</p></div>
            </div>
            {coach.legacy_summary && (
              <div className="mt-4">
                <p className="text-xs text-neutral-500">Legacy summary</p>
                <p className="mt-1 text-sm text-neutral-700">{coach.legacy_summary}</p>
              </div>
            )}
          </Card>

          <Card title="Attributes" note={coach.hasAttributes ? "Configured" : "Not configured"}>
            <div className="flex items-center justify-between">
              <p className="text-sm text-neutral-500">{coach.hasAttributes ? "Coaching and mental values are set." : "No attribute values are set."}</p>
              <Link href={`${basePath}/attributes`} className="shrink-0 text-sm text-[#254a39] underline">Manage attributes →</Link>
            </div>
          </Card>

          <Card title="Hidden attributes" note="Separate from published content">
            <div className="flex items-center justify-between">
              <p className="text-sm text-neutral-500">{coach.hasHiddenAttributes ? "Hidden attributes are set." : "No configured hidden attributes."}</p>
              <Link href={`${basePath}/hidden-attributes`} className="shrink-0 text-sm text-[#254a39] underline">Manage →</Link>
            </div>
          </Card>

          <Card title="Career stints" note={`${coach.clubStintCount + coach.nationalStintCount} linked records`}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-md border border-neutral-200 p-3">
                <p className="text-sm font-medium">{coach.clubStintCount} club stint{coach.clubStintCount === 1 ? "" : "s"}</p>
                <p className="mt-1 text-xs text-neutral-500">{coach.clubStintCount ? "Club career recorded." : "No club stints yet."}</p>
                <Link href={`${basePath}/stints`} className="mt-2 inline-block text-xs text-[#254a39] underline">Manage stints →</Link>
              </div>
              <div className="rounded-md border border-neutral-200 p-3">
                <p className="text-sm font-medium">{coach.nationalStintCount} national stint{coach.nationalStintCount === 1 ? "" : "s"}</p>
                <p className="mt-1 text-xs text-neutral-500">{coach.nationalStintCount ? "National team career recorded." : "No national stints yet."}</p>
                <Link href={`${basePath}/stints`} className="mt-2 inline-block text-xs text-[#254a39] underline">Manage stints →</Link>
              </div>
            </div>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card title="Publication">
            <p className="text-xs text-neutral-500">Current status</p>
            <p className={`mt-1 inline-block rounded-full px-2 py-0.5 text-sm ${coach.is_published ? "bg-green-100 text-green-800" : "bg-neutral-200 text-neutral-700"}`}>
              {coach.is_published ? "Published" : "Draft"}
            </p>
          </Card>

          <Card title="Linked biography">
            <p className="text-sm font-medium">{coach.person?.full_name}</p>
            <p className="text-xs text-neutral-500">Biography #{coach.biography_id}</p>
            <Link href={bioPath} className="mt-2 inline-block text-sm text-[#254a39] underline">View biography →</Link>
            <p className="mt-2 text-xs text-neutral-400">
              Nationality is set on the biography. Change it from Edit biography.
            </p>
          </Card>

          <Card title="Source connections" note={`${coach.sourceCount} sources`}>
            <p className="text-sm text-neutral-500">
              {coach.sourceCount ? `${coach.sourceCount} source(s) linked to Biography #${coach.biography_id}.` : `No sources are linked to Biography #${coach.biography_id} yet.`}
            </p>
            <Link href={`${basePath}/sources`} className="mt-2 inline-block text-xs text-[#254a39] underline">Manage biography sources →</Link>
          </Card>

          <Card title="Record history" note="Read only">
            <DefList rows={[
              ["Created", fmtDateTime(coach.created_at)],
              ["Created by", coach.created_by_name ?? "—"],
              ["Updated", fmtDateTime(coach.updated_at)],
              ["Updated by", coach.updated_by_name ?? "—"],
            ]} />
          </Card>
        </aside>
      </div>

      <Link href="/head-coach" className="inline-block text-sm text-neutral-500 hover:underline">← Back to head coaches</Link>
    </div>
  );
}