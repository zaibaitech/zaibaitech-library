"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Moon, Sun, X } from "lucide-react";
import { glossaryEnabled } from "@/lib/flags";
import { cn } from "@/lib/cn";
import { StarMark } from "./geometric";
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
  const themeName = settings.theme === "system" ? "System" : settings.theme === "dark" ? "Dark" : "Light";

  useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="no-print sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <Link href="/" className="flex items-center gap-2.5 text-ink">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald text-[#f6f1e6]">
            <StarMark className="h-4 w-4" />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-lg tracking-tight">Zaibaitech</span>
            <span className="block text-[0.65rem] uppercase tracking-[0.18em] text-muted">Library</span>
          </span>
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-1 text-sm sm:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={cn(
                "rounded-full px-3 py-2 text-ink hover:bg-gold-soft/60",
                isActive(link.href) && "bg-gold-soft/70 font-medium",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={cycleTheme}
            aria-label={`Theme: ${themeName}${settings.theme === "system" ? ` (${resolved})` : ""}. Change theme.`}
            className="tool-btn"
          >
            {resolved === "dark" ? <Moon className="h-4 w-4" aria-hidden /> : <Sun className="h-4 w-4" aria-hidden />}
            <span className="hidden sm:inline">{themeName}</span>
          </button>
          <button
            type="button"
            className="tool-btn sm:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="h-4 w-4" aria-hidden /> : <Menu className="h-4 w-4" aria-hidden />}
          </button>
        </div>
      </div>
      {open ? (
        <nav id="mobile-nav" aria-label="Main" className="border-t border-line px-4 py-2 sm:hidden">
          <ul>
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className="flex min-h-12 items-center text-base text-ink"
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
