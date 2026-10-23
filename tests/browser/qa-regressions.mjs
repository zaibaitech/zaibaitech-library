export default async function run({ browser, base, check }) {
  const b = browser;
  const B = base;
  const settings = (o) => JSON.stringify({ theme: "light", fontScale: 2, translationScale: 1, vowelled: true, mode: "both:en-zaibaitech-2026", ...o });
  const page = async (w, h, s) => { const ctx = await b.newContext({ viewport: { width: w, height: h } }); const p = await ctx.newPage(); if (s) await p.addInitScript((v) => { if (!sessionStorage.getItem("i")) { localStorage.setItem("zaibaitech.library.settings", v); sessionStorage.setItem("i", "1"); } }, s); return p; };

  // #10 toolbar names the chapter after a jump to a section title
  { const p = await page(390, 844, settings({}));
    await p.goto(B + "/books/akhdari/read#salah_title", { waitUntil: "networkidle" }); await p.waitForTimeout(1200);
    const label = await p.locator("header.sticky button[aria-haspopup=dialog]").first().innerText();
    check("#9 toolbar names the section title after jumping to #salah_title", /^The prayer/.test(label), JSON.stringify(label.split("\n")[0]));
    // jump via Contents
    await p.getByRole("button", { name: /^Contents/ }).click(); await p.locator("#sheet-panel").getByRole("button", { name: /Tayammum/ }).first().click(); await p.waitForTimeout(800);
    const label2 = await p.locator("header.sticky button[aria-haspopup=dialog]").first().innerText();
    check("#10 toolbar updates after a Contents jump", /Tayammum/.test(label2), JSON.stringify(label2.split("\n")[0]));
    // #11 landing clearance below the toolbar
    const gap = await p.evaluate(() => document.getElementById("tayammum").getBoundingClientRect().top - document.querySelector("header.sticky").getBoundingClientRect().bottom);
    check("#11 jump lands with air below the toolbar", gap >= 20, `${Math.round(gap)}px`);
    // #7 English search shows English snippet with the match marked
    await p.getByRole("button", { name: "Search this book" }).click(); await p.locator("#reader-search").fill("ablution"); await p.waitForTimeout(300);
    const marks = await p.locator("#sheet-panel mark").allInnerTexts();
    check("#7 English hits show English with the match marked", marks.length === 2 && marks.every((m) => m.toLowerCase() === "ablution"), JSON.stringify(marks));
    await p.locator("#reader-search").fill("التيمم"); await p.waitForTimeout(300);
    check("#7 Arabic hits still show Arabic", (await p.locator("#sheet-panel li [lang=ar]").count()) >= 1);
    await p.context().close(); }

  // #7 English searchable in Arabic-only mode
  { const p = await page(390, 844, settings({ mode: "arabic" }));
    await p.goto(B + "/books/akhdari/read", { waitUntil: "networkidle" }); await p.waitForTimeout(800);
    await p.getByRole("button", { name: "Search this book" }).click(); await p.locator("#reader-search").fill("prayer"); await p.waitForTimeout(300);
    check("#7 English search works in Arabic-only mode", /\d+ passages found/.test(await p.getByRole("status").first().innerText()) && (await p.locator("#sheet-panel mark").count()) > 0);
    await p.context().close(); }

  // #13 justification follows the column width
  for (const [w, scale, expect] of [[360, 2, true], [360, 5, false], [1920, 5, false], [1920, 2, true]]) {
    const p = await page(w, 900, settings({ fontScale: scale }));
    await p.goto(B + "/books/akhdari/read", { waitUntil: "networkidle" }); await p.waitForTimeout(800);
    const j = await p.locator("p.arabic-text.arabic-justify").count();
    check(`#13 ${w}px size ${scale + 1}/6 justified=${expect}`, (j > 0) === expect, `justified paragraphs: ${j}`);
    await p.context().close();
  }

  // #3-5 Sources page
  for (const w of [390, 1280]) {
    const p = await page(w, 900);
    await p.goto(B + "/about", { waitUntil: "networkidle" });
    const text = await p.locator("main").innerText();
    check(`#3 Sources no longer says no translation exists (${w})`, !/Today no book has one|not a translation/.test(text));
    check(`#3 Sources lists the published translation (${w})`, /English translation by Zaibaitech Library/.test(text) && /Reviewed for publication 22 October 2026/.test(text));
    check(`#4 no raw ids or backticks (${w})`, !/`|\.p\d\d\b|CORRECTIONS\.md/.test(text));
    check(`#4 restorations name their place (${w})`, /The accountable person, passage 7/.test(text) && /Conditions of the prayer, passage 4/.test(text));
    const ov = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    const tableOv = await p.evaluate(() => [...document.querySelectorAll("table, ol")].filter((e) => e.offsetParent && e.scrollWidth > e.clientWidth + 1).length);
    check(`#5 no overflow on Sources (${w})`, ov <= 0 && tableOv === 0, `page ${ov}, boxes ${tableOv}`);
    await p.context().close();
  }
  // #6 library search by topic
  { const p = await page(390, 844); await p.goto(B + "/library", { waitUntil: "networkidle" });
    for (const q of ["wudu", "tayammum", "risala"]) { await p.getByRole("searchbox", { name: "Search the library" }).fill(q); await p.waitForTimeout(200);
      check(`#6 library search "${q}" finds a title`, (await p.getByRole("status").innerText()).startsWith("1 title")); }
    await p.context().close(); }

  // #9 continue card and #15 matching progress figures
  { const p = await page(390, 844, settings({}));
    await p.goto(B + "/books/akhdari/read#tayammum.p04", { waitUntil: "networkidle" }); await p.waitForTimeout(1500);
    await p.goto(B + "/", { waitUntil: "networkidle" }); await p.waitForTimeout(500);
    const card = await p.locator("section[aria-labelledby=continue-heading]").innerText();
    const ar = await p.locator("section[aria-labelledby=continue-heading] p[dir=rtl]").evaluate((e) => ({ clipped: e.scrollWidth > e.clientWidth, dir: getComputedStyle(e).direction }));
    check("#9 Arabic chapter title on its own RTL line, no stray dot", ar.dir === "rtl" && !/·\s*$/m.test(card), JSON.stringify(ar));
    const homePct = card.match(/(\d+)% through/)?.[1];
    await p.goto(B + "/books/akhdari", { waitUntil: "networkidle" }); await p.waitForTimeout(500);
    const bookPct = (await p.locator("main").innerText()).match(/(\d+)% through/)?.[1];
    check("#15 book page and Home show the same position", homePct && homePct === bookPct, `home ${homePct}%, book ${bookPct}%`);
    // #12 tap targets
    const small = await p.evaluate(() => [...document.querySelectorAll("main a, main button, footer a")].filter((e) => { const r = e.getBoundingClientRect(); const inSentence = e.closest("p, li") && e.closest("p, li").textContent.trim() !== e.textContent.trim(); return r.width > 0 && r.height < 44 && !inSentence; }).map((e) => `${e.textContent.trim().slice(0, 30)} ${Math.round(e.getBoundingClientRect().height)}px`));
    check("#12 standalone links on the book page are ≥44px tall", small.length === 0, JSON.stringify(small));
    await p.goto(B + "/glossary", { waitUntil: "networkidle" });
    const g = await p.getByRole("link", { name: "Open the chapter" }).first().boundingBox();
    check("#12 glossary 'Open the chapter' ≥44px tall", g.height >= 44, `${g.height}px`);
    await p.context().close(); }

  // #16 accessible name of the size control matches its label
  { const p = await page(390, 844, settings({})); await p.goto(B + "/books/akhdari/read", { waitUntil: "networkidle" }); await p.waitForTimeout(600);
    await p.getByRole("button", { name: /^Display settings/ }).click();
    check("#16 'English size' control is named for English", (await p.getByRole("button", { name: "Larger English text" }).count()) === 1);
    await p.context().close(); }

  // resize: rotation and window resizes keep the passage
  for (const [start, sizes] of [[[390, 844], [[844, 390], [390, 844], [412, 915]]], [[1920, 1113], [[1280, 900], [1600, 1000], [1920, 1113]]]]) {
    const p = await page(start[0], start[1], settings({}));
    await p.goto(B + "/books/akhdari/read#tayammum.p04", { waitUntil: "networkidle" }); await p.waitForTimeout(1500);
    const seen = [];
    for (const [w, h] of sizes) { await p.setViewportSize({ width: w, height: h }); await p.waitForTimeout(900);
      seen.push(await p.evaluate(() => [...document.querySelectorAll("[data-unit]")].find((e) => e.getBoundingClientRect().bottom > 100).id)); }
    check(`resize from ${start.join("x")} keeps tayammum.p04`, seen.every((id) => id === "tayammum.p04"), seen.join(" "));
    await p.context().close();
  }
  // #11 inline links on phone
  { const p = await page(390, 844, settings({}));
    await p.goto(B + "/books/akhdari/read#tayammum.p04", { waitUntil: "networkidle" }); await p.waitForTimeout(1200);
    await p.goto(B + "/books/akhdari", { waitUntil: "networkidle" });
    const g = await p.locator("main").getByRole("link", { name: "Glossary", exact: true }).boundingBox();
    const f = await p.locator("footer").getByRole("link", { name: /Arabic text from OpenITI/ }).boundingBox();
    check("#11 book-page Glossary and footer credit links ≥44px tall", g.height >= 44 && f.height >= 44, `${g.height}px, ${f.height}px`);
    await p.context().close(); }
}
