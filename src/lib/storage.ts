export type ReaderSettings = {
  theme: "light" | "dark" | "system";
  /** Index into the reader font scale. */
  fontScale: number;
  vowelled: boolean;
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
  vowelled: true,
};

export const FONT_SCALES = [1.05, 1.22, 1.4, 1.62, 1.88];

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
    theme: stored.theme ?? "system",
    fontScale: Math.min(FONT_SCALES.length - 1, Math.max(0, stored.fontScale ?? 2)),
    vowelled: stored.vowelled ?? true,
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

export function clearBookLocalData(bookId: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(progressKey(bookId));
  window.localStorage.removeItem(bookmarkKey(bookId));
  window.localStorage.removeItem(practiceKey(bookId));
}
