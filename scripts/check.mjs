// Run against a running site: node scripts/check.mjs http://localhost:3000 [chromium|firefox|webkit]
// Home, at each size: no sideways scroll, nav on screen, each sheet's paragraph clear of its name and its copy.
// Journey: the 3D starts, the skip button is compact while scrolling and open after, and it reaches Experience.
// Case study: pinned decisions fit their stage, and a recording plays and pauses.
// Reduced motion: stills, nothing moving. JavaScript off: all the content still shows.
import { chromium, firefox, webkit } from "playwright-core";
import { experience, journey, projects, site, studies } from "../lib/content.ts";

const url = process.argv[2] ?? "http://localhost:3000";
const engine = process.argv[3] ?? "chromium";
const webgl = ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"]; // headless Chrome has no GPU
const browser = await { chromium, firefox, webkit }[engine].launch(engine === "chromium" ? { channel: "chrome", args: webgl } : {});
const problems = [];
const study = `${url}/work/paperboxd`;
const decisions = projects.flatMap((project) => project.layers ?? []).map((layer) => layer.decision);

for (const [width, height] of [[320, 640], [390, 844], [768, 1024], [1024, 768], [1440, 900]]) {
  const page = await browser.newPage({ viewport: { width, height } });
  page.on("pageerror", (error) => problems.push(`${width}px: page error: ${error.message}`));
  await page.goto(url, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);

  const { overflow, offscreen, crowded } = await page.evaluate(() => {
    const root = document.documentElement;
    const isOff = (link) => {
      const { left, right } = link.getBoundingClientRect();
      return left < 0 || right > root.clientWidth;
    };
    const textBottom = (element) => {
      const range = document.createRange();
      range.selectNodeContents(element);
      return range.getBoundingClientRect().bottom;
    };
    const crowded = [...document.querySelectorAll(".stop")].filter((stop) => {
      const more = stop.querySelector(".more");
      if (getComputedStyle(more).display === "none") return false;
      scrollTo({ top: stop.getBoundingClientRect().top + scrollY, behavior: "instant" });
      const { top, bottom } = more.getBoundingClientRect();
      return bottom > stop.querySelector(".about").getBoundingClientRect().top || top < textBottom(stop.querySelector(".name")) - 12;
    });
    scrollTo({ top: 0, behavior: "instant" });
    return {
      overflow: root.scrollWidth - root.clientWidth,
      offscreen: [...document.querySelectorAll("nav a")].filter(isOff).map((link) => link.textContent),
      crowded: crowded.map((stop) => stop.id),
    };
  });

  if (overflow > 0) problems.push(`${width}px: ${overflow}px of sideways scroll`);
  if (offscreen.length) problems.push(`${width}px: nav off screen: ${offscreen.join(", ")}`);
  if (crowded.length) problems.push(`${width}x${height}: paragraph collides with its sheet's type: ${crowded.join(", ")}`);
  await page.close();
}

// The journey, driven for real.
const moving = await browser.newPage({ viewport: { width: 1440, height: 900 } });
moving.on("pageerror", (error) => problems.push(`journey: page error: ${error.message}`));
await moving.goto(url, { waitUntil: "load" });
await moving.waitForFunction(() => document.documentElement.classList.contains("gl"), null, { timeout: 40000 }).catch(() => problems.push("journey: the 3D never started"));
await moving.evaluate(() => scrollTo({ top: document.querySelector("#stickynotes").getBoundingClientRect().top + scrollY, behavior: "instant" }));
await moving.waitForTimeout(900);
await moving.mouse.move(700, 450);
for (let i = 0; i < 4; i += 1) {
  await moving.mouse.wheel(0, 150);
  await moving.waitForTimeout(60);
}
const skipWidth = () => moving.locator("#skip").evaluate((link) => link.getBoundingClientRect().width);
const compact = await moving.locator("#skip").evaluate((link) => link.classList.contains("tight"));
if (!compact) problems.push("journey: the skip button stayed open while scrolling");
await moving.waitForTimeout(1200);
if ((await skipWidth()) < 120) problems.push("journey: the skip button did not open after scrolling stopped");
await moving.locator("#skip").click();
await moving.waitForFunction(() => Math.abs(document.querySelector("#experience").getBoundingClientRect().top) < 4, null, { timeout: 8000 }).catch(() => problems.push("journey: skip did not reach Experience"));
await moving.close();

