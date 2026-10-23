// The three English books (Omar Ceesay): discovery, the book pages, and reading them in the shared reader.
const BOOKS = [
  { id: "reviving-religion", title: "Reviving Religion in the Self and Life", editor: "Bai Lamin Dondeh" },
  { id: "knowing-the-self", title: "Knowing the Self: The Path to Uprightness", editor: "Dr. Alieu Gibba" },
  { id: "balance-of-stations", title: "The Balance of Spiritual Stations in the Muslim’s Life", editor: "Muhammed MK Kah" },
];

/** Page errors and console errors, leaving out the notice for a prefetch the browser cancelled when the test moved on. */
function watch(page) {
  const errors = [];
  const cancelled = new Set();
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("requestfailed", (r) => {
    if (r.url().includes("_rsc=") && /ERR_ABORTED|cancel/i.test(r.failure()?.errorText ?? "")) cancelled.add(new URL(r.url()).pathname);
  });
  return () =>
    errors.filter((text) => {
      const m = /^Failed to fetch RSC payload for (\S+?)\.? Falling back/.exec(text);
      return !(m && cancelled.has(new URL(m[1]).pathname));
    });
}

const overflow = (page) => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
/** The passage at the reading line, as the reader's own tracking sees it. */
const topPassage = (page) =>
  page.evaluate(() => [...document.querySelectorAll("[data-unit]")].find((e) => e.getBoundingClientRect().bottom > 130)?.id);

