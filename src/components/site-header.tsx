"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Search, Sun } from "lucide-react";
import { cn } from "@/lib/cn";
import { Rosette } from "./geometric";
import { isActiveLink, navLinks } from "./nav-links";
import { useSettings } from "./settings-provider";

export function SiteHeader() {
  const { resolved, settings, cycleTheme } = useSettings();
  const pathname = usePathname();
  const themeName = settings.theme === "system" ? `system (${resolved})` : settings.theme;

  return (
    <header className="no-print border-b border-line bg-paper">
      <div className="mx-auto flex max-w-page items-center justify-between gap-3 px-4 py-3 sm:px-8 sm:py-4">
        <Link href="/" className="flex min-w-0 items-center gap-3 rounded-sm text-ink">
          <Rosette className="h-10 w-10 shrink-0 text-gold sm:h-11 sm:w-11" />
          <span className="min-w-0">
            <span className="block truncate font-display text-xl tracking-tight [font-variant-caps:small-caps] sm:text-2xl">
              Zaibaitech Library
            </span>
            <span className="block truncate text-[0.68rem] font-medium uppercase tracking-[0.24em] text-gold">
              Classical texts
            </span>
          </span>
        </Link>
        <div className="flex shrink-0 items-center gap-2">
          <nav aria-label="Main" className="mr-3 hidden items-center gap-1 md:flex">
            {navLinks.map((link) => {
              const active = isActiveLink(link.href, pathname);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm transition-colors motion-reduce:transition-none",
                    active
                      ? "font-medium text-ink underline decoration-emerald decoration-2 underline-offset-[10px]"
                      : "text-muted hover:text-ink",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <Link href="/library#search" aria-label="Search the library" title="Search the library" className="round-btn">
            <Search className="h-[18px] w-[18px]" aria-hidden />
          </Link>
          <button
            type="button"
            onClick={cycleTheme}
            aria-label={`Colour theme: ${themeName}. Change theme.`}
            title="Change colour theme"
            className="round-btn"
          >
            {resolved === "dark" ? <Moon className="h-[18px] w-[18px]" aria-hidden /> : <Sun className="h-[18px] w-[18px]" aria-hidden />}
          </button>
        </div>
      </div>
    </header>
  );
}
