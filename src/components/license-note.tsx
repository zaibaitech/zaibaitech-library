import { TEXT_CREDIT } from "@/content/books";
import { studyToolsEnabled } from "@/lib/flags";
import { cn } from "@/lib/cn";

export function LicenseNote({ className }: { className?: string }) {
  return (
    <p className={cn("text-sm leading-relaxed text-muted [overflow-wrap:anywhere]", className)}>
      <a className="font-medium text-ink underline decoration-gold/60 underline-offset-4" href={TEXT_CREDIT.href}>
        {TEXT_CREDIT.label}
      </a>
      . OpenITI {TEXT_CREDIT.openiti}.{" "}
      {studyToolsEnabled
        ? "English on this site names chapters, glossary words, and practice steps. It is not a translation of the book."
        : "English on this site names the book and its chapters. It is not a translation of the book."}
    </p>
  );
}