export default async function run({ browser, base, check, screenshot }) {
  // Discovery: home and library list all three as readable.
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const p = await ctx.newPage();
    await p.goto(base + "/", { waitUntil: "networkidle" });
    for (const book of BOOKS) {
      const open = p.getByRole("link", { name: `Open ${book.title}` });
      check(`home: ${book.id} can be opened`, (await open.count()) === 1 && (await open.getAttribute("href")) === `/books/${book.id}/read`);
    }
    await p.goto(base + "/library", { waitUntil: "networkidle" });
    const search = p.getByRole("searchbox").first();
    await search.fill("Ceesay");
    await p.waitForTimeout(300);
    const listed = await p.evaluate(() => [...document.querySelectorAll("a[href^='/books/']")].map((a) => a.getAttribute("href")));
    check("library: searching the author finds the three books", BOOKS.every((b) => listed.includes(`/books/${b.id}`)), listed.join(" "));
    await ctx.close();
  }

  // Book pages and the reader at phone and desktop widths.
  for (const width of [360, 390, 1280]) {
    const ctx = await browser.newContext({ viewport: { width, height: 860 }, isMobile: width < 800, hasTouch: width < 800 });
    const p = await ctx.newPage();
    const errors = watch(p);
    for (const book of BOOKS) {
      await p.goto(`${base}/books/${book.id}`, { waitUntil: "networkidle" });
      check(`${width}px ${book.id}: book page has no horizontal overflow`, (await overflow(p)) <= 0, String(await overflow(p)));
      const details = await p.locator("dl").innerText();
      const needed = ["Sidy Ahmad Gassama", book.editor, "978-9983-94-606-2", "© Omar Ceesay", "First Edition 1447H / 2026", "All rights reserved"];
      const missing = needed.filter((text) => !details.includes(text));
      check(`${width}px ${book.id}: book page shows translator, editor, ISBN, copyright and edition`, missing.length === 0, missing.join(", "));
      check(`${width}px ${book.id}: book page makes no Arabic claim`, (await p.locator("main [lang=ar]").count()) === 0);

      await p.goto(`${base}/books/${book.id}/read`, { waitUntil: "networkidle" });
      await p.waitForTimeout(500);
      check(`${width}px ${book.id}: reader has no horizontal overflow`, (await overflow(p)) <= 0, String(await overflow(p)));
      check(`${width}px ${book.id}: reader title`, (await p.locator("article h1").innerText()).trim() === book.title);
      check(`${width}px ${book.id}: no Arabic text in the reader`, (await p.locator("article [lang=ar], article [dir=rtl]").count()) === 0);
      // Lines of a comfortable length: the column is capped at 34 font sizes, about 70 characters.
      const measure = await p.evaluate(() => {
        const el = document.querySelector("[data-unit] p");
        return el ? el.getBoundingClientRect().width / parseFloat(getComputedStyle(el).fontSize) : 0;
      });
      check(`${width}px ${book.id}: readable line length`, measure > 10 && measure <= 34.5, measure.toFixed(1));
      if (book.id === "reviving-religion") await screenshot(p, `english-${width}-reader`);
    }
    check(`${width}px: no console or page errors`, errors().length === 0, errors().join(" | "));
    await ctx.close();
  }

  // Reading behaviours on a phone.
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const p = await ctx.newPage();
  const errors = watch(p);
  const reader = `${base}/books/reviving-religion/read`;

  // Settings: text size and theme only.
  await p.goto(reader, { waitUntil: "networkidle" });
  const display = p.getByRole("button", { name: /^Display settings/ });
  await display.click();
  const panel = p.locator("#display-panel");
  check("display: no tashkīl switch", (await panel.getByRole("switch").count()) === 0);
  check("display: no reading-language choice", (await panel.getByRole("radiogroup", { name: "Show" }).count()) === 0);
  check("display: no Arabic size", (await panel.getByText("Arabic size").count()) === 0);
  const sizeOf = () => p.evaluate(() => parseFloat(getComputedStyle(document.querySelector("[data-unit] .translation-text")).fontSize));
  const before = await sizeOf();
  await panel.getByRole("button", { name: "Larger reading text" }).click();
  await p.waitForTimeout(200);
  const after = await sizeOf();
  check("display: larger text makes the text larger", after > before, `${before} -> ${after}`);
  await panel.getByRole("button", { name: "Smaller reading text" }).click();
  await p.keyboard.press("Escape");

  // Contents: grouped by part; a jump names the section and records it in history.
  await p.goto(`${reader}#p1-ch1`, { waitUntil: "networkidle" });
  await p.waitForTimeout(1000);
  const startAt = await topPassage(p);
  await p.getByRole("button", { name: /^Contents/ }).click();
  const dialog = p.getByRole("dialog");
  check("contents: lists the part headings", (await dialog.getByRole("button", { name: /^Part 3: Faith Between/ }).count()) === 1);
  await dialog.getByRole("button", { name: "Chapter 5: Modesty (Haya’) Is Part of Faith" }).click();
  await p.waitForTimeout(900);
  check("contents: jump lands on the chapter", (await topPassage(p)) === "p3-ch5.p01", await topPassage(p));
  // The jump writes the chapter; reading on, the reader keeps the hash at the passage in view.
  check("contents: URL names the chapter", ["#p3-ch5", "#p3-ch5.p01"].includes(new URL(p.url()).hash), p.url());
  const toolbar = await p.getByRole("button", { name: /^Contents/ }).getAttribute("aria-label");
  check("contents: toolbar names the chapter", toolbar.includes("Chapter 5: Modesty"), toolbar);
  await p.goBack();
  await p.waitForTimeout(1000);
  check("history: Back returns to where the reader was", (await topPassage(p)) === startAt, `${startAt} vs ${await topPassage(p)}`);
  await p.goForward();
  await p.waitForTimeout(1000);
  check("history: Forward returns to the chapter", (await topPassage(p)) === "p3-ch5.p01", await topPassage(p));

  // Next and previous sections at the foot of each section.
  const nextLink = p.locator("nav[data-after='p3-ch5'] a").filter({ hasText: "Next" });
  check("section nav: next section is Conclusion of Part 3", (await nextLink.innerText()).includes("Conclusion of Part 3"));

  // Deep link to a passage, and saved progress.
  await p.goto(`${reader}#p6-ch2.p02`, { waitUntil: "networkidle" });
  await p.waitForTimeout(1200);
  check("deep link: lands on the passage", (await topPassage(p)) === "p6-ch2.p02", await topPassage(p));
  const saved = await p.evaluate(() => JSON.parse(localStorage.getItem("zaibaitech.library.progress.reviving-religion") || "{}").lastUnitId);
  check("progress: the place is saved", saved === "p6-ch2.p02", saved);
  await p.goto(reader, { waitUntil: "networkidle" });
  await p.waitForTimeout(1200);
  check("progress: the bare reader URL reopens at the saved place", (await topPassage(p)) === "p6-ch2.p02", await topPassage(p));
  await p.goto(base + "/", { waitUntil: "networkidle" });
  const resume = p.locator("section[aria-labelledby=continue-heading] a.btn-primary");
  check("home: Continue reading goes to the saved place", (await resume.getAttribute("href")) === "/books/reviving-religion/read#p6-ch2.p02");

  // Bookmarks.
  await p.goto(`${reader}#p6-ch2.p02`, { waitUntil: "networkidle" });
  await p.waitForTimeout(1000);
  const mark = p.getByRole("button", { name: /^Bookmark Chapter 2: Zakat as an Instrument of Social Justice, passage 2$/ });
  await mark.click();
  check("bookmark: pressed", (await mark.getAttribute("aria-pressed")) === "true");
  await p.reload({ waitUntil: "networkidle" });
  await p.waitForTimeout(800);
  check("bookmark: kept after reload", (await p.getByRole("button", { name: /^Bookmarks, 1 saved/ }).count()) === 1);
  await p.getByRole("button", { name: /^Bookmarks, 1 saved/ }).click();
  check("bookmark: listed with its English text", (await p.getByRole("dialog").innerText()).includes("Zakat as an Instrument"));
  await p.keyboard.press("Escape");

  // Search, ignoring the transliteration marks.
  await p.goto(`${base}/books/balance-of-stations/read`, { waitUntil: "networkidle" });
  await p.getByRole("button", { name: "Search this book" }).click();
  await p.locator("#reader-search").fill("Ubudiyyah");
  await p.waitForTimeout(300);
  const status = await p.getByRole("status").innerText();
  check("search: finds ’Ubudiyyah typed without its mark", /^[1-9]\d* passages? found/.test(status), status);
  const first = p.getByRole("dialog").locator("ul li button").first();
  check("search: the match is marked", (await first.locator("mark").count()) === 1);
  await first.click();
  await p.waitForTimeout(900);
  check("search: a result opens its passage", /#.+\.p\d\d$/.test(p.url()) && (await topPassage(p)) === new URL(p.url()).hash.slice(1), p.url());

  // A table, and the references.
  await p.goto(`${base}/books/knowing-the-self/read#p2-ch6.p05`, { waitUntil: "networkidle" });
  await p.waitForTimeout(800);
  const headers = await p.locator("#p2-ch6\\.p05 th").allInnerTexts();
  check("table: printed as a table with its header", headers.join("|") === "Stage|Predominant Type of Trial", headers.join("|"));
  await p.goto(`${base}/books/balance-of-stations/read#references-and-sources`, { waitUntil: "networkidle" });
  await p.waitForTimeout(800);
  check("references: 71 works", (await p.locator("#references-and-sources tbody tr").count()) === 71);
  check("references: no horizontal overflow", (await overflow(p)) <= 0, String(await overflow(p)));

  check("reading: no console or page errors", errors().length === 0, errors().join(" | "));
  await ctx.close();
}
