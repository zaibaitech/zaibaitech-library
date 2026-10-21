import type { Classification } from "@/content/types";
import { cn } from "@/lib/cn";

const copy: Record<Classification, { en: string; ar: string; className: string }> = {
  fard: { en: "Fard", ar: "فرض", className: "bg-emerald/15 text-emerald" },
  sunnah: { en: "Sunnah", ar: "سنة", className: "bg-gold/15 text-gold" },
  fadila: { en: "Fadila", ar: "فضيلة", className: "bg-clay/15 text-clay" },
  condition: { en: "Condition", ar: "شرط", className: "bg-water/15 text-water" },
  wajib: { en: "Wajib", ar: "وجوب", className: "bg-emerald/15 text-emerald" },
  recommended: { en: "Recommended", ar: "استحباب", className: "bg-gold/15 text-gold" },
};

export function ClassPill({ value }: { value: Classification }) {
  const item = copy[value];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        item.className,
      )}
    >
      <span>{item.en}</span>
      <span className="font-amiri text-sm" dir="rtl" lang="ar">
        {item.ar}
      </span>
    </span>
  );
}
