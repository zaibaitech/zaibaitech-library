import { openDisplay, closeDisplay, setShow, setTheme, scrollDown, watchErrors } from "./harness.mjs";

export default async function run({ browser, base, check, screenshot }) {
  for (const w of [360, 390, 412]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 800 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const page = await ctx.newPage();
    // Console and page errors only, as before; a prefetch cancelled by the next goto is not one (see watchErrors).
    const watch = watchErrors(page, { requests: false });
    for (const [name, url] of [["home", "/"], ["book", "/books/akhdari"], ["risala", "/books/risala"], ["read", "/books/akhdari/read"], ["about", "/about"], ["glossary", "/glossary"]]) {
      await page.goto(base + url, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      check(`${w}px ${name}: no horizontal overflow`, over <= 0, `scrollWidth overflow=${over}`);
      if (w === 360 || name === "read") await screenshot(page, `${w}-${name}`, { fullPage: name !== "read" && name !== "glossary" });
    }
    const errors = watch.problems();
    check(`${w}px no console errors`, errors.length === 0, errors.join(" | "));
    await ctx.close();
  }

  // Reader behaviours at 390
  const ctx = await browser.newContext({ viewport: { width: 390, height: 800 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await page.goto(base + "/books/akhdari/read", { waitUntil: "networkidle" });
  await openDisplay(page);
  const showOpts = await page.getByRole("radiogroup", { name: "Show" }).getByRole("radio").allInnerTexts();
  check("reader: Show offers Arabic, Arabic + English, English", showOpts.join("|") === "Arabic|Arabic + English|English", showOpts.join("|"));
  await closeDisplay(page);
  await setShow(page, "Arabic + English");
  check("reader: credit line states the translation's recorded review", await page.getByText(/Reviewed for publication 22 October 2026/).isVisible());
  await setShow(page, "Arabic");
  check("reader: no English credit while only Arabic is shown", (await page.getByText(/Reviewed for publication/).count()) === 0);
  // toolbar overflow: any toolbar child beyond viewport?
  const tb = await page.evaluate(() => [...document.querySelectorAll('header button, header a')].filter(e => e.getBoundingClientRect().width > 0).map(e => Math.round(e.getBoundingClientRect().right)));
  check("reader: toolbar items inside 390px", tb.length >= 5 && tb.every(r => r <= 390), tb.join(","));
  const hdrH = await page.evaluate(() => document.querySelector("header").getBoundingClientRect().height);
  check("reader: header is one compact row", hdrH <= 70, String(Math.round(hdrH)));
  // font size
  const fs0 = await page.evaluate(() => getComputedStyle(document.querySelector(".arabic-text")).fontSize);
  await openDisplay(page);
  await page.getByRole("button", { name: "Larger Arabic text" }).click();
  const fs1 = await page.evaluate(() => getComputedStyle(document.querySelector(".arabic-text")).fontSize);
  check("reader: larger text works", parseFloat(fs1) > parseFloat(fs0), `${fs0}->${fs1}`);
  // tashkeel
  const t0 = await page.locator(".arabic-text").first().innerText();
  await page.getByRole("switch", { name: /Tashkīl/ }).click();
  const t1 = await page.locator(".arabic-text").first().innerText();
  check("reader: tashkil toggle changes text", t0 !== t1 && !/[ً-ْ]/.test(t1) && /[ً-ْ]/.test(t0));
  await page.getByRole("switch", { name: /Tashkīl/ }).click();
  await closeDisplay(page);
  // reload persists settings
  await page.reload({ waitUntil: "networkidle" });
  const fs2 = await page.evaluate(() => getComputedStyle(document.querySelector(".arabic-text")).fontSize);
  check("reader: font size persists", fs2 === fs1, fs2);
  // contents jump
  await page.getByRole("button", { name: /^Contents/ }).click();
  check("sheet: dialog opens", await page.getByRole("dialog").isVisible());
  await page.getByRole("button", { name: /Prayer times|Times of/i }).first().click().catch(() => {});
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: /^Contents/ }).click();
  await page.getByRole("dialog").getByRole("button", { name: /Tayammum/ }).first().click();
  await page.waitForTimeout(700);
  const hash = await page.evaluate(() => location.hash);
  const topChapter = await page.evaluate(() => { const el = document.getElementById("tayammum"); return Math.round(el.getBoundingClientRect().top); });
  check("contents: jumped to tayammum", hash.startsWith("#tayammum") && topChapter < 250 && topChapter > -50, `${hash} top=${topChapter}`);
  // scroll then progress saved + restored
  await scrollDown(page, 1500);
  await page.waitForTimeout(1200);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("zaibaitech.library.progress.akhdari") || "{}"));
  check("progress: saved while scrolling", !!saved.lastUnitId, saved.lastUnitId);
  const hashNow = await page.evaluate(() => location.hash.slice(1));
  check("progress: URL hash tracks position", hashNow === saved.lastUnitId, hashNow);
  // reopen bare URL -> restore
  const page2 = await ctx.newPage();
  await page2.goto(base + "/books/akhdari/read", { waitUntil: "networkidle" });
  await page2.waitForTimeout(1200);
  const topId = await page2.evaluate(() => { const els=[...document.querySelectorAll("[data-unit]")]; const y=130; const hit=els.find(e=>e.getBoundingClientRect().bottom>y); return hit?.id; });
  check("restore: bare URL reopens at saved passage", topId === saved.lastUnitId, `${topId} vs ${saved.lastUnitId}`);
  // hash wins
  await page2.goto(base + "/books/akhdari/read#basmala_hamdala.p01", { waitUntil: "networkidle" });
  await page2.waitForTimeout(800);
  check("restore: hash beats saved position", (await page2.evaluate(() => scrollY)) < 600);
  // home continue reading
  await page2.goto(base + "/", { waitUntil: "networkidle" });
  check("home: continue reading card links to the saved passage", (await page2.getByRole("heading", { name: "Continue reading" }).isVisible()) && (await page2.getByRole("link", { name: "Continue reading" }).count()) === 1 && /#.+/.test(await page2.getByRole("link", { name: "Continue reading" }).getAttribute("href")));
  await screenshot(page2, "390-home-continue");
  // bookmarks
  await page.goto(base + "/books/akhdari/read#wudu_faraid_sunan.p02", { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  await page.getByRole("button", { name: "Bookmark Wudu, passage 2" }).nth(0).scrollIntoViewIfNeeded();
  const btn = page.locator('#wudu_faraid_sunan\\.p02 button[aria-label="Bookmark Wudu, passage 2"]');
  await btn.click();
  check("bookmark: aria-pressed true", (await btn.getAttribute("aria-pressed")) === "true");
  await page.goto(base + "/books/akhdari/read", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /^Bookmarks/ }).click();
  await page.getByRole("button", { name: /Wudu · passage 2/ }).click();
  await page.waitForTimeout(700);
  const bmTop = await page.evaluate(() => Math.round(document.getElementById("wudu_faraid_sunan.p02").getBoundingClientRect().top));
  check("bookmark: navigates to correct passage", bmTop > 0 && bmTop < 300, String(bmTop));
  // search
  await page.getByRole("button", { name: "Search this book" }).click();
  await page.locator("#reader-search").fill("التيمم");
  await page.waitForTimeout(300);
  const found = await page.getByRole("status").filter({ hasText: "passage" }).first().innerText();
  check("search: results", /\d+ passages? found/.test(found), found);
  await page.keyboard.press("Escape");
  // back/forward
  await page.goto(base + "/books/akhdari", { waitUntil: "networkidle" });
  await page.goBack({ waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  check("history: back to reader keeps hash", (await page.evaluate(() => location.hash)).length > 1);
  // keyboard: tab order reaches toolbar with visible focus
  await page.goto(base + "/books/akhdari/read#basmala_hamdala.p01", { waitUntil: "networkidle" });
  await page.evaluate(() => scrollTo(0,0));
  for (let i = 0; i < 4; i++) await page.keyboard.press("Tab");
  const focusName = await page.evaluate(() => document.activeElement?.getAttribute("aria-label") || document.activeElement?.textContent);
  const outline = await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle);
  check("keyboard: focus visible", outline !== "none", `${focusName} / ${outline}`);
  // dark mode screenshot
  await setTheme(page, "Dark");
  await page.evaluate(() => scrollTo(0, 0));
  await screenshot(page, "390-read-dark");
  // font extremes: tashkeel clipping screenshot at largest
  await openDisplay(page);
  for (let i = 0; i < 6; i++) await page.getByRole("button", { name: "Larger Arabic text" }).click().catch(()=>{});
  await closeDisplay(page);
  await page.goto(base + "/books/akhdari/read#salah_faraid_sunan.p03", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await screenshot(page, "390-read-large");
  const ov = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  check("reader: largest size no overflow", ov <= 0, String(ov));
  // 404s
  const r = await page.goto(base + "/books/risala/read");
  check("forthcoming book read → 404", r.status() === 404);
  await page.goto(base + "/books/risala");
  check("forthcoming book page has no Read link", (await page.getByRole("link", { name: /Start reading|Continue reading/ }).count()) === 0);
  // home filters
  await page.goto(base + "/library", { waitUntil: "networkidle" });
  await page.getByRole("searchbox", { name: "Search the library" }).fill("zzzz");
  check("library: empty state", await page.getByText("Nothing in the library matches yet").isVisible());
  await page.getByRole("button", { name: "Clear search and filters" }).click();
  await page.getByRole("button", { name: /Creed/ }).click();
  check("library: creed shows only forthcoming", (await page.getByText("Available to read", { exact: true }).count()) === 0 && await page.getByText("Al-Risala").first().isVisible());
}
