// Mobile reader polish: typography, themes, the toolbar and the book's title page at phone sizes.
import { openDisplay, closeDisplay, setTheme } from "./harness.mjs";

const PHONES = [
  [360, 740],
  [390, 844],
  [412, 915],
];

const luminance = ([r, g, b]) => {
  const c = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const contrast = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};
const rgb = (s) => s.match(/\d+/g).slice(0, 3).map(Number);

export default async function run({ browser, base, check, screenshot }) {
  for (const [width, height] of PHONES) {
    const ctx = await browser.newContext({ viewport: { width, height }, isMobile: true, hasTouch: true });
    const p = await ctx.newPage();
    await p.goto(`${base}/books/reviving-religion/read#p3-ch5`, { waitUntil: "networkidle" });
    await p.waitForTimeout(900);
    const tag = `${width}×${height}`;

    // Typography: an upright text serif at 17–19px, italic only inside <em>.
    const body = await p.evaluate(() => {
      const para = document.querySelector("#p3-ch5\\.p01 p");
      const cs = getComputedStyle(para);
      const em = document.querySelector("#p3-ch5\\.p02 em");
      return {
        family: cs.fontFamily,
        size: parseFloat(cs.fontSize),
        line: parseFloat(cs.lineHeight) / parseFloat(cs.fontSize),
        style: cs.fontStyle,
        align: cs.textAlign,
        emStyle: em ? getComputedStyle(em).fontStyle : null,
        outsideEm: [...document.querySelectorAll("[data-unit] p")].slice(0, 40).every((el) => getComputedStyle(el).fontStyle === "normal"),
      };
    });
    check(`${tag}: reading text is Literata`, body.family.startsWith("Literata"), body.family);
    check(`${tag}: reading size 17–19px`, body.size >= 17 && body.size <= 19, String(body.size));
    check(`${tag}: comfortable line spacing`, body.line >= 1.5 && body.line <= 1.8, body.line.toFixed(2));
    check(`${tag}: paragraphs are upright`, body.style === "normal" && body.outsideEm, `${body.style}`);
    check(`${tag}: quotations marked in the text are italic`, body.emStyle === "italic", String(body.emStyle));
    check(`${tag}: paragraphs are justified`, body.align === "justify", body.align);

    // Toolbar: one row, no overflow, the chapter title given two lines rather than cut short.
    const bar = await p.evaluate(() => {
      const header = document.querySelector("header.sticky");
      const title = header.querySelector("button[aria-haspopup=dialog] span span");
      const controls = [...header.querySelectorAll("a, button")].map((e) => e.getBoundingClientRect());
      return {
        height: header.getBoundingClientRect().height,
        right: Math.max(...controls.map((r) => r.right)),
        lines: Math.round(title.getBoundingClientRect().height / parseFloat(getComputedStyle(title).lineHeight)),
        overlap: controls.some((a, i) => controls.some((b, j) => i < j && a.right > b.left + 1 && b.right > a.left + 1 && a.bottom > b.top + 1 && b.bottom > a.top + 1)),
        page: document.documentElement.scrollWidth - innerWidth,
      };
    });
    check(`${tag}: toolbar is one row`, bar.height <= 70, String(Math.round(bar.height)));
    check(`${tag}: toolbar controls fit and do not overlap`, bar.right <= width && !bar.overlap, `${Math.round(bar.right)} ${bar.overlap}`);
    check(`${tag}: chapter title may use two lines`, bar.lines === 2, String(bar.lines));
    check(`${tag}: no horizontal overflow`, bar.page <= 0, String(bar.page));
    // Nothing hidden behind the toolbar after a jump.
    const gap = await p.evaluate(() => document.getElementById("p3-ch5").getBoundingClientRect().top - document.querySelector("header.sticky").getBoundingClientRect().bottom);
    check(`${tag}: the chapter lands clear of the toolbar`, gap >= 16, String(Math.round(gap)));

    // Chapter transitions: the next chapter's heading follows the last paragraph closely, with no panel between.
    const transition = await p.evaluate(() => {
      const prev = document.getElementById("p3-ch4");
      const lastPara = [...prev.querySelectorAll("[data-unit]")].at(-1).getBoundingClientRect();
      const nextHeading = document.querySelector("#p3-ch5 h2").getBoundingClientRect();
      return { gap: nextHeading.top - lastPara.bottom, between: prev.querySelectorAll("nav").length };
    });
    check(`${tag}: chapter transition is compact, with no panel`, transition.between === 0 && transition.gap > 24 && transition.gap < 140, `${Math.round(transition.gap)}px`);

    // Paragraph controls: no bookmark icon drawn after untouched paragraphs.
    const drawnAfterParagraphs = await p.evaluate(
      () =>
        [...document.querySelectorAll("#p3-ch5 [data-unit] button[aria-label^='Bookmark']")].filter(
          (e) => getComputedStyle(e).clip !== "rect(0px, 0px, 0px, 0px)" && getComputedStyle(e).opacity !== "0",
        ).length,
    );
    check(`${tag}: no bookmark icons drawn after untouched paragraphs`, drawnAfterParagraphs === 0, String(drawnAfterParagraphs));
    // Keyboard users still reach them.
    await p.focus("#p3-ch5\\.p01 button[aria-label^='Bookmark']");
    check(`${tag}: a paragraph's bookmark button takes keyboard focus`, await p.evaluate(() => document.activeElement?.getAttribute("aria-label")?.startsWith("Bookmark ")));

    if (width === 390) {
      await screenshot(p, "polish-390-chapter");
      // The title page: title, author and credits as a list, kept apart from the first section's heading.
      await p.goto(`${base}/books/reviving-religion/read#translators-preface`, { waitUntil: "networkidle" });
      await p.evaluate(() => scrollTo(0, 0));
      const titlePage = await p.evaluate(() => {
        const header = document.querySelector("article > header");
        const h1 = header.querySelector("h1");
        const firstH2 = document.querySelector("article section h2");
        const terms = [...header.querySelectorAll("dt")].map((d) => d.textContent.trim());
        const values = [...header.querySelectorAll("dd")].map((d) => d.textContent.trim());
        return {
          h1: parseFloat(getComputedStyle(h1).fontSize),
          h2: parseFloat(getComputedStyle(firstH2).fontSize),
          terms,
          values,
          text: header.textContent,
          inBody: [...document.querySelectorAll("[data-unit]")].some((u) => u.textContent.includes("978-9983-94-606-2")),
        };
      });
      check("title page: credits listed", titlePage.terms.join("|") === "Translated by|Edited by|Edition|Copyright|ISBN of the complete edition", titlePage.terms.join("|"));
      check(
        "title page: translator, editor, edition, copyright and ISBN as printed",
        titlePage.values.join("|") === "Sidy Ahmad Gassama|Bai Lamin Dondeh|First Edition 1447H / 2026|© Omar Ceesay|978-9983-94-606-2",
        titlePage.values.join("|"),
      );
      check("title page: permission notice kept", /All rights reserved\. Published in this library with the rights holder's permission\./.test(titlePage.text));
      check("title page: book title outranks the section heading", titlePage.h1 > titlePage.h2 * 1.2, `${titlePage.h1} vs ${titlePage.h2}`);
      check("title page: credits are not mixed into the book text", !titlePage.inBody);
      // The invocation stands on its own, centred, and the next paragraph is not affected.
      await p.goto(`${base}/books/reviving-religion/read#introduction-to-the-book`, { waitUntil: "networkidle" });
      await p.waitForTimeout(600);
      const inv = await p.evaluate(() => {
        const a = getComputedStyle(document.querySelector("#introduction-to-the-book\\.p01 p"));
        const b = document.querySelector("#introduction-to-the-book\\.p02 p");
        return { align: a.textAlign, nextAlign: getComputedStyle(b).textAlign, nextItalic: [...b.childNodes].some((n) => n.nodeName === "EM" && n.textContent.length > b.textContent.length / 2) };
      });
      check("invocation: centred on its own", inv.align === "center", inv.align);
      check("invocation: the next paragraph is justified and not italic", inv.nextAlign === "justify" && !inv.nextItalic, JSON.stringify(inv));

      // Themes: light, sepia and dark, each readable, and the choice remembered.
      await p.goto(`${base}/books/reviving-religion/read#p3-ch5`, { waitUntil: "networkidle" });
      for (const [label, cls] of [["Sepia", "sepia"], ["Dark", "dark"], ["Light", "light"]]) {
        await setTheme(p, label);
        const colours = await p.evaluate(() => {
          const body = getComputedStyle(document.body).backgroundColor;
          const text = getComputedStyle(document.querySelector("#p3-ch5\\.p01 p")).color;
          return { body, text, classes: document.documentElement.className };
        });
        const ratio = contrast(rgb(colours.body), rgb(colours.text));
        check(`theme ${label}: applied`, colours.classes.split(" ").includes(cls), colours.classes);
        check(`theme ${label}: reading text contrast at least 7:1`, ratio >= 7, ratio.toFixed(1));
        if (cls === "dark") {
          const [r, g, b] = rgb(colours.body);
          const [tr, , tb] = rgb(colours.text);
          check("theme Dark: soft charcoal, not black", r >= 24 && r <= 40 && Math.abs(r - g) <= 4 && Math.abs(g - b) <= 4, colours.body);
          check("theme Dark: warm off-white text", tr > tb && tr >= 225, colours.text);
        }
      }
      await setTheme(p, "Sepia");
      await p.reload({ waitUntil: "networkidle" });
      check("theme: the saved choice is kept", (await p.evaluate(() => document.documentElement.classList.contains("sepia"))));
      await openDisplay(p);
      const themes = await p.getByRole("radiogroup", { name: "Theme" }).getByRole("radio").allInnerTexts();
      check("theme: Light, Sepia, Dark and Auto offered", themes.join("|") === "Light|Sepia|Dark|Auto", themes.join("|"));
      await closeDisplay(p);
    }
    await ctx.close();
  }
}
