import { openDisplay, closeDisplay, setShow, showValue } from "./harness.mjs";

export default async function run({ browser, base, check }) {
  const b = browser;
  const geo = (p, id) => p.evaluate((id) => {
    // content box: the border box minus the element's own padding
    const r = (e) => { const b = e.getBoundingClientRect(), cs = getComputedStyle(e);
      return { left: b.left + parseFloat(cs.paddingLeft), right: b.right - parseFloat(cs.paddingRight), top: b.top, bottom: b.bottom }; };
    const root = document.getElementById(id);
    return { a: r(root.querySelector(".arabic-text")), t: r(root.querySelector(".translation-text")), box: r(root) }; }, id);
  for (const [w, h] of [[360, 800], [390, 844], [412, 860], [1280, 900]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h } });
    const p = await ctx.newPage(); const errs = []; p.on("pageerror", (e) => errs.push(e.message)); p.on("console", (m) => m.type() === "error" && errs.push(m.text()));
    await p.goto(base + "/books/akhdari/read#obligations_of_the_mukallaf.p07", { waitUntil: "networkidle" });
    await openDisplay(p);
    const opts = await p.getByRole("radiogroup", { name: "Show" }).getByRole("radio").allInnerTexts();
    await closeDisplay(p);
    check(`${w}: modes`, opts.join("|") === "Arabic|Arabic + English|English", opts.join("|"));
    check(`${w}: Arabic-only notice gone, attribution shown`, (await p.getByText("No licensed translation of this book").count()) === 0);
    await setShow(p, "Arabic + English"); await p.waitForTimeout(400);
    check(`${w}: attribution line`, await p.getByText(/English translation: Zaibaitech Library/).isVisible());
    check(`${w}: all 156 passages have English`, (await p.locator(".translation-text").count()) === 156);
    check(`${w}: 6 notes`, (await p.locator("[data-unit] aside").count()) === 6);
    check(`${w}: reviewer's heading on banner`, await p.getByText("Section: The Obligatory Acts of Wudu Are Seven").isVisible() || (await p.getByText("Section: The Obligatory Acts of Wudu Are Seven").count()) === 1);
    const g = await geo(p, "obligations_of_the_mukallaf.p07");
    if (w < 1024) check(`${w}: stacked`, g.t.top >= g.a.bottom - 1 && Math.abs(g.a.left - g.t.left) < 2, "");
    else check(`${w}: side by side, Arabic right`, g.a.left >= g.t.right && Math.abs(g.a.right - g.box.right) < 30 && g.a.top < g.t.bottom && g.t.top < g.a.bottom, "");
    await setShow(p, "English"); await p.waitForTimeout(300);
    check(`${w}: English only hides Arabic`, (await p.locator(".arabic-text").count()) === 0);
    const ov = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    check(`${w}: no overflow`, ov <= 0, String(ov));
    check(`${w}: no console/page errors`, errs.length === 0, errs.join("|"));
    if (w === 390) {
      await p.reload({ waitUntil: "networkidle" });
      check("mode persists after reload", (await showValue(p)) === "English");
      await p.getByRole("button", { name: "Search this book" }).click();
      await p.locator("#reader-search").fill("tayammum");
      await p.waitForTimeout(300);
      const st = await p.getByRole("status").filter({ hasText: "found" }).first().innerText();
      check("English search finds passages", /^[1-9]\d* passages? found/.test(st), st);
      await p.keyboard.press("Escape");
      await p.goto(base + "/books/akhdari", { waitUntil: "networkidle" });
      const main = await p.locator("main").innerText();
      check("book page: Languages Arabic, English", /Languages\s*Arabic, English/.test(main));
      check("book page: credits the translation with its recorded review", /English translation\s*Zaibaitech Library · CC BY-NC-SA 4.0\s*Reviewed for publication, 22 October 2026/.test(main));
      await p.goto(base + "/", { waitUntil: "networkidle" });
      check("home: featured book lists English", (await p.locator("main").innerText()).includes("Arabic & English"));
      check("home: 'no licensed translation' note gone", (await p.getByText("No licensed English translation is available yet").count()) === 0);
    }
    await ctx.close();
  }
}
