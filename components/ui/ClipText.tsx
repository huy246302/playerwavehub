import { clip, COUNTRY_NAME_MAX } from "@/lib/names";

// Shows the text cut after `max` characters with "…"; the full text appears on hover.
export default function ClipText({ text, max = COUNTRY_NAME_MAX }: { text: string; max?: number }) {
  const short = clip(text, max);
  return <span title={short !== text ? text : undefined}>{short}</span>;
}
