"use client";

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import {
  FONT_SCALES,
  SETTINGS_KEY,
  TRANSLATION_SCALES,
  defaultSettings,
  loadSettings,
  saveSettings,
  type ReaderSettings,
} from "@/lib/storage";

type Resolved = "light" | "dark";

type SettingsContextValue = {
  settings: ReaderSettings;
  resolved: Resolved;
  ready: boolean;
  setTheme: (theme: ReaderSettings["theme"]) => void;
  cycleTheme: () => void;
  setFontScale: (fontScale: number) => void;
  setTranslationScale: (translationScale: number) => void;
  setVowelled: (vowelled: boolean) => void;
  setMode: (mode: string) => void;
  fontSize: string;
  translationFontSize: string;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export const themeBootScript = `
try {
  var raw = localStorage.getItem(${JSON.stringify(SETTINGS_KEY)});
  var stored = raw ? JSON.parse(raw) : {};
  var theme = stored.theme || "system";
  var dark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  var root = document.documentElement;
  root.classList.toggle("dark", dark);
  root.classList.toggle("light", !dark);
  root.classList.toggle("sepia", theme === "sepia");
  root.style.colorScheme = dark ? "dark" : "light";
} catch (e) {}
`;

/** Sepia is a light scheme with its own paper and ink (html.sepia). */
function resolveTheme(theme: ReaderSettings["theme"]): Resolved {
  if (theme === "dark") return "dark";
  if (theme === "light" || theme === "sepia") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: ReaderSettings["theme"]) {
  const resolved = resolveTheme(theme);
  const root = document.documentElement;
  root.classList.toggle("dark", resolved === "dark");
  root.classList.toggle("light", resolved === "light");
  root.classList.toggle("sepia", theme === "sepia");
  root.style.colorScheme = resolved;
  return resolved;
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<ReaderSettings>(defaultSettings);
  const [resolved, setResolved] = useState<Resolved>("light");
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    const loaded = loadSettings();
    setSettings(loaded);
    setResolved(applyTheme(loaded.theme));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || settings.theme !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setResolved(applyTheme("system"));
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [ready, settings.theme]);

  const value = useMemo<SettingsContextValue>(() => {
    const update = (next: ReaderSettings) => {
      setSettings(next);
      saveSettings(next);
      setResolved(applyTheme(next.theme));
    };
    return {
      settings,
      resolved,
      ready,
      fontSize: `${FONT_SCALES[settings.fontScale]}rem`,
      translationFontSize: `${TRANSLATION_SCALES[settings.translationScale]}rem`,
      setTheme: (theme) => update({ ...settings, theme }),
      cycleTheme: () => {
        const order: ReaderSettings["theme"][] = ["system", "light", "sepia", "dark"];
        const next = order[(order.indexOf(settings.theme) + 1) % order.length];
        update({ ...settings, theme: next });
      },
      setFontScale: (fontScale) =>
        update({
          ...settings,
          fontScale: Math.min(FONT_SCALES.length - 1, Math.max(0, fontScale)),
        }),
      setTranslationScale: (translationScale) =>
        update({
          ...settings,
          translationScale: Math.min(TRANSLATION_SCALES.length - 1, Math.max(0, translationScale)),
        }),
      setVowelled: (vowelled) => update({ ...settings, vowelled }),
      setMode: (mode) => update({ ...settings, mode }),
    };
  }, [ready, resolved, settings]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const value = useContext(SettingsContext);
  if (!value) throw new Error("useSettings must be used inside SettingsProvider");
  return value;
}
