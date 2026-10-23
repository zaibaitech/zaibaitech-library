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
 * (?_rsc=) that the browser dropped because the test itself navigated away. That is the test's doing, not the app's;
 * a prefetch the server actually fails still shows up as a 4xx/5xx response, and one that fails on the network for
 * any other reason as a failed request.
 * A dropped prefetch leaves one of two console lines:
 * - Next's "Failed to fetch RSC payload for <url>. Falling back" notice. Excused only for a page whose prefetch the
 *   browser reported cancelled, or that started and got neither a response nor a failure (matched by page, since
 *   Chromium builds word the notice differently).
 * - WebKit's own "… <url> due to access control checks.", as a console line or as the page error of the unhandled
 *   rejection it causes. WebKit blocks a fetch started while the page unloads before
 *   it reaches the network (so no request event is seen) and words it as an access-control failure. Access control
 *   only applies across origins, so for a prefetch of the page's own origin the line can only mean that; it is
 *   excused only for that origin.
 * Read `problems()` after the page has settled: a line and its cancelled request can arrive in either order.
 */
export function watchErrors(page, { requests = true } = {}) {
  const errors = [];
  const failed = [];
  const key = (url) => { const u = new URL(url); return u.pathname + u.search; };
  const started = new Set();
  const answered = new Set();
  const cancelled = new Set();
  let unloadBlocked = 0;
  // The site's own host, from its own requests: page.url() can be mid-navigation when the line is logged.
  const hosts = new Set();
  const raw = [];
  // WebKit reports the blocked fetch on either channel: as a console line, or as the unhandled rejection it causes.
  const record = (channel, text) => {
    const blocked = /(\S*_rsc=\S*?) due to access control checks/.exec(text);
    // The line may or may not spell the scheme, so look for the host anywhere before the path.
    const sameOrigin = blocked && [...hosts].some((host) => blocked[1].includes(`${host}/`));
    if (sameOrigin) unloadBlocked++;
    else {
      errors.push(text);
      if (raw.length < 2) raw.push(`${channel} ${JSON.stringify(text).slice(0, 140)} on ${page.url()} hosts=${[...hosts].join(",")}`);
    }
  };
  page.on("pageerror", (e) => record("pageerror", e.message));
  page.on("console", (m) => m.type() === "error" && record("console", m.text()));
  page.on("request", (r) => {
    try {
      hosts.add(new URL(r.url()).host);
    } catch {
      /* not a URL with a host */
    }
    if (r.url().includes("_rsc=")) started.add(key(r.url()));
  });
  page.on("requestfinished", (r) => r.url().includes("_rsc=") && answered.add(key(r.url())));
  page.on("requestfailed", (r) => {
    if (r.url().includes("_rsc=") && wasCancelled(r)) cancelled.add(key(r.url()));
    else {
      if (r.url().includes("_rsc=")) answered.add(key(r.url()));
      if (requests) failed.push(`${r.failure()?.errorText} ${r.url()}`);
    }
  });
  if (requests) page.on("response", (r) => r.status() >= 400 && failed.push(`${r.status()} ${r.url()}`));
  const dropped = (path) =>
    [...started, ...cancelled].some((k) => k.split("?")[0] === path && (cancelled.has(k) || !answered.has(k)));
  const cancelledNotice = (text) => {
    const notice = /^Failed to fetch RSC payload for (\S+?)\.? Falling back/.exec(text);
    return Boolean(notice) && dropped(new URL(notice[1]).pathname);
  };
  return {
    problems: () => {
      const found = [...failed, ...errors.filter((text) => !cancelledNotice(text))];
      if (!found.length) return found;
      const unanswered = [...started].filter((k) => !answered.has(k) && !cancelled.has(k)).length;
      return [
        `(prefetches: ${started.size} started, ${cancelled.size} reported cancelled, ${unanswered} unanswered, ${unloadBlocked} blocked on unload; raw: ${raw.join(" ; ")})`,
        ...found,
      ];
    },
  };
}
