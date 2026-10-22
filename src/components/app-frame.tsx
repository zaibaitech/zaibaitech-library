"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

export function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const fullScreenReader = /^\/books\/[^/]+\/read$/.test(pathname);

  if (fullScreenReader) {
    return <div className="min-h-dvh bg-paper">{children}</div>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
