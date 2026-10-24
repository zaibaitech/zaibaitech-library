// The three English books (Omar Ceesay): discovery, the book pages, and reading them in the shared reader.
import { watchErrors } from "./harness.mjs";
const BOOKS = [
  { id: "reviving-religion", title: "Reviving Religion in the Self and Life", editor: "Bai Lamin Dondeh" },
  { id: "knowing-the-self", title: "Knowing the Self: The Path to Uprightness", editor: "Dr. Alieu Gibba" },
  { id: "balance-of-stations", title: "The Balance of Spiritual Stations in the Muslim’s Life", editor: "Muhammed MK Kah" },
];

const overflow = (page) => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
/** The passage at the reading line, as the reader's own tracking sees it. */
const topPassage = (page) =>
  page.evaluate(() => [...document.querySelectorAll("[data-unit]")].find((e) => e.getBoundingClientRect().bottom > 130)?.id);

/** The three passages where the print shows an empty box and the library shows ﷺ (correction c1, to be confirmed). */
const RESTORED = [
  { book: "reviving-religion", passage: "p6-ch2.p03" },
  { book: "balance-of-stations", passage: "introduction-to-the-book.p14" },
  { book: "balance-of-stations", passage: "p4-ch3.p16" },
];

/**
 * Every ﷺ on the page, each wrapped in its own span so it can be measured on its own, with whether the canvas draws
 * it at the width of Amiri's glyph in the element's own font (the canvas falls back through the font list as the
 * text does). A tofu box or another font gives another width.
 */
const pbuhGlyphs = (page) =>
  page.evaluate(() => {
    const texts = [];
    const walker = document.createTreeWalker(document.querySelector("article"), NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) if (walker.currentNode.nodeValue.includes("\uFDFA")) texts.push(walker.currentNode);
    for (const text of texts) {
      const parts = text.nodeValue.split("\uFDFA");
      const frag = document.createDocumentFragment();
      parts.forEach((part, i) => {
        if (i) {
          const span = document.createElement("span");
          span.className = "pbuh-probe";
          span.textContent = "\uFDFA";
          frag.append(span);
        }
        frag.append(part);
      });
      text.replaceWith(frag);
    }
    const ctx = document.createElement("canvas").getContext("2d");
    const width = (font) => ((ctx.font = font), ctx.measureText("\uFDFA").width);
    return [...document.querySelectorAll(".pbuh-probe")].map((span) => {
      const s = getComputedStyle(span);
      const shape = `${s.fontStyle} ${s.fontWeight} ${s.fontSize}`;
      return {
        passage: span.closest("[data-unit]")?.id ?? span.closest("[id]")?.id ?? "",
        italic: s.fontStyle !== "normal",
        listsAmiri: /\bAmiri\b/.test(s.fontFamily),
        amiriWidth: Math.abs(width(`${shape} ${s.fontFamily}`) - width(`${shape} Amiri`)) < 0.01,
      };
    });
  });

