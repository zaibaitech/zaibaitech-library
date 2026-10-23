"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { isActiveLink, navLinks } from "./nav-links";

/** The phone navigation: the site's sections as a tab bar fixed to the bottom of the screen. */
export function TabBar() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Main"
      className="no-print fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper-2/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <ul className="mx-auto flex max-w-lg">
        {navLinks.map(({ href, label, icon: Icon }) => {
          const active = isActiveLink(href, pathname);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex min-h-[64px] flex-col items-center justify-center gap-1 text-xs transition-colors motion-reduce:transition-none",
                  active ? "font-medium text-emerald" : "text-muted hover:text-ink",
                )}
              >
                {active ? <span aria-hidden className="absolute top-0 h-[3px] w-8 rounded-b-full bg-gold" /> : null}
                <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.2 : 1.8} aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
