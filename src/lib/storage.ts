export type ReaderSettings = {
  theme: "light" | "dark" | "system";
  /** Index into ARABIC_SCALES. */
  fontScale: number;
  /** Index into TRANSLATION_SCALES. */
  translationScale: number;
  vowelled: boolean;
  /** Reading mode key, see `modeKey` in translations.ts. */
  mode: string;
};

export type ReadingProgress = {
  seen: string[];
  lastUnitId: string | null;
  updatedAt: number;
};

export type PracticeRecord = {
  drills: Record<string, { solved: boolean; attempts: number }>;
  quizzes: Record<string, { best: number; total: number; updatedAt: number }>;
};

export const SETTINGS_KEY = "zaibaitech.library.settings";

const emptyProgress = (): ReadingProgress => ({
  seen: [],
  lastUnitId: null,
  updatedAt: 0,
});

const emptyPractice = (): PracticeRecord => ({ drills: {}, quizzes: {} });

export const defaultSettings: ReaderSettings = {
  theme: "system",
  fontScale: 2,
  translationScale: 1,
  vowelled: true,
  mode: "arabic",
};

/** rem sizes for Arabic text. The default (index 2) is deliberately large. */
export const FONT_SCALES = [1.4, 1.65, 1.9, 2.2, 2.55, 2.95];
/** rem sizes for translation text. */
export const TRANSLATION_SCALES = [0.95, 1.05, 1.2, 1.35, 1.55];

function clampIndex(value: unknown, length: number, fallback: number) {
  const n = typeof value === "number" && Number.isFinite(value) ? Math.round(value) : fallback;
  return Math.min(length - 1, Math.max(0, n));
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) } as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode or a full disk — reading still works */
  }
}

export function loadSettings(): ReaderSettings {
  const stored = readJson(SETTINGS_KEY, defaultSettings);
  return {
    theme: stored.theme === "light" || stored.theme === "dark" ? stored.theme : "system",
    fontScale: clampIndex(stored.fontScale, FONT_SCALES.length, defaultSettings.fontScale),
    translationScale: clampIndex(
      stored.translationScale,
      TRANSLATION_SCALES.length,
      defaultSettings.translationScale,
    ),
    vowelled: stored.vowelled ?? true,
    mode: typeof stored.mode === "string" ? stored.mode : "arabic",
  };
}

export function saveSettings(settings: ReaderSettings) {
  writeJson(SETTINGS_KEY, settings);
}

export function progressKey(bookId: string) {
  return `zaibaitech.library.progress.${bookId}`;
}

export function loadProgress(bookId: string): ReadingProgress {
  const stored = readJson(progressKey(bookId), emptyProgress());
  return {
    seen: Array.isArray(stored.seen) ? stored.seen : [],
    lastUnitId: stored.lastUnitId ?? null,
    updatedAt: stored.updatedAt ?? 0,
  };
}

export function saveProgress(bookId: string, progress: ReadingProgress) {
  writeJson(progressKey(bookId), progress);
}

export function bookmarkKey(bookId: string) {
  return `zaibaitech.library.bookmarks.${bookId}`;
}

export function loadBookmarks(bookId: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(bookmarkKey(bookId));
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

export function saveBookmarks(bookId: string, unitIds: string[]) {
  writeJson(bookmarkKey(bookId), unitIds);
}

export function practiceKey(bookId: string) {
  return `zaibaitech.library.practice.${bookId}`;
}

export function loadPractice(bookId: string): PracticeRecord {
  const stored = readJson(practiceKey(bookId), emptyPractice());
  return {
    drills: stored.drills ?? {},
    quizzes: stored.quizzes ?? {},
  };
}

export function savePractice(bookId: string, record: PracticeRecord) {
  writeJson(practiceKey(bookId), record);
}

/** Books with saved progress, most recently read first. */
export function loadRecentBooks(bookIds: string[]) {
  return bookIds
    .map((bookId) => ({ bookId, progress: loadProgress(bookId) }))
    .filter((item) => item.progress.lastUnitId && item.progress.updatedAt > 0)
    .sort((a, b) => b.progress.updatedAt - a.progress.updatedAt);
}

export function clearBookLocalData(bookId: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(progressKey(bookId));
  window.localStorage.removeItem(bookmarkKey(bookId));
  window.localStorage.removeItem(practiceKey(bookId));
}
