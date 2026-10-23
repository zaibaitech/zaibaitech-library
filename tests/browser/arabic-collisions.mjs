/**
 * No vowel mark may touch the line below. For every Arabic word in al-Akhdari, measure its ink with
 * canvas text metrics, place it on its line, and compare words that sit above one another on
 * consecutive lines. Run at phone and desktop widths, at the smallest, default and largest sizes.
 */
const CONFIGS = [
  [360, 2],
  [390, 2],
  [412, 2],
  [360, 0],
  [360, 5],
  [1280, 2],
];

export default async function run({ browser, base, check }) {
  for (const [width, scale] of CONFIGS) {
    const page = await browser.newPage({ viewport: { width, height: 800 } });
    await page.addInitScript(
      (fontScale) =>
        localStorage.setItem(
          "zaibaitech.library.settings",
          JSON.stringify({ theme: "light", fontScale, translationScale: 1, vowelled: true, mode: "arabic" }),
        ),
      scale,
    );
    await page.goto(base + "/books/akhdari/read", { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const result = await page.evaluate(() => {
      const ctx = document.createElement("canvas").getContext("2d");
      let collisions = 0;
      let minGap = Infinity;
      const examples = [];
      for (const el of document.querySelectorAll("p.arabic-text")) {
        const cs = getComputedStyle(el);
        ctx.font = `${cs.fontSize} ${cs.fontFamily}`;
        ctx.direction = "rtl";
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        const boxes = [];
        while (walker.nextNode()) {
          const node = walker.currentNode;
          for (const match of node.data.matchAll(/\S+/g)) {
            const range = document.createRange();
            range.setStart(node, match.index);
            range.setEnd(node, match.index + match[0].length);
            const metrics = ctx.measureText(match[0]);
            for (const rect of [...range.getClientRects()].filter((r) => r.width > 0)) {
              const scaleY = rect.height / (metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent);
              const baseline = rect.top + metrics.fontBoundingBoxAscent * scaleY;
              boxes.push({
                left: rect.left,
                right: rect.right,
                top: baseline - metrics.actualBoundingBoxAscent,
                bottom: baseline + metrics.actualBoundingBoxDescent,
                baseline,
                word: match[0],
              });
            }
          }
        }
        const line = parseFloat(cs.lineHeight);
        for (const upper of boxes) {
          for (const lower of boxes) {
            const step = lower.baseline - upper.baseline;
            if (step < line * 0.5 || step > line * 1.5) continue; // only the next line down
            if (Math.min(upper.right, lower.right) - Math.max(upper.left, lower.left) <= 0) continue;
            const gap = lower.top - upper.bottom;
            minGap = Math.min(minGap, gap);
            if (gap < 0) {
              collisions += 1;
              if (examples.length < 3) examples.push(`${upper.word} / ${lower.word} (${gap.toFixed(1)}px)`);
            }
          }
        }
      }
      return { collisions, minGap: Math.round(minGap * 10) / 10, examples };
    });
    check(
      `${width}px, size ${scale + 1}/6: no vowel mark touches the line below`,
      result.collisions === 0,
      `${result.collisions} collisions, closest ${result.minGap}px; ${result.examples.join("; ")}`,
    );
    await page.close();
  }
}
