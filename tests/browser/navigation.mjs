import { setTheme } from "./harness.mjs";

export default async function run({ browser, base, check }) {
  const b = browser;
  const ctx = await b.newContext({ viewport: { width: 390, height: 800 }, isMobile: true, hasTouch: true });
  const errs = [];
  // Each scenario starts on a fresh page in the same context (saved progress carries over in localStorage),
  // so none depends on the history stack an earlier scenario left behind.
  let p = null;
  const fresh = async () => {
    if (p) await p.close();
    p = await ctx.newPage();
    p.on("pageerror", (e) => errs.push(e.message));
  };
  await fresh();
  const topUnit = () => p.evaluate(() => [...document.querySelectorAll("[data-unit]")].find((e) => e.getBoundingClientRect().bottom > 130)?.id);
  const saved = () => p.evaluate(() => JSON.parse(localStorage.getItem("zaibaitech.library.progress.akhdari") || "{}").lastUnitId);

  // establish saved position
  await p.goto(base + "/books/akhdari/read#tayammum.p03", { waitUntil: "networkidle" });
  await p.waitForTimeout(1200);
  check("setup: landing on a hash records position", (await saved()) === "tayammum.p03", await saved());

  // Back after contents jump
  await p.getByRole("button", { name: /^Contents/ }).click();
  await p.getByRole("dialog").getByRole("button", { name: /Prayer times/ }).first().click();
  await p.waitForTimeout(900);
  const afterJump = await topUnit();
  await p.evaluate(() => performance.getEntriesByType("navigation").length);
  await p.goBack();
  await p.waitForTimeout(1200);
  const afterBack = await topUnit();
  check("history: Back after contents jump returns to previous passage", afterBack === "tayammum.p03", `${afterJump} -> ${afterBack} (URL after Back: ${new URL(p.url()).hash})`);
  check("history: Back did not reload the page", (await p.evaluate(() => performance.getEntriesByType("navigation")[0].type)) !== "reload");
  await p.goForward();
  await p.waitForTimeout(1200);
  check("history: Forward returns to the jump target", (await topUnit()) === afterJump, `${await topUnit()}`);
  // Leave the way a reader does, by the toolbar's back link. A crash here would be a real Safari problem.
  try {
    await p.locator("header.sticky").getByRole("link", { name: /^Back to / }).click();
    await p.waitForURL(/\/books\/akhdari$/, { timeout: 10000 });
    check("history: leaving the reader after Back and Forward works", true);
  } catch (error) {
    check("history: leaving the reader after Back and Forward works", false, String(error?.message ?? error).split("\n")[0]);
  }

  // invalid hash keeps saved position
  await fresh();
  await p.goto(base + "/books/akhdari/read#tayammum.p03", { waitUntil: "networkidle" }); await p.waitForTimeout(1000);
  await p.goto(base + "/books/akhdari");
  await p.goto(base + "/books/akhdari/read#no_such_passage.9", { waitUntil: "networkidle" });
  await p.waitForTimeout(1300);
  check("invalid hash: falls back to saved passage", (await topUnit()) === "tayammum.p03", await topUnit());
  check("invalid hash: saved position not overwritten", (await saved()) === "tayammum.p03", await saved());

  // malformed hash
  await fresh();
  await p.goto(base + "/books/akhdari");
  await p.goto(base + "/books/akhdari/read#%E0%A4%A", { waitUntil: "networkidle" });
  await p.waitForTimeout(1200);
  check("malformed hash: no crash, restores saved", (await topUnit()) === "tayammum.p03" && errs.length === 0, `${await topUnit()} ${errs.join("|")}`);

  // empty chapter
  await fresh();
  await p.goto(base + "/books/akhdari");
  await p.goto(base + "/books/akhdari/read#salah_title", { waitUntil: "networkidle" });
  await p.waitForTimeout(1200);
  const st = await p.evaluate(() => Math.round(document.getElementById("salah_title").getBoundingClientRect().top));
  check("empty chapter hash: scrolls to its heading", st >= 0 && st < 300, String(st));

  // focus returns after sheet escape; tab trap
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(300);
  const opener = p.getByRole("button", { name: "Search this book" });
  await opener.focus(); await p.keyboard.press("Enter");
  check("sheet: focus moves into search box", (await p.evaluate(() => document.activeElement?.id)) === "reader-search");
  for (let i = 0; i < 12; i++) await p.keyboard.press("Tab");
  check("sheet: Tab stays inside dialog", await p.evaluate(() => !!document.activeElement?.closest("[role=dialog]")));
  await p.keyboard.press("Escape");
  await p.waitForTimeout(200);
  check("sheet: Escape restores focus to opener", (await p.evaluate(() => document.activeElement?.getAttribute("aria-label"))) === "Search this book");

  // accessible names unique
  const dup = await p.evaluate(() => { const n = [...document.querySelectorAll("button[aria-label^='Bookmark ']")].map((b) => b.getAttribute("aria-label")); return n.length - new Set(n).size; });
  check("a11y: bookmark button names are unique", dup === 0, `dups=${dup}`);
  const unnamed = await p.evaluate(() => [...document.querySelectorAll("button, a, select, input")].filter((e) => !(e.getAttribute("aria-label") || e.textContent.trim() || e.labels?.length)).length);
  check("a11y: every control has a name", unnamed === 0, String(unnamed));

  // stale bookmark ignored
  await p.evaluate(() => localStorage.setItem("zaibaitech.library.bookmarks.akhdari", JSON.stringify(["gone.1", "tayammum.2"])));
  await p.reload({ waitUntil: "networkidle" });
  check("bookmarks: stale ids not counted", (await p.getByRole("button", { name: /^Bookmarks, 1 saved/ }).count()) === 1);

  // theme persists
  await setTheme(p, "Dark");
  await p.goto(base + "/", { waitUntil: "networkidle" });
  check("theme: dark persists to home page", await p.evaluate(() => document.documentElement.classList.contains("dark")));
  check("no page errors", errs.length === 0, errs.join("|"));
}
