type Nat = { name: string; demonym: string | null; is_historical: boolean } | null | undefined;

// "Brazilian" (falls back to the country name), plus a tag for states that no longer exist
export default function NationalityTag({ nationality }: { nationality: Nat }) {
  if (!nationality) return <>—</>;
  return (
    <>
      {nationality.demonym || nationality.name}
      {nationality.is_historical && (
        <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-800">
          Historical
        </span>
      )}
    </>
  );
}