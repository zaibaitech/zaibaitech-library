import { BookA, House, LibraryBig, ScrollText, type LucideIcon } from "lucide-react";
import { glossaryEnabled } from "@/lib/flags";

/** The site's sections, shared by the desktop header and the mobile tab bar. */
export const navLinks: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/", label: "Home", icon: House },
  { href: "/library", label: "Library", icon: LibraryBig },
  ...(glossaryEnabled ? [{ href: "/glossary", label: "Glossary", icon: BookA }] : []),
  { href: "/about", label: "Sources", icon: ScrollText },
];

/** Book pages belong to the Library section. */
export function isActiveLink(href: string, pathname: string) {
  if (href === "/") return pathname === "/";
  if (href === "/library") return pathname.startsWith("/library") || pathname.startsWith("/books");
  return pathname.startsWith(href);
}
