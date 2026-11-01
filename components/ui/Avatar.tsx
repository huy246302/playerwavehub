"use client";
import { useEffect, useRef, useState } from "react";

const SIZES = {
  xs: "h-6 w-6", sm: "h-9 w-9", md: "h-12 w-12", lg: "h-16 w-16", xl: "h-24 w-24",
} as const;

// A round profile picture. If there is no photo, or the link is broken, it shows a
// neutral person silhouette instead (the name is always written next to it, so the
// picture itself is decorative).
export default function Avatar({
  src, size = "sm", className = "",
}: { src?: string | null; size?: keyof typeof SIZES; className?: string }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const ref = useRef<HTMLImageElement>(null);

  // an image that already failed before the page finished loading never fires onError
  useEffect(() => {
    const img = ref.current;
    if (src && img && img.complete && img.naturalWidth === 0) setFailedSrc(src);
  }, [src]);

  const ring = SIZES[size] + " shrink-0 rounded-full border border-neutral-200 " + className;

  if (!src || failedSrc === src) {
    return (
      <span className={ring + " inline-flex items-center justify-center overflow-hidden bg-[#e4eee8] text-[#8fb09f]"} aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-[72%] w-[72%] translate-y-[10%]" data-placeholder="true">
          <circle cx="12" cy="8.2" r="4.3" />
          <path d="M3.2 22c0-4.9 3.9-8.2 8.8-8.2s8.8 3.3 8.8 8.2z" />
        </svg>
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img ref={ref} src={src} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer"
      onError={() => setFailedSrc(src)} className={ring + " object-cover object-top"} />
  );
}
