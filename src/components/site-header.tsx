"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Moon, Sun, X } from "lucide-react";
import { glossaryEnabled } from "@/lib/flags";
import { cn } from "@/lib/cn";
import { Rosette } from "./geometric";
import { useSettings } from "./settings-provider";

const links = [
  { href: "/", label: "Library" },
  ...(glossaryEnabled ? [{ href: "/glossary", label: "Glossary" }] : []),
  { href: "/about", label: "Sources" },
];

export function SiteHeader() {
  const { resolved, settings, cycleTheme } = useSettings();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const themeName = settings.theme === "system" ? `system (${resolved})` : settings.theme;

  useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" || pathname.startsWith("/books") : pathname.startsWith(href));

  return (
    <header className="no-print border-b border-line bg-paper">
      <div className="mx-auto flex h-16 max-w-page items-center justify-between gap-4 px-5 sm:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-2.5 rounded-sm text-ink">
          <Rosette className="h-6 w-6 shrink-0 text-gold" />
          <span className="truncate font-display text-lg tracking-tight">Zaibaitech Library</span>
        </Link>
        <div className="flex shrink-0 items-center gap-1">
          <nav aria-label="Main" className="mr-2 hidden items-center gap-1 sm:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-2 text-sm transition-colors motion-reduce:transition-none",
                  isActive(link.href)
                    ? "font-medium text-ink underline decoration-emerald decoration-2 underline-offset-[10px]"
                    : "text-muted hover:text-ink",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <button
            type="button"
            onClick={cycleTheme}
            aria-label={`Colour theme: ${themeName}. Change theme.`}
            title="Change colour theme"
            className="tool-btn !px-0"
          >
            {resolved === "dark" ? <Moon className="h-[18px] w-[18px]" aria-hidden /> : <Sun className="h-[18px] w-[18px]" aria-hidden />}
          </button>
          <button
            type="button"
            className="tool-btn !px-0 sm:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
          </button>
        </div>
      </div>
      {open ? (
        <nav id="mobile-nav" aria-label="Main" className="border-t border-line px-5 pb-3 pt-1 sm:hidden">
          <ul>
            {links.map((link) => (
              <li key={link.href} className="border-b border-line last:border-0">
                <Link
                  href={link.href}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={cn("flex min-h-12 items-center text-base", isActive(link.href) ? "font-medium text-ink" : "text-ink-2")}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
