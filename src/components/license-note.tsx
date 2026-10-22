import { TEXT_CREDIT } from "@/content/books";
import { cn } from "@/lib/cn";

export function LicenseNote({ className }: { className?: string }) {
  return (
    <p className={cn("text-sm leading-relaxed text-muted [overflow-wrap:anywhere]", className)}>
      <a className="font-medium text-ink underline decoration-gold/60 underline-offset-4" href={TEXT_CREDIT.href}>
        {TEXT_CREDIT.label}
      </a>
      . OpenITI {TEXT_CREDIT.openiti}. English on this site names books, chapters and glossary words. It is not a
      translation of the book text.
    </p>
  );
}
