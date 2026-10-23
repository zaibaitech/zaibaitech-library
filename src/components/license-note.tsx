import Link from "next/link";
import { TEXT_CREDIT } from "@/content/books";
import { cn } from "@/lib/cn";

/** Short source credit for shared surfaces. Each book's page carries its full source and translation credits. */
export function LicenseNote({ className }: { className?: string }) {
  return (
    <p className={cn("text-sm leading-relaxed text-muted [overflow-wrap:anywhere]", className)}>
      <a className="link" href={TEXT_CREDIT.href}>
        {TEXT_CREDIT.label}
      </a>
      . Translations are credited on each book&apos;s page and in{" "}
      <Link href="/about" className="link">
        Sources and licensing
      </Link>
      .
    </p>
  );
}
