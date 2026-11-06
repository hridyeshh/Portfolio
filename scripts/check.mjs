// Run against a running site: node scripts/check.mjs http://localhost:3000 [chromium|firefox|webkit]
// At each width: no sideways scroll, every nav link on screen, the headline fits its sheet, and every chip stays inside its tile.
// Pinned take-apart: every decision fits the stage at its beat. A recording plays and its pause button stops it.
// Reduced motion: stills, with every decision showing and nothing moving. JavaScript off: all the content still shows.
import { chromium, firefox, webkit } from "playwright-core";
import { projects, site } from "../lib/content.ts";

const url = process.argv[2] ?? "http://localhost:3000";
const engine = process.argv[3] ?? "chromium";
const browser = await { chromium, firefox, webkit }[engine].launch(engine === "chromium" ? { channel: "chrome" } : {});
const problems = [];
const decisions = projects.flatMap((project) => project.layers ?? []).map((layer) => layer.decision);

for (const width of [320, 390, 768, 1024, 1440]) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  page.on("pageerror", (error) => problems.push(`${width}px: page error: ${error.message}`));
  await page.goto(url, { waitUntil: "networkidle" });

  const { overflow, offscreen, overfull, escaped } = await page.evaluate(() => {
    const root = document.documentElement;
    const isOff = (link) => {
      const { left, right } = link.getBoundingClientRect();
      return left < 0 || right > root.clientWidth;
    };
    const sheet = document.querySelector(".hero-sheet");
    return {
      overflow: root.scrollWidth - root.clientWidth,
      offscreen: [...document.querySelectorAll("nav a")].filter(isOff).map((link) => link.textContent),
      overfull: sheet.scrollHeight > sheet.clientHeight,
      escaped: [...document.querySelectorAll(".tile")]
        .filter((tile) => tile.querySelector(".chip").getBoundingClientRect().right > tile.getBoundingClientRect().right)
        .map((tile) => tile.querySelector(".chip").textContent),
    };
  });

  if (overflow > 0) problems.push(`${width}px: ${overflow}px of sideways scroll`);
  if (offscreen.length) problems.push(`${width}px: nav off screen: ${offscreen.join(", ")}`);
  if (overfull) problems.push(`${width}px: the headline overflows its sheet`);
  if (escaped.length) problems.push(`${width}px: chip outside its tile: ${escaped.join(", ")}`);
  await page.close();
}

// Text that overflows a pinned stage can't be scrolled to, so it's simply lost.
let pinnedAnywhere = false;
for (const [width, height] of [[390, 844], [768, 896], [768, 1024], [960, 704], [1024, 768], [1280, 720], [1440, 900]]) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto(url);
  const clipped = await page.evaluate(async () => {
    const stage = document.querySelector(".apart-stage");
    if (getComputedStyle(stage).position !== "sticky") return null;
    const track = document.querySelector(".apart-track");
    const navBottom = document.querySelector(".nav").getBoundingClientRect().bottom;
    const start = track.getBoundingClientRect().top + scrollY;
    const room = track.offsetHeight - innerHeight;
    const lost = [];
    for (const item of document.querySelectorAll(".apart-decisions li")) {
      const middle = (parseFloat(item.style.getPropertyValue("--from")) + parseFloat(item.style.getPropertyValue("--to"))) / 2;
      scrollTo({ top: start + (room * middle) / 100, behavior: "instant" });
      await new Promise(requestAnimationFrame);
      await new Promise(requestAnimationFrame);
      const { top, bottom } = item.getBoundingClientRect();
      if (top < navBottom || bottom > innerHeight) lost.push(item.querySelector("h3").textContent);
    }
    return lost;
  });
  if (clipped) pinnedAnywhere = true;
  if (clipped?.length) problems.push(`${width}x${height}: decision clipped in the pinned stage: ${clipped.join(" | ")}`);
  await page.close();
}

// The pause button is the promise that makes moving recordings acceptable, so it gets driven for real.
const moving = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await moving.goto(url);
const recording = moving.locator(".loop").first();
const canPlay = await recording.locator("video").evaluate((video) => video.canPlayType("video/webm") !== "");
if (canPlay) {
  await recording.scrollIntoViewIfNeeded();
  await moving.waitForFunction(() => !document.querySelector(".loop video").paused, null, { timeout: 15000 }).catch(() => problems.push("a recording did not start"));
  await recording.locator("button").click();
  if (!(await recording.locator("video").evaluate((video) => video.paused))) problems.push("the pause button did not stop the recording");
} else {
  console.log(`${engine} reports no WebM support, so it shows the still poster`);
}
await moving.close();

const stillContext = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1440, height: 900 } });
const still = await stillContext.newPage();
await still.goto(url, { waitUntil: "networkidle" });
for (const video of await still.locator("video").all()) {
  await video.scrollIntoViewIfNeeded();
  await still.waitForTimeout(300);
  if (!(await video.evaluate((element) => element.paused))) problems.push("reduced motion: a recording is playing");
}
const { pinned, faded, running } = await still.evaluate(() => ({
  pinned: getComputedStyle(document.querySelector(".apart-stage")).position === "sticky",
  faded: [...document.querySelectorAll(".apart-decisions li")].filter((item) => getComputedStyle(item).opacity !== "1").length,
  running: document.getAnimations().filter((animation) => animation.playState === "running").length,
}));
if (pinned) problems.push("reduced motion: the take-apart is still pinned");
if (faded) problems.push(`reduced motion: ${faded} decisions are not fully visible`);
if (running) problems.push(`reduced motion: ${running} animations are running`);
for (const text of decisions) {
  if (!(await still.getByText(text, { exact: true }).isVisible())) problems.push(`reduced motion: "${text}" is not visible`);
}

const noScript = await browser.newContext({ javaScriptEnabled: false });
const page = await noScript.newPage();
await page.goto(url);
for (const text of [site.name, site.headline, ...projects.map((project) => project.name), ...decisions, site.email]) {
  if (!(await page.getByText(text, { exact: true }).first().isVisible())) problems.push(`no JavaScript: "${text}" is not visible`);
}

await browser.close();

if (problems.length) {
  console.error(problems.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`check passed in ${engine}, take-apart ${pinnedAnywhere ? "pinned where there's room" : "still everywhere"}`);
}
