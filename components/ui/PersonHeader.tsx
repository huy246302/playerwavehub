import type { ReactNode } from "react";
import Avatar from "@/components/ui/Avatar";
import { PageHeader } from "@/components/ui/kit";

// The normal page header with the person's picture in front of the title.
export default function PersonHeader({
  photoUrl, ...header
}: { photoUrl?: string | null; title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="flex items-start gap-4">
      <Avatar src={photoUrl} size="lg" className="mt-1" />
      <div className="min-w-0 flex-1">
        <PageHeader {...header} />
      </div>
    </div>
  );
}
