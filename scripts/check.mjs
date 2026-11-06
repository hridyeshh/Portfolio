// Run against a running site: node scripts/check.mjs http://localhost:3000
// At each width: no sideways scroll, and every nav link fully on screen. With JavaScript off: all the content still shows.
import { chromium } from "playwright-core";
import { projects, site } from "../lib/content.ts";

const url = process.argv[2] ?? "http://localhost:3000";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const problems = [];

for (const width of [320, 390, 768, 1440]) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  page.on("pageerror", (error) => problems.push(`${width}px: page error: ${error.message}`));
  await page.goto(url, { waitUntil: "networkidle" });

  const { overflow, offscreen } = await page.evaluate(() => {
    const root = document.documentElement;
    const isOff = (link) => {
      const { left, right } = link.getBoundingClientRect();
      return left < 0 || right > root.clientWidth;
    };
    return {
      overflow: root.scrollWidth - root.clientWidth,
      offscreen: [...document.querySelectorAll("nav a")].filter(isOff).map((link) => link.textContent),
    };
  });

  if (overflow > 0) problems.push(`${width}px: ${overflow}px of sideways scroll`);
  if (offscreen.length) problems.push(`${width}px: nav off screen: ${offscreen.join(", ")}`);
  await page.close();
}

const noScript = await browser.newContext({ javaScriptEnabled: false });
const page = await noScript.newPage();
await page.goto(url);
for (const text of [site.name, site.headline, ...projects.map((project) => project.name), site.email]) {
  if (!(await page.getByText(text, { exact: true }).first().isVisible())) problems.push(`no JavaScript: "${text}" is not visible`);
}

await browser.close();

if (problems.length) {
  console.error(problems.join("\n"));
  process.exitCode = 1;
} else {
  console.log("check passed");
}
