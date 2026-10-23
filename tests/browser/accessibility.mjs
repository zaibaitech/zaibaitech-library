// Phase 2 interaction and accessibility checks against the production build.
export default async function run({ browser, base, check }) {
  const b = browser;
  const pages = ["/", "/books/akhdari", "/books/risala", "/books/khalil", "/books/akhdari/read", "/about", "/glossary"];

  // 1. overflow, console errors, failed requests at every width, both themes
  for (const theme of ["light", "dark"]) for (const w of [360, 390, 412, 1280]) {
    const ctx = await b.newContext({ viewport: { width: w, height: 860 } });
    await ctx.addInitScript((t) => localStorage.setItem("zaibaitech.library.settings", JSON.stringify({ theme: t, mode: "both:en-zaibaitech-2026" })), theme);
    const p = await ctx.newPage(); const errs = [], failed = [];
    // A Next.js prefetch (?_rsc=) still in flight when the test itself navigates away is cancelled by the browser
    // (net::ERR_ABORTED) and Next logs a fallback notice. That is the test's doing, not the app's; a prefetch the
    // server actually fails still shows up as a 4xx/5xx response below.
    // Matched by page, not by message wording (Chromium builds word the fetch error differently), and only
    // after all events are in, since the notice and the cancelled request can arrive in either order.
    const cancelledPages = new Set();
    p.on("pageerror", (e) => errs.push(e.message));
    p.on("console", (m) => m.type() === "error" && errs.push(m.text()));
    p.on("requestfailed", (r) => {
      if (r.url().includes("_rsc=") && r.failure()?.errorText === "net::ERR_ABORTED") cancelledPages.add(new URL(r.url()).pathname);
      else failed.push(`${r.failure()?.errorText} ${r.url()}`);
    });
    p.on("response", (r) => r.status() >= 400 && failed.push(`${r.status()} ${r.url()}`));
    let over = [];
    for (const path of pages) {
      await p.goto(base + path, { waitUntil: "networkidle" });
      const o = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      if (o > 0) over.push(`${path}:${o}`);
    }
    check(`${theme} ${w}px: no horizontal overflow on ${pages.length} pages`, over.length === 0, over.join(" "));
    const cancelledNotice = (text) => {
      const match = /^Failed to fetch RSC payload for (\S+?)\.? Falling back/.exec(text);
      return Boolean(match) && cancelledPages.has(new URL(match[1]).pathname);
    };
    const realErrors = errs.filter((text) => !cancelledNotice(text));
    check(`${theme} ${w}px: no console errors or failed requests`, realErrors.length === 0 && failed.length === 0, [...realErrors, ...failed].join(" | ").slice(0, 300));
    await ctx.close();
  }

  // 2. contrast of rendered text, both themes
  for (const theme of ["light", "dark"]) {
    const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
    await ctx.addInitScript((t) => localStorage.setItem("zaibaitech.library.settings", JSON.stringify({ theme: t, mode: "both:en-zaibaitech-2026" })), theme);
    const p = await ctx.newPage();
    const worst = [];
    for (const path of ["/", "/library", "/books/akhdari", "/books/akhdari/read"]) {
      await p.goto(base + path, { waitUntil: "networkidle" });
      const res = await p.evaluate(() => {
        const parse = (c) => (c.match(/[\d.]+/g) || []).map(Number);
        const lum = ([r, g, b]) => [r, g, b].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }).reduce((a, v, i) => a + v * [0.2126, 0.7152, 0.0722][i], 0);
        const bgOf = (el) => { for (let e = el; e; e = e.parentElement) { const c = parse(getComputedStyle(e).backgroundColor); if (c.length >= 3 && (c[3] === undefined || c[3] > 0.9)) return c; } return parse(getComputedStyle(document.body).backgroundColor); };
        const out = [];
        const els = [...document.querySelectorAll("body *")].filter((e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) && e.getClientRects().length && !e.closest("[role=img]") && !e.closest(".sr-only") && getComputedStyle(e).visibility !== "hidden");
        for (const e of els) {
          const cs = getComputedStyle(e); const fg = parse(cs.color); const op = Number(cs.opacity);
          if (op < 0.99 || (fg[3] !== undefined && fg[3] < 0.99)) continue;
          const L1 = lum(fg), L2 = lum(bgOf(e)); const r = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
          const large = parseFloat(cs.fontSize) >= 24 || (parseFloat(cs.fontSize) >= 18.66 && Number(cs.fontWeight) >= 700);
          if (r < (large ? 3 : 4.5)) out.push(`${r.toFixed(2)} "${e.textContent.trim().slice(0, 30)}"`);
        }
        return { checked: els.length, low: out };
      });
      if (res.low.length) worst.push(`${path}: ${res.low.slice(0, 4).join(", ")}`);
      check(`${theme} ${path}: text contrast meets WCAG AA (${res.checked} elements)`, res.low.length === 0, res.low.slice(0, 4).join(", "));
    }
    await ctx.close();
  }

  // 3. reader keyboard interaction and names
  {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
    const p = await ctx.newPage();
    await p.goto(base + "/books/akhdari/read#wudu_faraid_sunan", { waitUntil: "networkidle" }); await p.waitForTimeout(800);
    const aa = p.getByRole("button", { name: /^Display settings/ });
    await aa.focus(); await p.keyboard.press("Enter");
    check("display panel opens with aria-expanded", (await aa.getAttribute("aria-expanded")) === "true");
    check("focus moves into the panel", await p.evaluate(() => !!document.activeElement?.closest("#display-panel")));
    const show = p.getByRole("radiogroup", { name: "Show" });
    await show.getByRole("radio", { checked: true }).focus();
    const before = await show.getByRole("radio", { checked: true }).innerText();
    await p.keyboard.press("ArrowRight");
    const after = await show.getByRole("radio", { checked: true }).innerText();
    check("arrow key moves the Show choice", before !== after, `${before} -> ${after}`);
    check("arrow key moves focus with the choice", (await p.evaluate(() => document.activeElement?.textContent)) === after);
    check("only the checked radio is tabbable", (await show.locator('[role=radio][tabindex="0"]').count()) === 1);
    check("English appears after choosing it", (await p.locator(".translation-text").count()) > 0 || after === "Arabic");
    const sw = p.getByRole("switch", { name: /Tashkīl/ });
    const was = await sw.getAttribute("aria-checked"); await sw.click();
    check("tashkīl switch toggles aria-checked", (await sw.getAttribute("aria-checked")) !== was);
    await sw.click();
    await p.keyboard.press("Escape");
    check("Escape closes the panel", (await aa.getAttribute("aria-expanded")) === "false");
    check("focus returns to the Aa button", await p.evaluate(() => document.activeElement?.getAttribute("aria-label")?.startsWith("Display settings")));
    // click outside closes
    await aa.click(); await p.mouse.click(200, 700);
    check("click outside closes the panel", (await aa.getAttribute("aria-expanded")) === "false");
    // tabs
    await p.getByRole("button", { name: /^Contents/ }).click();
    const tabs = p.getByRole("tab");
    await p.getByRole("tab", { selected: true }).focus();
    await p.keyboard.press("ArrowRight");
    check("tabs: ArrowRight selects the next tab", (await p.getByRole("tab", { selected: true }).innerText()).startsWith("Search"));
    check("tabs: focus follows", (await p.evaluate(() => document.activeElement?.getAttribute("role"))) === "tab");
    await p.keyboard.press("End");
    check("tabs: End selects the last tab", (await p.getByRole("tab", { selected: true }).innerText()).startsWith("Bookmarks"));
    await p.keyboard.press("Home");
    check("tabs: Home selects the first tab", (await p.getByRole("tab", { selected: true }).innerText()).startsWith("Contents"));
    check("tabs: inactive tabs are out of the Tab order", (await p.locator('[role=tab][tabindex="-1"]').count()) === (await tabs.count()) - 1);
    await p.keyboard.press("Escape");
    // touch targets
    const small = await p.evaluate(() => [...document.querySelectorAll("header.sticky button, header.sticky a, [data-unit] button[aria-label^='Bookmark']")].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && (r.width < 44 || r.height < 44); }).map((e) => e.getAttribute("aria-label") || e.textContent.trim()));
    check("reader controls are at least 44×44px", small.length === 0, small.slice(0, 5).join(", "));
    const unnamed = await p.evaluate(() => [...document.querySelectorAll("button, a, input, [role=radio], [role=switch], [role=tab]")].filter((e) => !(e.getAttribute("aria-label") || e.textContent.trim() || e.labels?.length)).length);
    check("every reader control has a name", unnamed === 0, String(unnamed));
    // focus ring visible on a header control
    await p.keyboard.press("Tab");
    const ring = await p.evaluate(() => { const e = document.activeElement; const cs = getComputedStyle(e); return cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) >= 2; });
    check("keyboard focus is visibly outlined", ring);
    await ctx.close();
  }

  // 4. home: names, targets, filters
  {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
    const p = await ctx.newPage();
    await p.goto(base + "/", { waitUntil: "networkidle" });
    const small = await p.evaluate(() => [...document.querySelectorAll("header a[aria-label], header button, nav[aria-label='Main'] a, article a")].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && (r.height < 44 || r.width < 44); }).length);
    check("home header buttons, tab bar and book actions ≥ 44px", small === 0, String(small));
    const unnamed = await p.evaluate(() => [...document.querySelectorAll("button, a, input")].filter((e) => !(e.getAttribute("aria-label") || e.textContent.trim() || e.labels?.length || e.getAttribute("aria-hidden") === "true")).length);
    check("every home control has a name", unnamed === 0, String(unnamed));
    check("forthcoming status is written, not only coloured", (await p.getByText("Forthcoming · not yet readable").count()) === 2);
    check("tab bar marks Home as the current page", (await p.locator("nav[aria-label='Main'] a[aria-current='page']").filter({ visible: true }).innerText()).trim() === "Home");
    await p.getByRole("link", { name: "Search the library" }).click();
    await p.waitForURL(/\/library#search$/);
    await p.waitForTimeout(300);
    check("header search opens the library with the field focused", await p.evaluate(() => document.activeElement?.id === "library-search"));
    const small2 = await p.evaluate(() => [...document.querySelectorAll("[aria-label='Filter by subject'] button")].filter((e) => e.getBoundingClientRect().height < 44).length);
    check("library filters ≥ 44px tall", small2 === 0, String(small2));
    await p.getByRole("searchbox", { name: "Search the library" }).fill("risala");
    check("search lists results", await p.getByRole("heading", { name: "Search results" }).isVisible());
    check("search result count announced", (await p.getByRole("status").innerText()).startsWith("1 title"));
    await p.getByRole("button", { name: "Clear search" }).click();
    check("clearing search restores the collection", await p.getByRole("heading", { name: "The collection" }).isVisible());
    await ctx.close();
  }

  // 5. text resized to 200%
  {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
    const p = await ctx.newPage(); const over = [];
    for (const path of ["/", "/library", "/books/akhdari", "/books/akhdari/read"]) {
      await p.goto(base + path, { waitUntil: "networkidle" });
      await p.addStyleTag({ content: "html{font-size:200% !important}" }); await p.waitForTimeout(300);
      const o = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      if (o > 0) over.push(`${path}:${o}`);
    }
    check("200% text size: no horizontal overflow", over.length === 0, over.join(" "));
    await ctx.close();
  }

  // 6. reduced motion
  {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
    const p = await ctx.newPage();
    await p.goto(base + "/", { waitUntil: "networkidle" });
    const r = await p.evaluate(() => ({ scroll: getComputedStyle(document.documentElement).scrollBehavior, btn: getComputedStyle(document.querySelector(".btn")).transitionDuration }));
    check("reduced motion: no smooth scrolling and no button transition", r.scroll === "auto" && parseFloat(r.btn) <= 0.001, JSON.stringify(r));
    await ctx.close();
  }
}
