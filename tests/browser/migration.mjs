// Migration from the earlier 110-line ids, against the real build.
export default async function run({ browser, base, check }) {
  const b = browser;
  const ctx = await b.newContext({ viewport: { width: 390, height: 800 }, isMobile: true, hasTouch: true });
  const p = await ctx.newPage();
  const errs = []; p.on("pageerror", (e) => errs.push(e.message));
  const topUnit = () => p.evaluate(() => [...document.querySelectorAll("[data-unit]")].find((e) => e.getBoundingClientRect().bottom > 130)?.id);
  const store = () => p.evaluate(() => ({
    progress: JSON.parse(localStorage.getItem("zaibaitech.library.progress.akhdari") || "{}"),
    bookmarks: JSON.parse(localStorage.getItem("zaibaitech.library.bookmarks.akhdari") || "[]"),
  }));

  // A device that read the old version: position and bookmarks saved under old ids.
  await p.goto(base + "/");
  await p.evaluate(() => {
    localStorage.setItem("zaibaitech.library.progress.akhdari", JSON.stringify({ seen: ["tayammum.2", "tayammum.3"], lastUnitId: "tayammum.3", updatedAt: Date.now() }));
    localStorage.setItem("zaibaitech.library.bookmarks.akhdari", JSON.stringify(["sahw_forgetfulness.7", "wudu_faraid_sunan.2", "sahw_forgetfulness.6"]));
  });
  await p.reload({ waitUntil: "networkidle" });
  const href = await p.getByRole("link", { name: "Continue reading" }).first().getAttribute("href");
  check("home: Continue reading links to the new passage id", href === "/books/akhdari/read#tayammum.p04", href);
  check("home: names the right chapter", await p.getByText("Tayammum").first().isVisible());

  await p.goto(base + "/books/akhdari", { waitUntil: "networkidle" });
  const bookHref = await p.getByRole("link", { name: "Continue reading" }).getAttribute("href");
  check("book page: Continue uses the new id", bookHref === "/books/akhdari/read#tayammum.p04", bookHref);

  await p.goto(base + "/books/akhdari/read", { waitUntil: "networkidle" });
  await p.waitForTimeout(1300);
  check("reader: old saved position restores to the passage that holds it", (await topUnit()) === "tayammum.p04", await topUnit());
  const s = await store();
  check("storage: position rewritten to the new id", s.progress.lastUnitId === "tayammum.p04", s.progress.lastUnitId);
  check("storage: bookmarks rewritten, merged where two old lines share a passage", JSON.stringify(s.bookmarks) === JSON.stringify(["sahw_forgetfulness.p11", "wudu_faraid_sunan.p02", "sahw_forgetfulness.p10"]), JSON.stringify(s.bookmarks));
  check("bookmarks badge counts migrated bookmarks", (await p.getByRole("button", { name: /^Bookmarks, 3 saved/ }).count()) === 1);

  // A shared link with an old id.
  await p.goto(base + "/books/akhdari");
  await p.goto(base + "/books/akhdari/read#sahw_forgetfulness.7", { waitUntil: "networkidle" });
  await p.waitForTimeout(1300);
  check("old link: lands on the passage holding that line", (await topUnit()) === "sahw_forgetfulness.p11", await topUnit());
  check("old link: URL rewritten to the new id", (await p.evaluate(() => location.hash)) === "#sahw_forgetfulness.p11");
  // Restorations are visible in the Arabic.
  await p.goto(base + "/books/akhdari/read#obligations_of_the_mukallaf.p07", { waitUntil: "networkidle" });
  await p.waitForTimeout(900);
  const p07 = await p.locator('[id="obligations_of_the_mukallaf.p07"] .arabic-text').innerText();
  check("restoration shown in brackets in the Arabic", p07.includes("[ورؤية الفضل على الغير، والهمز واللمز والعبث]"));
  check("156 passages rendered", (await p.locator("[data-unit]").count()) === 156);
  check("default Arabic-only reading shows no translation text", (await p.locator(".translation-text").count()) === 0);
  check("no page errors", errs.length === 0, errs.join(" | "));
}
