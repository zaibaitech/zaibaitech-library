"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { TabBar } from "./tab-bar";

export function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const fullScreenReader = /^\/books\/[^/]+\/read$/.test(pathname);

  if (fullScreenReader) {
    return <div className="min-h-dvh bg-paper">{children}</div>;
  }

  return (
    // Bottom padding on phones keeps the footer clear of the fixed tab bar.
    <div className="flex min-h-screen flex-col pb-[calc(64px+env(safe-area-inset-bottom))] md:pb-0">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <TabBar />
    </div>
  );
}