// Text that overflows a pinned stage can't be scrolled to, so it's simply lost.
let pinnedAnywhere = false;
for (const [width, height] of [[390, 844], [768, 896], [768, 1024], [960, 704], [1024, 768], [1280, 720], [1440, 900]]) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto(study);
  const clipped = await page.evaluate(async () => {
    const stage = document.querySelector(".apart-stage");
    if (getComputedStyle(stage).position !== "sticky") return null;
    const track = document.querySelector(".apart-track");
    const start = track.getBoundingClientRect().top + scrollY;
    const room = track.offsetHeight - innerHeight;
    const lost = [];
    for (const item of document.querySelectorAll(".apart-decisions li")) {
      const middle = (parseFloat(item.style.getPropertyValue("--from")) + parseFloat(item.style.getPropertyValue("--to"))) / 2;
      scrollTo({ top: start + (room * middle) / 100, behavior: "instant" });
      await new Promise(requestAnimationFrame);
      await new Promise(requestAnimationFrame);
      const { top, bottom } = item.getBoundingClientRect();
      if (top < 0 || bottom > innerHeight) lost.push(item.querySelector("h3").textContent);
    }
    return lost;
  });
  if (clipped) pinnedAnywhere = true;
  if (clipped?.length) problems.push(`${width}x${height}: decision clipped in the pinned stage: ${clipped.join(" | ")}`);
  await page.close();
}

// The pause button is the promise that makes moving recordings acceptable.
const recordingPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await recordingPage.goto(study);
const recording = recordingPage.locator(".loop").first();
if (await recording.locator("video").evaluate((video) => video.canPlayType("video/webm") !== "")) {
  await recording.scrollIntoViewIfNeeded();
  await recordingPage.waitForFunction(() => !document.querySelector(".loop video").paused, null, { timeout: 15000 }).catch(() => problems.push("a recording did not start"));
  await recording.locator("button").click();
  if (!(await recording.locator("video").evaluate((video) => video.paused))) problems.push("the pause button did not stop the recording");
} else {
  console.log(`${engine} reports no WebM support, so it shows the still poster`);
}
await recordingPage.close();

// Reduced motion
const stillContext = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1440, height: 900 } });
const still = await stillContext.newPage();
await still.goto(url, { waitUntil: "networkidle" });
const home = await still.evaluate(() => ({
  gl: document.documentElement.classList.contains("gl"),
  stills: [...document.querySelectorAll(".still")].filter((image) => getComputedStyle(image).display !== "none").length,
  skip: document.querySelector("#skip").getBoundingClientRect().width,
}));
if (home.gl) problems.push("reduced motion: the 3D started");
if (home.stills !== projects.length) problems.push(`reduced motion: ${home.stills} stills showing`);
if (home.skip < 120) problems.push("reduced motion: the skip button should stay open");
await still.goto(study, { waitUntil: "networkidle" });
const { pinned, running } = await still.evaluate(() => ({
  pinned: getComputedStyle(document.querySelector(".apart-stage")).position === "sticky",
  running: document.getAnimations().filter((animation) => animation.playState === "running").length,
}));
if (pinned) problems.push("reduced motion: the take-apart is still pinned");
if (running) problems.push(`reduced motion: ${running} animations are running`);
for (const text of decisions) {
  if (!(await still.getByText(text, { exact: true }).isVisible())) problems.push(`reduced motion: "${text}" is not visible`);
}

// JavaScript off
const noScript = await browser.newContext({ javaScriptEnabled: false });
const page = await noScript.newPage();
await page.goto(url);
const homeCopy = [site.email, ...projects.map((project) => project.name), ...Object.values(journey).flatMap(({ plain, detail }) => [plain, detail]), ...experience.map((job) => job.company)];
for (const text of homeCopy) {
  if (!(await page.getByText(text, { exact: true }).first().isVisible())) problems.push(`no JavaScript: "${text}" is not visible`);
}
for (const { slug } of studies) {
  if ((await page.goto(`${url}/work/${slug}`)).status() !== 200) problems.push(`/work/${slug} did not load`);
}

await browser.close();

if (problems.length) {
  console.error(problems.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`check passed in ${engine}, take-apart ${pinnedAnywhere ? "pinned where there's room" : "still everywhere"}`);
}
