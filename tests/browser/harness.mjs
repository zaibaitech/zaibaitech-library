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
