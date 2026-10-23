import test from "node:test";
import assert from "node:assert/strict";
import * as s from "../src/lib/storage";

const store = new Map<string, string>();
(globalThis as unknown as { window: unknown }).window = {
  localStorage: {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  },
};

test("settings default, clamp, and survive corrupt data", () => {
  store.clear();
  assert.equal(s.loadSettings().fontScale, s.defaultSettings.fontScale);
  store.set(s.SETTINGS_KEY, JSON.stringify({ fontScale: 99, translationScale: -3, theme: "bogus", mode: 4 }));
  const loaded = s.loadSettings();
  assert.equal(loaded.fontScale, s.FONT_SCALES.length - 1);
  assert.equal(loaded.translationScale, 0);
  assert.equal(loaded.theme, "system");
  assert.equal(loaded.mode, "arabic");
  store.set(s.SETTINGS_KEY, "{not json");
  assert.equal(s.loadSettings().vowelled, true);
});

test("settings round-trip", () => {
  s.saveSettings({ theme: "dark", fontScale: 4, translationScale: 2, vowelled: false, mode: "both:en-x" });
  assert.deepEqual(s.loadSettings(), { theme: "dark", fontScale: 4, translationScale: 2, vowelled: false, mode: "both:en-x" });
});

test("progress, bookmarks and recents", () => {
  store.clear();
  assert.equal(s.loadProgress("akhdari").lastUnitId, null);
  assert.deepEqual(s.loadRecentBooks(["akhdari"]), []);
  s.saveProgress("akhdari", { seen: ["a.1"], lastUnitId: "a.1", updatedAt: 5 });
  s.saveProgress("other", { seen: [], lastUnitId: "b.1", updatedAt: 9 });
  assert.deepEqual(s.loadRecentBooks(["akhdari", "other"]).map((r) => r.bookId), ["other", "akhdari"]);
  s.saveBookmarks("akhdari", ["a.1", "a.2"]);
  assert.deepEqual(s.loadBookmarks("akhdari"), ["a.1", "a.2"]);
  store.set(s.bookmarkKey("akhdari"), JSON.stringify({ not: "array" }));
  assert.deepEqual(s.loadBookmarks("akhdari"), []);
  s.clearBookLocalData("akhdari");
  assert.equal(s.loadProgress("akhdari").lastUnitId, null);
});
