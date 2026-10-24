/**
 * The site's public address, for absolute links in link previews, the sitemap and robots.txt. Vercel provides the
 * production domain to every build; elsewhere (local builds, CI) the current production address is used.
 */
export const SITE_URL = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL ?? "zaibaitech-library.vercel.app"}`;

export const SITE_NAME = "Zaibaitech Library";

export const SITE_DESCRIPTION =
  "A reading room for Islamic books: Mukhtasar al-Akhdari in Arabic, and the three books of Omar Ceesay in English.";
