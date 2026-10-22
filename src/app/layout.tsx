import type { Metadata, Viewport } from "next";
import { Amiri, Fraunces, Outfit, Scheherazade_New } from "next/font/google";
import Script from "next/script";
import { AppFrame } from "@/components/app-frame";
import { SettingsProvider, themeBootScript } from "@/components/settings-provider";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  // Optical sizing lets the same face serve headings and the English reading text.
  axes: ["opsz"],
  variable: "--font-display",
  display: "swap",
});

const amiri = Amiri({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  variable: "--font-amiri",
  display: "swap",
});

const scheherazade = Scheherazade_New({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  variable: "--font-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Zaibaitech Library",
    template: "%s · Zaibaitech Library",
  },
  description:
    "A reading room for classical Islamic manuals. Mukhtasar al-Akhdari, in Arabic.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f5ee" },
    { media: "(prefers-color-scheme: dark)", color: "#111412" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${outfit.variable} ${fraunces.variable} ${amiri.variable} ${scheherazade.variable}`}
    >
      <body className="font-sans antialiased">
        <Script id="theme-boot" strategy="beforeInteractive">
          {themeBootScript}
        </Script>
        <SettingsProvider>
          <AppFrame>{children}</AppFrame>
        </SettingsProvider>
      </body>
    </html>
  );
}
