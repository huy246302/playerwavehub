import { createAdminClient } from "@/lib/supabase/admin";
import BiographiesForm from "@/components/biographies/BiographiesForm";
import DeletePersonButton from "@/components/biographies/DeletePersonButton";
import Link from "next/link";

export default async function BiographiesPage({
  searchParams,
}: { searchParams: Promise<{ edit?: string }> }) {
  const { edit } = await searchParams;
  const sb = createAdminClient();

  const [{ data: biographies }, { data: editing }] = await Promise.all([
    sb.from("biographies")
      .select("id, full_name, display_name, date_of_birth, birthplace, updated_at")
      .order("updated_at", { ascending: false }).limit(100),
    edit
      ? sb.from("biographies")
          .select("id, full_name, display_name, date_of_birth, date_of_death, birthplace, bio")
          .eq("id", Number(edit)).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);
  const rows = biographies ?? [];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-serif text-4xl text-neutral-900">Biographies</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Shared life details for everyone in the archive: name, dates, birthplace and bio.
        </p>
      </header>

      <section className="rounded-xl border border-neutral-200 bg-[#fbfaf6]">
        <table className="w-full text-sm">
          <thead className="bg-neutral-100 text-left text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-2 py-2">Born</th>
              <th className="px-2 py-2">Birthplace</th>
              <th className="px-2 py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-neutral-500">
                  No biographies yet. Add the first one below.
                </td>
              </tr>
            )}
            {rows.map((p) => (
              <tr key={p.id} className="border-t border-neutral-200">
                <td className="px-4 py-2.5 font-medium">{p.full_name}</td>
                <td className="px-2 py-2.5">{p.date_of_birth ?? "—"}</td>
                <td className="px-2 py-2.5">{p.birthplace ?? "—"}</td>
                <td className="px-2 py-2.5 text-right">
                  <Link href={`/biographies?edit=${p.id}#form`} className="mr-3 text-sm underline">Edit</Link>
                  <DeletePersonButton id={p.id} name={p.full_name} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section id="form">
        <h2 className="mb-3 font-serif text-2xl text-neutral-900">
          {editing ? "Edit biography" : "New biography"}
        </h2>
        <div className="max-w-2xl rounded-xl border border-neutral-200 bg-[#fbfaf6] p-5">
          <BiographiesForm biography={editing} />
        </div>
      </section>
    </div>
  );
}