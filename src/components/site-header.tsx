"use client";

import Link from "next/link";
import { Moon, Sun } from "lucide-react";
import { studyToolsEnabled } from "@/lib/flags";
import { StarMark } from "./geometric";
import { useSettings } from "./settings-provider";

export function SiteHeader() {
  const { resolved, settings, cycleTheme } = useSettings();
  const themeLabel =
    settings.theme === "system"
      ? `Theme follows the system, currently ${resolved}. Switch theme.`
      : `Theme is ${settings.theme}. Switch theme.`;

  return (
    <header className="no-print sticky top-0 z-40 border-b border-line/80 bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2.5 text-ink">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald text-[#f6f1e6]">
            <StarMark className="h-4 w-4" />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-lg tracking-tight">Zaibaitech</span>
            <span className="block text-[0.68rem] uppercase tracking-[0.18em] text-muted">Library</span>
          </span>
        </Link>
        <nav className="flex items-center gap-0.5 text-sm sm:gap-2">
          <Link href="/" className="rounded-full px-2 py-2 text-ink hover:bg-gold-soft sm:px-3">
            Shelf
          </Link>
          {studyToolsEnabled ? (
            <Link href="/glossary" className="rounded-full px-2 py-2 text-ink hover:bg-gold-soft sm:px-3">
              Glossary
            </Link>
          ) : null}
          <button
            type="button"
            onClick={cycleTheme}
            aria-label={themeLabel}
            className="ml-0.5 inline-flex h-10 items-center gap-1.5 rounded-full border border-line bg-paper-2 px-2.5 text-sm text-ink sm:px-3"
          >
            {resolved === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            <span>{settings.theme === "system" ? "System" : settings.theme === "dark" ? "Dark" : "Light"}</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
