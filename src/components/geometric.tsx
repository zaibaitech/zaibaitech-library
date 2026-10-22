import { useId } from "react";
import { cn } from "@/lib/cn";

export function StarMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M16 2.5 18.7 11l8.4-2.6L21.2 15 29 18l-7.8 2.6 5.9 6.4-8.4-2.6L16 29.5l-2.7-8.5-8.4 2.6L10.8 18 3 15l7.8-3 5.9-6.6z"
      />
    </svg>
  );
}

export function GeometricBackdrop({ className }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg className={cn("pointer-events-none", className)} aria-hidden="true">
      <defs>
        <pattern id={id} width="72" height="72" patternUnits="userSpaceOnUse">
          <path
            d="M36 6l3.2 10.2 10.6-3.4-6.6 8.2 9.2 3-9.2 3 6.6 8.2-10.6-3.4L36 66l-3.2-10.2-10.6 3.4 6.6-8.2-9.2-3 9.2-3-6.6-8.2 10.6 3.4z"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.8"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/**
 * An eight-point rosette: two interlaced squares, an inner star and a ring.
 * Drawn for this library; used as the chapter ornament.
 */
export function Rosette({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" fill="none" stroke="currentColor">
      <rect x="14" y="14" width="36" height="36" strokeWidth="1.6" />
      <rect x="14" y="14" width="36" height="36" strokeWidth="1.6" transform="rotate(45 32 32)" />
      <circle cx="32" cy="32" r="11" strokeWidth="1.2" />
      <path
        d="M32 21.5 34.6 29.4 42.5 32 34.6 34.6 32 42.5 29.4 34.6 21.5 32 29.4 29.4Z"
        fill="currentColor"
        fillOpacity="0.35"
        strokeWidth="1"
      />
      <circle cx="32" cy="32" r="2.4" fill="currentColor" stroke="none" />
      <circle cx="32" cy="32" r="29" strokeWidth="0.8" strokeDasharray="2 3" />
    </svg>
  );
}
