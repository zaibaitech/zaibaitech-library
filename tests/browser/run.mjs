/**
 * Runs the browser suites against the production build.
 *
 *   npm run build && npm run test:browser
 *   npm run test:browser -- reader publication   (only the named suites)
 *
 * Starts `next start` on PORT (default 3100) unless BASE_URL points at a running server.
 * Set CHROMIUM_PATH to use a particular Chromium; otherwise Playwright's own is used.
 */
import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
import { chromium } from "playwright";
import { recorder, screenshotter } from "./harness.mjs";

const SUITES = ["accessibility", "reader", "navigation", "migration", "publication", "qa-regressions", "arabic-collisions", "english-books"];
const only = process.argv.slice(2);
const chosen = only.length ? SUITES.filter((name) => only.includes(name)) : SUITES;
if (only.length && chosen.length !== only.length) {
  console.error(`Unknown suite. Available: ${SUITES.join(", ")}`);
  process.exit(2);
}

const port = process.env.PORT ?? "3100";
const base = process.env.BASE_URL ?? `http://localhost:${port}`;
let server = null;
if (!process.env.BASE_URL) {
  server = spawn("npx", ["next", "start", "-p", port], { stdio: ["ignore", "ignore", "inherit"], detached: true });
}

async function waitForServer() {
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(base)).ok) return;
    } catch {
      /* not up yet */
    }
    await sleep(500);
  }
  throw new Error(`No server at ${base}. Run "npm run build" first.`);
}

let failed = 0;
let total = 0;
try {
  await waitForServer();
  const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const screenshot = screenshotter();
  for (const name of chosen) {
    const { check, results } = recorder(name);
    const { default: run } = await import(`./${name}.mjs`);
    try {
      await run({ browser, base, check, screenshot });
    } catch (error) {
      check("suite ran to completion", false, error?.stack ?? error);
    }
    const bad = results.filter((r) => !r.ok).length;
    console.log(`== ${name}: ${results.length - bad}/${results.length} passed`);
    total += results.length;
    failed += bad;
  }
  await browser.close();
} finally {
  if (server) process.kill(-server.pid, "SIGTERM");
}
console.log(`\nBrowser checks: ${total - failed}/${total} passed`);
process.exit(failed ? 1 : 0);
