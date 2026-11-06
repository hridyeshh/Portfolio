// Records real sites into public/loops as muted WebM, with a still poster from the first frame.
// Each page scrolls there and back with no speed at either end, so the loop has no visible seam.
//
// Run: node scripts/record-loops.mjs   (drives your installed Google Chrome)
// Once per machine: npx playwright-core install ffmpeg   (Playwright's own encoder, in its cache)
// thelocalcode isn't public yet, so start it first: (cd ../thelocalcode && npx next dev -p 3457)
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright-core";

const OUT = "public/loops";
const LOOPS = {
  // Paperboxd's pinned chapters, including its own "A diary, not a database."
  paperboxd: { url: "https://paperboxd.in", width: 1280, height: 800, scale: 0.75, from: 0.1, to: 0.36, seconds: 18 },
  // Sized to the Mac's screen in mac.webp. Ends at the shipped sites.
  thelocalcode: { url: "http://localhost:3457", width: 960, height: 734, scale: 0.625, from: 0, to: 0.31, seconds: 22 },
};

const browser = await chromium.launch({ channel: "chrome" });
await mkdir(OUT, { recursive: true });

for (const [name, { url, width, height, scale, from, to, seconds }] of Object.entries(LOOPS)) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto(url, { waitUntil: "load", timeout: 90_000 });
  await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" }); // the dev badge
  await page.waitForTimeout(4000); // past any intro animation

  const top = await page.evaluate(
    ([from, to]) => {
      const room = document.documentElement.scrollHeight - innerHeight;
      window.scrollTo({ top: from * room, behavior: "instant" });
      return [from * room, to * room];
    },
    [from, to],
  );
  await page.waitForTimeout(1200); // let the first frame settle
  await page.screenshot({ path: `${OUT}/${name}.jpg`, type: "jpeg", quality: 72 });

  // The encoder wants even dimensions. Encoded near display size, because that's most of the file weight.
  const even = (n) => Math.round((n * scale) / 2) * 2;
  await page.screencast.start({ path: `${OUT}/${name}.webm`, size: { width: even(width), height: even(height) } });
  await page.evaluate(
    ([[start, end], ms]) =>
      new Promise((done) => {
        const began = performance.now();
        const step = (now) => {
          const t = Math.min((now - began) / ms, 1);
          window.scrollTo({ top: start + (end - start) * Math.sin(Math.PI * t) ** 2, behavior: "instant" });
          if (t < 1) requestAnimationFrame(step);
          else done();
        };
        requestAnimationFrame(step);
      }),
    [top, seconds * 1000],
  );
  await page.screencast.stop();
  await page.close();
  console.log(name, "recorded");
}

await browser.close();
