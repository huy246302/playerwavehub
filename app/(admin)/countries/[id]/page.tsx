import Link from "next/link";
import { notFound } from "next/navigation";
import { getCountry } from "@/lib/db/countries";
import { deleteCountries } from "@/lib/actions/countries";
import DeleteRecordButton from "@/components/ui/DeleteRecordButton";
import {
  Breadcrumbs, Card, DefList, PageHeader, Thumb, fmtDateTime, primaryBtn,
} from "@/components/ui/kit";

export default async function CountryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const num = Number(id);
  if (!Number.isInteger(num)) notFound();
  const country = await getCountry(num);
  if (!country) notFound();

  const { usage } = country;

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: "Archive", href: "/" },
        { label: "Countries", href: "/countries" },
        { label: country.name },
      ]} />
      <PageHeader
        title={country.name}
        description={`${country.is_historical ? "Historical state" : "Current country"} · Record #${country.id}`}
        actions={
          <>
            <DeleteRecordButton id={country.id} name={country.name} noun="country"
              action={deleteCountries} redirectTo="/countries" />
            <Link href={`/countries/${country.id}/edit`} className={primaryBtn}>Edit country</Link>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card title="Overview">
            <DefList rows={[
              ["Name", country.name],
              ["ISO code", country.iso_code],
              ["Type", country.is_historical ? "Historical" : "Current"],
              ["Slug", country.slug],
            ]} />
          </Card>
          <Card title="Flag">
            {country.flag_url ? (
              <div className="flex items-center gap-4">
                <Thumb src={country.flag_url} className="h-12 w-20 rounded-sm border border-neutral-200 object-cover" />
                <span className="break-all text-xs text-neutral-500">{country.flag_url}</span>
              </div>
            ) : (
              <p className="text-sm text-neutral-500">No flag image yet. Add one from Edit country.</p>
            )}
          </Card>
        </div>

        <aside className="space-y-6">
          <Card title="Used by" note="Read only">
            <DefList rows={[
              ["Clubs", usage.clubs],
              ["National teams", usage.nationalTeams],
              ["Biographies", usage.biographies],
            ]} />
            <p className="mt-3 text-xs text-neutral-400">
              A country that is in use cannot be deleted.
            </p>
          </Card>
          <Card title="Record history" note="Read only">
            <DefList rows={[["Created", fmtDateTime(country.created_at)]]} />
            <p className="mt-3 text-xs text-neutral-400">
              Countries do not store who edited them or when.
            </p>
          </Card>
        </aside>
      </div>

      <Link href="/countries" className="inline-block text-sm text-neutral-500 hover:underline">
        ← Back to countries
      </Link>
    </div>
  );
}