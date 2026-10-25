import Link from "next/link";
import { notFound } from "next/navigation";
import { getSource } from "@/lib/db/sources";
import { deleteSources } from "@/lib/actions/sources";
import DeleteRecordButton from "@/components/ui/DeleteRecordButton";
import { Breadcrumbs, Card, DefList, PageHeader, fmtDate, fmtDateTime, primaryBtn } from "@/components/ui/kit";

export default async function SourcePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const num = Number(id);
  if (!Number.isInteger(num)) notFound();
  const source = await getSource(num);
  if (!source) notFound();

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Archive", href: "/" }, { label: "Sources", href: "/sources" }, { label: source.title }]} />
      <PageHeader
        title={source.title}
        description={`Record #${source.id}`}
        actions={
          <>
            <DeleteRecordButton id={source.id} name={source.title} noun="source" action={deleteSources} redirectTo="/sources" />
            <Link href={`/sources/${source.id}/edit`} className={primaryBtn}>Edit source</Link>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card title="Overview">
            <DefList rows={[
              ["Publisher", source.publisher],
              ["Author", source.author],
              ["Published on", fmtDate(source.published_on)],
              ["Accessed on", fmtDate(source.accessed_on)],
              ["URL", source.url ? <a key="u" href={source.url} target="_blank" rel="noopener noreferrer" className="text-[#254a39] underline break-all">{source.url}</a> : "—"],
            ]} />
          </Card>
          {source.notes && (
            <Card title="Notes">
              <p className="whitespace-pre-wrap text-sm text-neutral-700">{source.notes}</p>
            </Card>
          )}
        </div>

        <aside className="space-y-6">
          <Card title="Used by" note="Read only">
            <DefList rows={[["Biographies", source.usage.biographies], ["Clubs", source.usage.clubs]]} />
            <p className="mt-3 text-xs text-neutral-400">Link or unlink this source from a biography&apos;s or club&apos;s own page.</p>
          </Card>
          <Card title="System information" note="Read only">
            <DefList rows={[["Added", fmtDateTime(source.created_at)]]} />
          </Card>
        </aside>
      </div>

      <Link href="/sources" className="inline-block text-sm text-neutral-500 hover:underline">← Back to sources</Link>
    </div>
  );
}