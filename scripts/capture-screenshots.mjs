/**
 * Captures README screenshots from a running app (default http://localhost:3000).
 *
 *   npm run dev            # in another terminal
 *   npm run screenshots
 */
import { mkdir } from "node:fs/promises";

import { chromium, devices } from "@playwright/test";

const baseURL = process.env.APP_URL ?? "http://localhost:3000";
const outDir = new URL("../docs/screenshots/", import.meta.url);

const shots = [
  { name: "home-en", path: "/", locale: "en", viewport: { width: 1440, height: 900 } },
  { name: "home-ar", path: "/", locale: "ar", viewport: { width: 1440, height: 900 } },
  { name: "how-it-works-en", path: "/", locale: "en", viewport: { width: 1440, height: 900 }, anchor: "#how-it-works" },
  { name: "waitlist-ar", path: "/", locale: "ar", viewport: { width: 1440, height: 900 }, anchor: "#waitlist" },
  { name: "sign-up-en", path: "/sign-up", locale: "en", viewport: { width: 1440, height: 900 } },
  { name: "home-ar-mobile", path: "/", locale: "ar", device: devices["iPhone 13"] },
];

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch();

for (const shot of shots) {
  const context = await browser.newContext({
    ...(shot.device ?? { viewport: shot.viewport, deviceScaleFactor: 1.5 }),
    reducedMotion: "reduce",
  });
  await context.addCookies([{ name: "clinora_locale", value: shot.locale, url: baseURL }]);
  const page = await context.newPage();
  await page.goto(new URL(shot.path, baseURL).toString(), { waitUntil: "networkidle" });
  // Hide the Next.js dev-mode badge.
  await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
  if (shot.anchor) {
    await page.locator(shot.anchor).scrollIntoViewIfNeeded();
    await page.evaluate((selector) => {
      const top = document.querySelector(selector).getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, top - 72);
    }, shot.anchor);
  }
  await page.waitForTimeout(1200);
  await page.screenshot({ path: new URL(`${shot.name}.jpg`, outDir).pathname, type: "jpeg", quality: 82 });
  console.log(`✓ ${shot.name}`);
  await context.close();
}

await browser.close();
