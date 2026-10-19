import { createAdminClient } from "@/lib/supabase/admin";
import PersonForm from "@/components/people/PersonForm";
import DeletePersonButton from "@/components/people/DeletePersonButton";

export default async function PeoplePage() {
  const { data: people } = await createAdminClient()
    .from("people")
    .select("id, full_name, display_name, date_of_birth, birthplace, updated_at")
    .order("updated_at", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-serif text-4xl text-neutral-900">People</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Everyone in the archive. Link a person to a player or head coach record afterwards.
        </p>
      </header>

      <section className="rounded-xl border border-neutral-200 bg-[#fbfaf6]">
        <table className="w-full text-sm">
          <thead className="bg-neutral-100 text-left text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-4 py-2">Name</th><th className="px-2 py-2">Born</th>
              <th className="px-2 py-2">Birthplace</th><th className="px-2 py-2" />
            </tr>
          </thead>
          <tbody>
            {(people ?? []).length === 0 && (
              <tr><td colSpan={4} className="px-4 py-12 text-center text-neutral-500">No people yet. Add the first one below.</td></tr>
            )}
            {(people ?? []).map((p) => (
              <tr key={p.id} className="border-t border-neutral-200">
                <td className="px-4 py-2.5 font-medium">{p.full_name}</td>
                <td className="px-2 py-2.5">{p.date_of_birth ?? "—"}</td>
                <td className="px-2 py-2.5">{p.birthplace ?? "—"}</td>
                <td className="px-2 py-2.5 text-right"><DeletePersonButton id={p.id} name={p.full_name} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="mb-3 font-serif text-2xl text-neutral-900">New person</h2>
        <div className="rounded-xl border border-neutral-200 bg-[#fbfaf6] p-5 max-w-2xl">
          <PersonForm />
        </div>
      </section>
    </div>
  );
}