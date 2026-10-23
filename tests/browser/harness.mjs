/**
 * Shared pieces for the browser suites. Each suite exports
 *   default async function ({ browser, base, check, screenshot, engine })
 * where engine is "chromium" or "webkit" (Safari's engine).
 * and records results through `check(name, ok, detail)`.
 */
import fs from "node:fs";
import path from "node:path";

/** Screenshots are written only when SCREENSHOT_DIR is set (for manual review); CI does not need them. */
export function screenshotter(dir = process.env.SCREENSHOT_DIR) {
  return async (page, name, options = {}) => {
    if (!dir) return;
    fs.mkdirSync(dir, { recursive: true });
    await page.screenshot({ path: path.join(dir, `${name}.png`), ...options });
  };
}

export function recorder(suite) {
  const results = [];
  const check = (name, ok, detail = "") => {
    results.push({ suite, name, ok: Boolean(ok), detail: String(detail ?? "") });
    console.log(`${ok ? "PASS" : "FAIL"} [${suite}] ${name}${detail && !ok ? ` — ${detail}` : ""}`);
  };
  return { check, results };
}

/* The reader's display settings live in the toolbar's "Aa" panel. */
export const displayButton = (page) => page.getByRole("button", { name: /^Display settings/ });
export async function openDisplay(page) {
  if ((await displayButton(page).getAttribute("aria-expanded")) !== "true") await displayButton(page).click();
}
export async function closeDisplay(page) {
  if ((await displayButton(page).getAttribute("aria-expanded")) === "true") await page.keyboard.press("Escape");
}
export async function setShow(page, label) {
  await openDisplay(page);
  await page.getByRole("radiogroup", { name: "Show" }).getByRole("radio", { name: label, exact: true }).click();
  await closeDisplay(page);
}
export async function showValue(page) {
  await openDisplay(page);
  const value = await page.getByRole("radiogroup", { name: "Show" }).getByRole("radio", { checked: true }).innerText();
  await closeDisplay(page);
  return value;
}
export async function setTheme(page, label) {
  await openDisplay(page);
  await page.getByRole("radiogroup", { name: "Theme" }).getByRole("radio", { name: label, exact: true }).click();
  await closeDisplay(page);
}

/** A request the browser itself cancelled. Chromium says net::ERR_ABORTED; WebKit says it was cancelled. */
export const wasCancelled = (request) => /ERR_ABORTED|cancel/i.test(request.failure()?.errorText ?? "");

/** Scroll like a reader would. Playwright cannot send wheel events to mobile WebKit, so there it scrolls the window. */
export async function scrollDown(page, pixels) {
  try {
    await page.mouse.wheel(0, pixels);
  } catch (error) {
    if (!/not supported/i.test(String(error?.message))) throw error;
    await page.evaluate((dy) => window.scrollBy(0, dy), pixels);
  }
}

/**
 * Collects console errors, page errors and failed requests on a page, leaving out the trace of a Next.js prefetch
 * (?_rsc=) that the browser cancelled because the test itself navigated away. That is the test's doing, not the app's;
 * a prefetch the server actually fails still shows up as a 4xx/5xx response.
 * A cancelled prefetch leaves two kinds of console line: Next's "Failed to fetch RSC payload for <url>. Falling back"
 * notice (matched by page, since Chromium builds word it differently), and in WebKit the browser's own
 * "Fetch API cannot load <url> due to access control checks." (matched by the exact URL that was cancelled).
 * Read `problems()` after the page has settled: a line and its cancelled request can arrive in either order.
 */
export function watchErrors(page, { requests = true } = {}) {
  const errors = [];
  const failed = [];
  const cancelledUrls = new Set();
  const cancelledPages = new Set();
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("requestfailed", (r) => {
    if (r.url().includes("_rsc=") && wasCancelled(r)) {
      cancelledUrls.add(r.url());
      cancelledPages.add(new URL(r.url()).pathname);
    } else if (requests) failed.push(`${r.failure()?.errorText} ${r.url()}`);
  });
  if (requests) page.on("response", (r) => r.status() >= 400 && failed.push(`${r.status()} ${r.url()}`));
  const cancelledTrace = (text) => {
    const notice = /^Failed to fetch RSC payload for (\S+?)\.? Falling back/.exec(text);
    if (notice) return cancelledPages.has(new URL(notice[1]).pathname);
    const webkit = /^Fetch API cannot load (\S+) due to access control checks\.?$/.exec(text);
    return Boolean(webkit) && cancelledUrls.has(webkit[1]);
  };
  return { problems: () => [...failed, ...errors.filter((text) => !cancelledTrace(text))] };
}