export default async function run({ browser, base, check, screenshot, engine }) {
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
    const errors = (() => {
    const w = watchErrors(p, { requests: false });
    return () => w.problems();
  })();
    for (const book of BOOKS) {
      await p.goto(`${base}/books/${book.id}`, { waitUntil: "networkidle" });
      check(`${width}px ${book.id}: book page has no horizontal overflow`, (await overflow(p)) <= 0, String(await overflow(p)));
      const details = await p.locator("dl").innerText();
      const needed = ["Sidy Ahmad Gassama", book.editor, "978-9983-94-606-2", "© Omar Ceesay", "First Edition 1447H / 2026", "All rights reserved"];
      const missing = needed.filter((text) => !details.includes(text));
      check(`${width}px ${book.id}: book page shows translator, editor, ISBN, copyright and edition`, missing.length === 0, missing.join(", "));
      // One ISBN is printed, for the complete three-book edition; it is never shown as this book's own.
      const terms = await p.locator("dl dt").allInnerTexts();
      check(
        `${width}px ${book.id}: the ISBN is labelled as the complete edition's`,
        terms.filter((t) => /ISBN/.test(t)).join("|") === "ISBN of the complete edition" &&
          details.includes("no separate ISBN is printed for this book"),
        terms.join("|"),
      );
      // Each book shows the editor its own title page names, and no other.
      const editorRow = await p.locator("dl > div", { has: p.locator("dt", { hasText: /^Editor$/ }) }).locator("dd").innerText();
      const others = BOOKS.filter((b) => b.editor !== book.editor && details.includes(b.editor)).map((b) => b.editor);
      check(`${width}px ${book.id}: only its own editor`, editorRow.trim() === book.editor && others.length === 0, `${editorRow} ${others}`);
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

  // Ready to be found and shared: link previews, the sitemap and robots.txt.
  {
    const ctx = await browser.newContext();
    const p = await ctx.newPage();
    for (const book of BOOKS) {
      await p.goto(`${base}/books/${book.id}`, { waitUntil: "domcontentloaded" });
      const meta = await p.evaluate(() => {
        const get = (sel) => document.head.querySelector(sel)?.getAttribute("content") ?? "";
        return {
          title: get("meta[property='og:title']"),
          type: get("meta[property='og:type']"),
          description: get("meta[property='og:description']"),
          url: get("meta[property='og:url']"),
          canonical: document.head.querySelector("link[rel=canonical]")?.getAttribute("href") ?? "",
          summary: get("meta[name=description]"),
        };
      });
      check(
        `${book.id}: link preview names the book and its author`,
        meta.title === book.title && meta.type === "book" && meta.description.includes("Omar") && meta.summary.length > 20,
        JSON.stringify(meta),
      );
      check(`${book.id}: canonical address is the book page`, /^https:\/\/.+\/books\/[\w-]+$/.test(meta.canonical) && meta.canonical.endsWith(`/books/${book.id}`) && meta.url === meta.canonical, meta.canonical);
    }
    const sitemap = await (await p.request.get(`${base}/sitemap.xml`)).text();
    const listed = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
    check(
      "sitemap: each book page and its reader",
      BOOKS.every((b) => listed.includes(`/books/${b.id}`) && listed.includes(`/books/${b.id}/read`)) && listed.includes("/library"),
      listed.join(" "),
    );
    check("sitemap: no reader for a book that is not yet readable", !listed.includes("/books/risala/read"), listed.join(" "));
    const robots = await (await p.request.get(`${base}/robots.txt`)).text();
    check("robots.txt: allows the site and names the sitemap", /Allow: \//.test(robots) && /Sitemap: https:\/\/.+\/sitemap\.xml/.test(robots), robots);
    await ctx.close();
  }

  // ﷺ is drawn with a real glyph everywhere it appears, in italic quotations too (the print lost it in italic).
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    const p = await ctx.newPage();
    for (const book of BOOKS) {
      await p.goto(`${base}/books/${book.id}/read`, { waitUntil: "networkidle" });
      await p.evaluate(() => document.fonts.ready);
      const glyphs = await pbuhGlyphs(p);
      const bad = glyphs.filter((g) => !g.listsAmiri || !g.amiriWidth);
      check(`ﷺ ${book.id}: every one is drawn with Amiri's glyph (${glyphs.length})`, glyphs.length > 20 && bad.length === 0, JSON.stringify(bad.slice(0, 3)));
      const restored = RESTORED.filter((r) => r.book === book.id);
      if (restored.length) {
        const here = restored.map((r) => glyphs.filter((g) => g.passage === r.passage && g.italic).length);
        check(`ﷺ ${book.id}: the restored ones are in their italic quotations`, here.every((n) => n >= 1), here.join(","));
      }
      if (engine === "chromium") {
        // Chromium can say which font actually drew each one.
        const cdp = await ctx.newCDPSession(p);
        await cdp.send("DOM.enable");
        await cdp.send("CSS.enable");
        const { root } = await cdp.send("DOM.getDocument", { depth: -1 });
        const { nodeIds } = await cdp.send("DOM.querySelectorAll", { nodeId: root.nodeId, selector: ".pbuh-probe" });
        const drawnBy = new Set();
        for (const nodeId of nodeIds) {
          const { fonts } = await cdp.send("CSS.getPlatformFontsForNode", { nodeId });
          drawnBy.add(fonts.map((f) => `${f.familyName}${f.isCustomFont ? "" : " (system)"}`).join("+"));
        }
        check(`ﷺ ${book.id}: Chromium draws every one with the Amiri web font`, [...drawnBy].join("|") === "Amiri", [...drawnBy].join("|"));
        await cdp.detach();
      }
      // The closing notice names the ISBN for what it is.
      const notice = await p.locator("footer p[lang=en]").first().innerText();
      check(
        `${book.id}: closing notice gives the ISBN of the complete edition`,
        notice.includes("ISBN of the complete edition 978-9983-94-606-2") && !/ISBN 978/.test(notice),
        notice.slice(0, 120),
      );
    }
    await ctx.close();
  }

  // Reading behaviours on a phone.
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  // Each scenario after the history checks starts on a fresh page in the same context (saved progress and
  // bookmarks carry over in localStorage), as in the navigation suite: in Playwright's WebKit, a full page load in
  // a tab that has been through Back and Forward can crash the tab. Leaving the reader after Back and Forward is
  // checked as a reader does it, by its own link, in the navigation suite.
  let p = null;
  const watchers = [];
  const fresh = async () => {
    if (p) await p.close();
    p = await ctx.newPage();
    watchers.push(watchErrors(p, { requests: false }));
  };
  const errors = () => watchers.flatMap((w) => w.problems());
  await fresh();
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

  // Continuous reading: one document, sections in book order, no Previous/Next panels between them.
  // A fresh page, like every scenario after the history checks (see `fresh`).
  await fresh();
  await p.goto(`${reader}#p3-ch5`, { waitUntil: "networkidle" });
  await p.waitForTimeout(800);
  const layout = await p.evaluate(() => {
    const sections = [...document.querySelectorAll("article > section[id]")];
    const after = document.getElementById("p3-ch5").nextElementSibling;
    return {
      ids: sections.map((s) => s.id),
      headings: sections.map((s) => s.querySelector("h2").textContent.trim()),
      navs: document.querySelectorAll("article nav").length,
      prevNext: [...document.querySelectorAll("article a, article button")].filter((e) => /^(Previous|Next)\b/.test(e.textContent.trim())).length,
      afterCh5: after?.id,
      afterCh5Heading: after?.querySelector("h2")?.textContent.trim(),
    };
  });
  await p.getByRole("button", { name: /^Contents/ }).click();
  const listed = (await p.getByRole("dialog").locator("ol li button").allInnerTexts()).map((t) => t.trim());
  await p.keyboard.press("Escape");
  check("continuous: sections render in the order of the contents", layout.headings.join("|") === listed.join("|"), `${layout.headings.length} vs ${listed.length}`);
  check("continuous: no Previous/Next panels between sections", layout.navs === 0 && layout.prevNext === 0, `${layout.navs} navs, ${layout.prevNext} links`);
  check(
    "continuous: Chapter 5 flows straight into the next section's heading",
    layout.afterCh5 === "p3-conclusion" && layout.afterCh5Heading === "Conclusion of Part 3",
    `${layout.afterCh5} ${layout.afterCh5Heading}`,
  );

  // The end of the book: a compact note and the way back to the contents; no next section is offered.
  const end = p.getByRole("group", { name: "End of the book" });
  await end.scrollIntoViewIfNeeded();
  const endText = await end.innerText();
  check("end of book: names the book", endText.includes("End of Reviving Religion in the Self and Life"), endText);
  check("end of book: no Next action", !/\bNext\b/.test(endText) && (await end.getByRole("link").count()) === 0);
  await end.getByRole("button", { name: "Back to contents" }).click();
  const tab = await p.getByRole("tab", { selected: true }).innerText();
  check("end of book: Back to contents opens the contents", (await p.getByRole("dialog").isVisible()) && tab.startsWith("Contents"), tab);
  await p.keyboard.press("Escape");
  // The Arabic reader reads the same way.
  await p.goto(`${base}/books/akhdari/read`, { waitUntil: "networkidle" });
  const akhdari = await p.evaluate(() => ({
    navs: document.querySelectorAll("article nav").length,
    sections: document.querySelectorAll("article > section[id]").length,
  }));
  check("continuous: Al-Akhdari has no Previous/Next panels either", akhdari.navs === 0 && akhdari.sections === 21, JSON.stringify(akhdari));

  await fresh();
  // Deep link to a passage, and saved progress.
  await p.goto(`${reader}#p6-ch2.p02`, { waitUntil: "networkidle" });
  await p.waitForTimeout(1200);
  check("deep link: lands on the passage", (await topPassage(p)) === "p6-ch2.p02", await topPassage(p));
  const saved = await p.evaluate(() => JSON.parse(localStorage.getItem("zaibaitech.library.progress.reviving-religion") || "{}").lastUnitId);
  check("progress: the place is saved", saved === "p6-ch2.p02", saved);
  // Coming back later: the book opened afresh at its bare URL.
  const again = await ctx.newPage();
  await again.goto(reader, { waitUntil: "networkidle" });
  await again.waitForTimeout(1200);
  check("progress: the bare reader URL reopens at the saved place", (await topPassage(again)) === "p6-ch2.p02", await topPassage(again));
  await again.close();
  await p.goto(base + "/", { waitUntil: "networkidle" });
  const resume = p.locator("section[aria-labelledby=continue-heading] a.btn-primary");
  check("home: Continue reading goes to the saved place", (await resume.getAttribute("href")) === "/books/reviving-religion/read#p6-ch2.p02");

  await fresh();
  // Bookmarks.
  await p.goto(`${reader}#p6-ch2.p02`, { waitUntil: "networkidle" });
  await p.waitForTimeout(1000);
  const mark = p.getByRole("button", { name: /^Bookmark Chapter 2: Zakat as an Instrument of Social Justice, passage 2$/ });
  // Paragraph actions stay out of the text until wanted: no button is drawn after an untouched passage.
  const drawn = () => mark.evaluate((el) => getComputedStyle(el).clip !== "rect(0px, 0px, 0px, 0px)" && el.getBoundingClientRect().width >= 44);
  check("bookmark: no button drawn after an untouched passage", !(await drawn()));
  await p.locator("#p6-ch2\\.p02 p").first().click({ position: { x: 30, y: 10 } });
  check("bookmark: tapping the passage shows its bookmark button", await drawn());
  await mark.click();
  check("bookmark: pressed", (await mark.getAttribute("aria-pressed")) === "true");
  await p.reload({ waitUntil: "networkidle" });
  await p.waitForTimeout(800);
  check("bookmark: kept after reload", (await p.getByRole("button", { name: /^Bookmarks, 1 saved/ }).count()) === 1);
  await p.getByRole("button", { name: /^Bookmarks, 1 saved/ }).click();
  check("bookmark: listed with its English text", (await p.getByRole("dialog").innerText()).includes("Zakat as an Instrument"));
  await p.keyboard.press("Escape");

  await fresh();
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

  await fresh();
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
