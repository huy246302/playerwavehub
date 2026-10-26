import Link from "next/link";
import { notFound } from "next/navigation";
import { getBiography } from "@/lib/db/biographies";
import { deleteBiography } from "@/lib/actions/biographies";
import DeleteRecordButton from "@/components/ui/DeleteRecordButton";
import {
  Breadcrumbs, Card, DefList, PageHeader, Thumb, fmtDate, fmtDateTime, primaryBtn,
} from "@/components/ui/kit";

export default async function BiographyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const num = Number(id);
  if (!Number.isInteger(num)) notFound();
  const b = await getBiography(num);
  if (!b) notFound();

  const name = b.display_name || b.full_name;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: "Archive", href: "/" },
        { label: "Biographies", href: "/biographies" },
        { label: name },
      ]} />
      <PageHeader
        title={name}
        description={`Biography · Record #${b.id}`}
        actions={
          <>
            <DeleteRecordButton id={b.id} name={b.full_name} noun="biography"
              action={deleteBiography} redirectTo="/biographies" />
            <Link href={`/biographies/${b.id}/edit`} className={primaryBtn}>Edit biography</Link>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card title="Overview">
            <DefList rows={[
              ["Full name", b.full_name],
              ["Display name", b.display_name],
              ["Born", fmtDate(b.date_of_birth)],
              ["Died", fmtDate(b.date_of_death)],
              ["Birthplace", b.birthplace],
              ["Birth country", b.birth_country?.name],
              ["Nationality", b.nationality?.name],
            ]} />
          </Card>

          <Card title="Biography">
            {b.bio ? (
              <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-700">{b.bio}</p>
            ) : (
              <p className="text-sm text-neutral-500">No biography text yet. Add one from Edit biography.</p>
            )}
          </Card>

          <Card title="Photo">
            {b.photo_url ? (
              <div className="flex items-start gap-4">
                <Thumb src={b.photo_url} className="h-28 w-24 rounded-md border border-neutral-200 object-cover" />
                <DefList rows={[
                  ["Credit", b.photo_credit],
                  ["License", b.photo_license],
                  ["Source", b.photo_source_url
                    ? <a href={b.photo_source_url} target="_blank" rel="noreferrer" className="underline">Open page</a>
                    : null],
                ]} />
              </div>
            ) : (
              <p className="text-sm text-neutral-500">No photo yet. Add one from Edit biography.</p>
            )}
          </Card>
        </div>

        <aside className="space-y-6">
          <Card title="Linked records" note="Read only">
            <DefList rows={[
              ["Player", b.player
                ? <Link href={`/players/${b.player.id}`} className="underline">
                    View {b.player.is_published ? "(published)" : "(draft)"}
                  </Link>
                : "None"],
              ["Head coach", b.coach
                ? <Link href={`/head-coach/${b.coach.id}`} className="underline">
                    View {b.coach.is_published ? "(published)" : "(draft)"}
                  </Link>
                : "None"],
              ["Sources", b.sources],
            ]} />
            <p className="mt-3 text-xs text-neutral-400">
              A biography with a player or head coach record cannot be deleted.
            </p>
          </Card>
          <Card title="Record history" note="Read only">
            <DefList rows={[
              ["Created", fmtDateTime(b.created_at)],
              ["Last updated", fmtDateTime(b.updated_at)],
              ["Slug", b.slug],
            ]} />
          </Card>
        </aside>
      </div>

      <Link href="/biographies" className="inline-block text-sm text-neutral-500 hover:underline">
        ← Back to biographies
      </Link>
    </div>
  );
}