// @ts-nocheck
// ponytail: imperative scene code, ported as is from the prototype the user approved, so it stays unchecked: types would add nothing to it.
// It runs once on a full page load. Links to and from case studies are plain anchors, so there's no teardown to write.
// three stays at 0.147.0 because these lights and colours were tuned there. Upgrade path: retune them when bumping.
let started = false;

export function startJourney() {
if (started) return;
started = true;
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (t) => 1 - Math.pow(1 - clamp(t), 3);
const seg = (p, a, b) => clamp((p - a) / (b - a));
const rad = (d) => (d * Math.PI) / 180;
const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
const TEST = navigator.webdriver; // automated checks skip the smoothing and the struggling-device fallback
const root = document.documentElement;
const tone = (element, name) => getComputedStyle(element).getPropertyValue(name).trim();
const fam = (name) => getComputedStyle(root).getPropertyValue(name).trim();
const HAND = fam("--font-hand"), CASLON = fam("--font-caslon"), SANS = fam("--font-sentence"), MONO = fam("--font-figure"); // next/font hashes the family names
const journey = $("#journey"), stops = $$(".stop"), skip = $("#skip"), hero = $(".hero");

/* Page geometry, measured once and on resize. */
const geo = { jTop: 0, jH: 0, vh: 1, vw: 1, tops: [], hs: [] };
function measure() {
  geo.vh = $(".stage").clientHeight || innerHeight; geo.vw = root.clientWidth;
  geo.jTop = journey.getBoundingClientRect().top + scrollY; geo.jH = journey.offsetHeight;
  geo.tops = stops.map((s) => s.getBoundingClientRect().top + scrollY); geo.hs = stops.map((s) => s.offsetHeight);
}

/* A tap on the sentence: the page takes the project's colour, the sticker comes forward, and we cut to its sheet. */
$$(".w").forEach((a) => a.addEventListener("click", (e) => {
  e.preventDefault();
  const stop = $(a.getAttribute("href")), top = stop.getBoundingClientRect().top + scrollY;
  const go = () => scrollTo({ top, behavior: "instant" });
  if (calm) return go();
  hero.style.setProperty("--hg", tone(stop, "--g"));
  hero.style.setProperty("--hi", tone(stop, "--i"));
  hero.classList.add("leaving");
  const img = $("img", a), from = img.getBoundingClientRect(), fly = img.cloneNode();
  fly.className = "stick";
  fly.style.cssText = `position:fixed;left:${from.left}px;top:${from.top}px;width:${from.width}px;height:${from.height}px;z-index:30;max-width:none`;
  document.body.append(fly);
  const narrow = geo.vw < 760, width = narrow ? geo.vw * 0.7 : Math.min(geo.vw * 0.34, geo.vh * 0.6), k = width / from.width;
  const dx = (narrow ? 0.5 : 0.66) * geo.vw - (from.left + from.width / 2), dy = (narrow ? 0.47 : 0.52) * geo.vh - (from.top + from.height / 2);
  fly.animate([{ transform: "none" }, { transform: `translate(${dx}px,${dy}px) scale(${k})` }], { duration: 520, easing: "cubic-bezier(.16,1,.3,1)", fill: "forwards" });
  setTimeout(() => {
    go();
    hero.classList.remove("leaving");
    hero.style.removeProperty("--hg"); hero.style.removeProperty("--hi");
    fly.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: "forwards" }).onfinish = () => fly.remove();
  }, 520);
}));

/* The tab's icon is the keychain's cat, on the colours of the sheet you're on. It walks while you scroll, the way you scroll. */
const WALK = [["..........x.x", "x.........xxx", "x.........xwx", "xx....xxxxxxx", ".xxxxxxxxxxx.", "..xxxxxxxxxx.", "..xxxxxxxxx..", "..x.x....x.x."], ["..........x.x", "x.........xxx", "x.........xwx", "xx....xxxxxxx", ".xxxxxxxxxxx.", "..xxxxxxxxxx.", "..xxxxxxxxx..", "...x.x..x.x.."]];
const iconCanvas = document.createElement("canvas"); iconCanvas.width = iconCanvas.height = 64;
let iconKey = "-101", iconY = scrollY, iconDir = 1;   // the static icon already shows this first frame
function tabIcon(i) {
  const y = scrollY;
  if (!calm && y !== iconY) iconDir = y > iconY ? 1 : -1;
  iconY = y;
  const frame = calm ? 0 : Math.floor(y / 48) % 2, key = `${i}${frame}${iconDir}`;
  if (key === iconKey) return;
  iconKey = key;
  const from = stops[i], g = from ? tone(from, "--g") : tone(root, "--yellow"), ink = from ? tone(from, "--i") : tone(root, "--black");
  const x = iconCanvas.getContext("2d"); x.clearRect(0, 0, 64, 64);
  x.fillStyle = g; x.beginPath(); x.roundRect(0, 0, 64, 64, 12); x.fill();
  WALK[frame].forEach((row, j) => [...row].forEach((ch, c) => { if (ch === ".") return; x.fillStyle = ch === "w" ? (from ? g : "#fff") : ink; x.fillRect((2 + (iconDir > 0 ? c : 12 - c)) * 4, (4 + j) * 4, 4, 4); }));
  const href = iconCanvas.toDataURL();
  $$('link[rel="icon"]').forEach((link) => { link.type = "image/png"; link.removeAttribute("sizes"); link.href = href; });
}

/* Skip: compact with a filling ring while you scroll, opens half a second after you stop. */
let skipTimer, sheet = -1;
function onScroll(fromScroll = true) {
  const y = scrollY, { vh, jTop, jH, tops, hs } = geo;
  skip.style.setProperty("--p", clamp((y - jTop) / (jH - vh)).toFixed(4));
  skip.classList.toggle("off", y + vh * 0.55 < jTop);
  const mid = y + vh * 0.5;
  const i = tops.findIndex((t, k) => mid >= t && mid < t + hs[k]);
  if (i !== sheet) document.body.style.backgroundColor = i === -1 ? "" : tone(stops[i], "--g");
  if (i !== -1 && i !== sheet) {
    sheet = i;
    skip.style.setProperty("--bg", tone(stops[i], "--i"));
    skip.style.setProperty("--fg", tone(stops[i], "--g"));
  }
  if (i === -1) sheet = -1;
  tabIcon(i);
  if (calm || !fromScroll) return;
  skip.classList.add("tight");
  clearTimeout(skipTimer);
  skipTimer = setTimeout(() => skip.classList.remove("tight"), 500);
}
addEventListener("scroll", () => onScroll(true), { passive: true });

measure(); onScroll(false);
new ResizeObserver(() => { measure(); onScroll(false); }).observe(document.body);

/* ------------------------------------------------------------------ 3D ------------------------------------------------------------------ */
const stills = () => { root.classList.add("calm"); root.classList.remove("gl"); window.__still = true; measure(); onScroll(false); };
if (calm) { stills(); return; }

const loadImg = (src) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });

/* Three loads after the Sentence has had its moment. */
(window.requestIdleCallback || ((f) => setTimeout(f, 300)))(async () => {
  try {
    const [T, { GLTFLoader }] = await Promise.all([import("three"), import("three/examples/jsm/loaders/GLTFLoader.js")]);
    await Promise.all([`600 60px ${HAND}`, `600 44px ${CASLON}`, `700 40px ${SANS}`, `500 20px ${MONO}`].map((f) => document.fonts.load(f).catch(() => {})));
    const [butterflyImg, macImg, posterImg] = await Promise.all(["/stickers/butterfly.webp", "/stickers/mac.webp", "/loops/thelocalcode.jpg"].map(loadImg));
    build({ T, GLTFLoader, butterflyImg, macImg, posterImg });
  } catch (err) { console.error(err); stills(); }
}, { timeout: 900 });

function build({ T, GLTFLoader, butterflyImg, macImg, posterImg }) {
  let renderer;
  try { renderer = new T.WebGLRenderer({ canvas: $("#gl"), alpha: true, antialias: true }); } catch { return stills(); }
  renderer.outputEncoding = T.sRGBEncoding;
  renderer.setClearColor(0, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.VSMShadowMap;
  const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());

  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(30, 1, 0.1, 80);
  camera.position.set(0, 0, 11);
  scene.add(new T.HemisphereLight(0xfff5e6, 0x9a8f86, 0.66));
  const key = new T.DirectionalLight(0xffffff, 0.6);
  key.position.set(-4.5, 7, 10); key.target.position.set(0, 0, -1);
  key.castShadow = true; key.shadow.mapSize.set(1024, 1024); key.shadow.radius = 7; key.shadow.blurSamples = 12;
  Object.assign(key.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, near: 2, far: 30 });
  scene.add(key, key.target);
  const wall = new T.Mesh(new T.PlaneGeometry(60, 60), new T.ShadowMaterial({ opacity: 0.24, depthWrite: false }));
  wall.position.z = -1.9; wall.receiveShadow = true; wall.renderOrder = -1; scene.add(wall);

  /* Shared bits: painted textures, rounded blocks. */
  const rand = (a, b) => a + Math.random() * (b - a);
  const paint = (w, h, draw, o = {}) => {
    const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h);
    const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.anisotropy = aniso;
    if (o.pixel) { t.magFilter = t.minFilter = T.NearestFilter; t.generateMipmaps = false; }
    return t;
  };
  const gouache = (x, w, h, base, { n = 240, j = 7, len = [50, 190], wid = [6, 26], a = [0.05, 0.15], angle = 0, spread = 0.22 } = {}) => {
    x.fillStyle = base; x.fillRect(0, 0, w, h);
    const hsl = {}; new T.Color(base).getHSL(hsl);
    x.lineCap = "round";
    for (let i = 0; i < n; i++) {
      x.strokeStyle = `hsla(${hsl.h * 360 + rand(-4, 4)},${hsl.s * 100 + rand(-6, 6)}%,${hsl.l * 100 + rand(-j, j)}%,${rand(a[0], a[1])})`;
      x.lineWidth = rand(wid[0], wid[1]);
      const px = rand(0, w), py = rand(0, h), an = angle + rand(-spread, spread), l = rand(len[0], len[1]);
      x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + Math.cos(an) * l * 0.5 + rand(-8, 8), py + Math.sin(an) * l * 0.5 + rand(-8, 8), px + Math.cos(an) * l, py + Math.sin(an) * l); x.stroke();
    }
  };
  const std = (o) => new T.MeshStandardMaterial({ roughness: 0.92, metalness: 0, ...o });
  const basic = (o) => new T.MeshBasicMaterial(o);
  const mesh = (g, m, parent, x = 0, y = 0, z = 0, cast = true) => { const n = new T.Mesh(g, m); n.position.set(x, y, z); n.castShadow = cast; if (parent) parent.add(n); return n; };
  const rrShape = (w, h, r) => {
    const s = new T.Shape(), X = w / 2, Y = h / 2, q = Math.min(r, X, Y);
    s.moveTo(-X + q, -Y); s.lineTo(X - q, -Y); s.quadraticCurveTo(X, -Y, X, -Y + q); s.lineTo(X, Y - q); s.quadraticCurveTo(X, Y, X - q, Y);
    s.lineTo(-X + q, Y); s.quadraticCurveTo(-X, Y, -X, Y - q); s.lineTo(-X, -Y + q); s.quadraticCurveTo(-X, -Y, -X + q, -Y);
    return s;
  };
  const planarUV = (g, w, h) => { const P = g.attributes.position, U = g.attributes.uv; for (let i = 0; i < P.count; i++) U.setXY(i, P.getX(i) / w + 0.5, P.getY(i) / h + 0.5); return g; };
  const rbox = (w, h, d, r = 0.05) => {
    const b = Math.min(r * 0.6, d * 0.42);
    const g = new T.ExtrudeGeometry(rrShape(w - 2 * b, h - 2 * b, Math.max(r - b, 0.005)), { depth: Math.max(d - 2 * b, 0.001), bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: 3, curveSegments: 8 });
    g.translate(0, 0, -(d - 2 * b) / 2);
    return planarUV(g, w, h);
  };
  const rplane = (w, h, r) => planarUV(new T.ShapeGeometry(rrShape(w, h, r), 8), w, h);
  const cover = (t, iw, ih, aspect) => { const a = iw / ih; if (a > aspect) { t.repeat.set(aspect / a, 1); t.offset.set((1 - aspect / a) / 2, 0); } else { t.repeat.set(1, a / aspect); t.offset.set(0, (1 - a / aspect) / 2); } };
  const imgTex = (im) => { const t = new T.Texture(im); t.needsUpdate = true; t.encoding = T.sRGBEncoding; t.anisotropy = aniso; return t; };

  /* 1. Paperboxd: a kraft box that opens, and books that rise out of it. */
  function makeBox() {
    const r = new T.Group(), g = new T.Group(); r.add(g); g.position.y = -0.42;
    const W = 2.7, H = 1.62, D = 1.9, t = 0.055;
    const outer = std({ map: paint(512, 512, (x, w, h) => gouache(x, w, h, "#c89c63", { n: 300, j: 6, spread: 0.1 })) });
    const inner = std({ color: "#7d5a33" }), edge = std({ color: "#b48a54" });
    const panel = (w, h, d, m, x, y, z) => mesh(new T.BoxGeometry(w, h, d), m, g, x, y, z);
    panel(W, t, D, [edge, edge, inner, edge, edge, edge], 0, -H / 2, 0);
    panel(W, H, t, [edge, edge, edge, edge, outer, inner], 0, 0, D / 2);
    panel(W, H, t, [edge, edge, edge, edge, inner, outer], 0, 0, -D / 2);
    panel(t, H, D, [outer, inner, edge, edge, edge, edge], W / 2, 0, 0);
    panel(t, H, D, [inner, outer, edge, edge, edge, edge], -W / 2, 0, 0);
    const label = paint(512, 232, (x, w, h) => { gouache(x, w, h, "#efe4c8", { n: 70, j: 3, wid: [4, 14] }); x.fillStyle = "#2b2419"; x.font = `600 104px ${HAND}`; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText("paperboxd", w / 2, h / 2 + 6); });
    mesh(new T.PlaneGeometry(1.2, 0.54), std({ map: label }), g, 0, -0.44, D / 2 + t / 2 + 0.004, false);
    const flaps = [];
    const flap = (len, wide, x, z, ry, lift, angle, delay) => {
      const pivot = new T.Group(); pivot.position.set(x, H / 2 + lift, z); pivot.rotation.y = ry; g.add(pivot);
      const hinge = new T.Group(); pivot.add(hinge);
      mesh(new T.BoxGeometry(wide, t * 0.7, len), [edge, edge, outer, inner, edge, edge], hinge, 0, 0, -len / 2);
      flaps.push({ hinge, angle, delay });
    };
    flap(D / 2 - 0.02, W, 0, D / 2, 0, 0.03, rad(262), 0);
    flap(D / 2 - 0.02, W, 0, -D / 2, Math.PI, 0.03, rad(108), 0.06);
    flap(W / 2 - 0.42, D, W / 2, 0, Math.PI / 2, 0, rad(142), 0.13);
    flap(W / 2 - 0.42, D, -W / 2, 0, -Math.PI / 2, 0, rad(142), 0.17);
    const pages = std({ color: "#efe6cf" });
    const set = [["Middlemarch", "#a8361f", "#ecca7a", 0.43, 0.02], ["Persuasion", "#ece0c2", "#6b4d26", 0.37, 0.14], ["Anna Karenina", "#1e5a3c", "#ecca7a", 0.45, 0.26], ["The Waste Land", "#25282a", "#ecca7a", 0.35, 0.08], ["Ulysses", "#b5472a", "#f3dfb0", 0.41, 0.17]];
    const bh = 1.44, bd = 1.26, gap = 0.012, total = set.reduce((a, b) => a + b[3] + gap, -gap);
    let cx = -total / 2;
    const books = set.map(([title, color, gold, th, extra]) => {
      const coverMat = std({ map: paint(128, 256, (x, w, h) => gouache(x, w, h, color, { n: 60, j: 5, wid: [4, 12], len: [20, 80], spread: 1.4 })) });
      const spine = std({ map: paint(128, 640, (x, w, h) => {
        gouache(x, w, h, color, { n: 90, j: 5, wid: [4, 14], len: [30, 120], angle: Math.PI / 2 });
        x.fillStyle = gold; [46, 70, h - 70, h - 46].forEach((y) => x.fillRect(0, y, w, 8));
        x.save(); x.translate(w / 2, h / 2); x.rotate(-Math.PI / 2); x.font = `600 66px ${CASLON}`; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(title, 0, 3); x.restore();
      }) });
      const x0 = cx + th / 2; cx += th + gap;
      const m = mesh(new T.BoxGeometry(th, bh, bd), [coverMat, coverMat, pages, pages, spine, pages], g, x0, -H / 2 + t / 2 + bh / 2, 0);
      return { m, x0, y0: m.position.y, rise: 0.6 + extra };
    });
    return { root: r, maxW: 4.1, maxH: 3.5, update(p, e, v, time) {
      flaps.forEach((f) => (f.hinge.rotation.x = ease(seg(p, 0.02 + f.delay, 0.34 + f.delay)) * f.angle));
      books.forEach((b, i) => { const k = ease(seg(p, 0.26 + i * 0.05, 0.74 + i * 0.03)); b.m.position.y = b.y0 + k * b.rise; b.m.position.x = b.x0 * (1 + k * 0.1); b.m.rotation.z = -(i - 2) * 0.045 * k; });
      g.rotation.y = lerp(-0.62, 0.3, ease(p)) + Math.sin(time * 0.5) * 0.012;
      g.rotation.x = lerp(0.3, 0.5, ease(p));
    } };
  }

  /* 2. stickynotes: a notebook opens and a pencil marks the line. */
  function makeNotebook() {
    const r = new T.Group(), g = new T.Group(); r.add(g);
    const W = 2.1, H = 2.85, Tk = 0.26;
    const kraft = paint(1024, 1390, (x, w, h) => {
      gouache(x, w, h, "#bb8f5e", { n: 700, j: 6, spread: 0.12, wid: [8, 34], len: [80, 300] });
      x.fillStyle = "#f0e6cb"; x.beginPath(); x.roundRect(170, 210, 640, 300, 26); x.fill();
      x.strokeStyle = "#c7b892"; x.lineWidth = 6; [300, 370, 440].forEach((y) => { x.beginPath(); x.moveTo(220, y); x.lineTo(760, y); x.stroke(); });
      x.fillStyle = "#4d3a2a"; x.font = `600 88px ${HAND}`; x.textAlign = "center"; x.fillText("stickynotes", w / 2 - 10, 288);
      x.fillStyle = "#3a2c20"; x.fillRect(860, 0, 54, h);
      x.save(); x.translate(260, 1060);
      const star = (R, fill) => { x.fillStyle = fill; x.beginPath(); for (let i = 0; i < 10; i++) { const ra = i % 2 ? R * 0.52 : R, a = -Math.PI / 2 + (i * Math.PI) / 5; x.lineTo(Math.cos(a) * ra, Math.sin(a) * ra); } x.closePath(); x.lineJoin = "round"; x.lineWidth = R * 0.22; x.strokeStyle = fill; x.stroke(); x.fill(); };
      star(160, "#fff"); star(130, "#f3c13b");
      x.fillStyle = "#3a2c20"; x.beginPath(); x.arc(-34, -6, 11, 0, 7); x.arc(34, -6, 11, 0, 7); x.fill();
      x.lineWidth = 8; x.strokeStyle = "#3a2c20"; x.lineCap = "round"; x.beginPath(); x.arc(0, 8, 22, 0.25, Math.PI - 0.25); x.stroke();
      x.restore();
    });
    const paperCol = "#f8f3e4";
    const leftPage = paint(1000, 1380, (x, w, h) => {
      x.fillStyle = paperCol; x.fillRect(0, 0, w, h);
      x.strokeStyle = "#dfe3e6"; x.lineWidth = 3; for (let y = 240; y < h - 60; y += 90) { x.beginPath(); x.moveTo(60, y); x.lineTo(w - 60, y); x.stroke(); }
      x.fillStyle = "#3a3026"; x.font = `600 108px ${HAND}`; x.fillText("poems", 110, 210);
      x.strokeStyle = "#b68235"; x.lineWidth = 6; x.beginPath(); x.moveTo(110, 228); x.lineTo(330, 228); x.stroke();
    });
    const verse = ["Hope is the thing with feathers", "That perches in the soul,", "And sings the tune without the words,", "And never stops at all."];
    const pageCanvas = document.createElement("canvas"); pageCanvas.width = 1000; pageCanvas.height = 1380;
    const pageCtx = pageCanvas.getContext("2d");
    pageCtx.font = `600 66px ${HAND}`;
    const lineW = pageCtx.measureText(verse[0]).width, X0 = 80, LINES = [330, 420, 510, 600];
    const drawPage = (k) => {
      const x = pageCtx; x.fillStyle = paperCol; x.fillRect(0, 0, 1000, 1380);
      x.strokeStyle = "#dfe3e6"; x.lineWidth = 3; for (let y = 240; y < 1320; y += 90) { x.beginPath(); x.moveTo(60, y); x.lineTo(940, y); x.stroke(); }
      if (k > 0) { x.fillStyle = "rgba(255, 205, 40, 0.72)"; x.fillRect(X0 - 12, LINES[0] - 58, (lineW + 24) * k, 76); }
      x.fillStyle = "#2c2520"; x.font = `600 66px ${HAND}`; x.textAlign = "left"; verse.forEach((l, i) => x.fillText(l, X0, LINES[i]));
    };
    drawPage(0);
    const pageTex = new T.CanvasTexture(pageCanvas); pageTex.encoding = T.sRGBEncoding; pageTex.anisotropy = aniso;
    const plainKraft = std({ color: "#a87d4e" });
    const paperEdge = std({ color: "#ebe3cf" });
    mesh(rbox(W, H, 0.05, 0.07), plainKraft, g, 0, 0, -Tk / 2);
    mesh(new T.BoxGeometry(W - 0.12, H - 0.12, Tk - 0.07), [paperEdge, paperEdge, paperEdge, paperEdge, std({ map: pageTex }), paperEdge], g, 0.015, 0, 0);
    mesh(new T.BoxGeometry(0.1, H - 0.04, Tk), std({ color: "#3a2c20" }), g, -W / 2 + 0.03, 0, 0);
    const hinge = new T.Group(); hinge.position.set(-W / 2, 0, Tk / 2); g.add(hinge);
    mesh(rbox(W, H, 0.05, 0.07), plainKraft, hinge, W / 2, 0, 0);
    mesh(new T.PlaneGeometry(W - 0.03, H - 0.03), std({ map: kraft }), hinge, W / 2, 0, 0.027, false);
    const inside = mesh(new T.PlaneGeometry(W - 0.12, H - 0.12), std({ map: leftPage }), hinge, W / 2, 0, -0.027, false);
    inside.rotation.y = Math.PI;
    /* Pencil, drawn from its tip. */
    const pencil = new T.Group(); g.add(pencil);
    const wood = std({ color: "#e6c79a" }), lead = std({ color: "#2a2a2a" }), paintYellow = std({ color: "#f1b92c", roughness: 0.55 });
    mesh(new T.ConeGeometry(0.018, 0.05, 8), lead, pencil, 0, 0.025, 0);
    mesh(new T.CylinderGeometry(0.05, 0.018, 0.14, 8), wood, pencil, 0, 0.12, 0);
    mesh(new T.CylinderGeometry(0.05, 0.05, 1.5, 8), paintYellow, pencil, 0, 0.94, 0);
    mesh(new T.CylinderGeometry(0.052, 0.052, 0.09, 8), std({ color: "#b9bcc0", roughness: 0.4, metalness: 0.2 }), pencil, 0, 1.73, 0);
    mesh(new T.CylinderGeometry(0.05, 0.05, 0.11, 8), std({ color: "#e0776f" }), pencil, 0, 1.83, 0);
    const pageW = W - 0.12, pageH = H - 0.12, top = Tk / 2 - 0.035;
    const pageX = (c) => 0.015 - pageW / 2 + (c / 1000) * pageW, pageY = (c) => pageH / 2 - (c / 1380) * pageH;
    const startX = pageX(X0), lineY = pageY(LINES[0] - 16);
    let drawn = -1;
    return { root: r, maxW: 4.5, maxH: 3.2, update(p, e, v, time) {
      const open = ease(seg(p, 0.08, 0.42));
      hinge.rotation.y = -open * rad(166);
      g.position.x = open * W * 0.46;
      g.rotation.y = lerp(-0.46, -0.06, open) + Math.sin(time * 0.5) * 0.01;
      g.rotation.x = -0.14; g.rotation.z = lerp(-0.09, 0, open);
      const a = ease(seg(p, 0.02, 0.14)), b = ease(seg(p, 0.38, 0.5)), k = seg(p, 0.5, 0.84), c = ease(seg(p, 0.86, 0.98));
      const rest = [W / 2 - 0.2, -1.06, Tk / 2 + 0.1], out = [W / 2 + 0.42, -0.7, 0.34], away = [W / 2 + 0.3, -0.5, 0.42];
      const on = [startX + (lineW / 1000) * pageW * k, lineY, top + 0.018];
      let P = rest.map((n, i) => lerp(n, out[i], a));
      P = P.map((n, i) => lerp(n, on[i], b));
      P = P.map((n, i) => lerp(n, away[i], c));
      pencil.position.set(P[0], P[1], P[2]);
      pencil.rotation.z = lerp(0, -0.62, Math.max(a * 0.6, b));
      pencil.rotation.x = lerp(0, 0.72, Math.max(a * 0.6, b));
      const hl = k > 0 ? ease(k) : 0;
      if (Math.abs(hl - drawn) > 0.004) { drawPage(hl); pageTex.needsUpdate = true; drawn = hl; }
    } };
  }

  /* 3. thelocalcode: the Mac from the painting, a floppy goes in, the site plays on the screen. */
  function makeMac() {
    const r = new T.Group(), g = new T.Group(); r.add(g);
    const W = 2.35, H = (W * 720) / 560, D = 2.3;
    const shell = std({ map: paint(512, 512, (x, w, h) => gouache(x, w, h, "#d6cdb2", { n: 220, j: 3, a: [0.04, 0.11] })), roughness: 0.82 });
    mesh(rbox(W, H, D, 0.13), shell, g);
    mesh(new T.PlaneGeometry(W, H), std({ map: imgTex(macImg), transparent: true, alphaTest: 0.4, roughness: 0.82 }), g, 0, 0, D / 2 + 0.003, false);
    const sw = 0.7549 * W, sh = 0.4486 * H, sy = (0.5 - 0.1182 - 0.2243) * H;
    const posterTex = imgTex(posterImg); cover(posterTex, posterImg.naturalWidth, posterImg.naturalHeight, sw / sh);
    const screenMat = basic({ map: posterTex, color: 0x000000 });
    mesh(rplane(sw, sh, 0.11), screenMat, g, 0, sy, D / 2 + 0.007, false);
    /* Floppy, from thelocalcode's own drawing of it. */
    const disk = new T.Group(); g.add(disk);
    const diskFace = paint(512, 532, (x, w) => {
      const s = w / 92; x.scale(s, s); x.translate(1, 1);
      x.fillStyle = "#4f47a3"; x.fillRect(-1, -1, 92, 96);
      x.fillStyle = "#c9cdd3"; x.fillRect(21, 0, 48, 31);
      x.fillStyle = "#1a1830"; x.fillRect(49, 5, 11, 20);
      x.fillStyle = "#fbf6e6"; x.beginPath(); x.roundRect(14, 44, 62, 52, 3); x.fill();
      x.strokeStyle = "#b9b4e4"; x.lineWidth = 1.2; [66, 75, 84].forEach((y) => { x.beginPath(); x.moveTo(22, y); x.lineTo(68, y); x.stroke(); });
      x.fillStyle = "#c0271c"; x.font = `600 11.5px ${HAND}`; x.textAlign = "center"; x.textBaseline = "alphabetic"; x.fillText("thelocalcode", 45, 58);
    });
    const dw = 0.66, dh = 0.69;
    mesh(rbox(dw, dh, 0.03, 0.025), std({ color: "#4f47a3" }), disk);
    mesh(new T.PlaneGeometry(dw - 0.02, dh - 0.02), std({ map: diskFace, roughness: 0.6 }), disk, 0, 0, 0.0165, false);
    const slot = { x: (0.723 - 0.5) * W, y: (0.5 - 0.712) * H };
    /* The site's own recording, playing only while this sheet is on screen. */
    const video = document.createElement("video");
    Object.assign(video, { muted: true, loop: true, playsInline: true, preload: "none" });
    video.src = "/loops/thelocalcode.webm";
    let videoTex = null, asked = false;
    const play = () => {
      if (asked) return; asked = true;
      video.play().then(() => {
        if (videoTex) return;
        videoTex = new T.VideoTexture(video); videoTex.encoding = T.sRGBEncoding;
        cover(videoTex, video.videoWidth || 16, video.videoHeight || 10, sw / sh);
        screenMat.map = videoTex; screenMat.needsUpdate = true;
      }).catch(() => {});
    };
    return { root: r, maxW: 3.0, maxH: 3.15, hide() { video.pause(); asked = false; }, update(p, e, v, time) {
      g.rotation.y = lerp(-0.72, -0.2, ease(seg(p, 0, 0.42))) + 0.12 * p + Math.sin(time * 0.5) * 0.008;
      g.rotation.x = 0.03;
      const a = ease(seg(p, 0.04, 0.3)), b = seg(p, 0.3, 0.47);
      disk.position.set(lerp(1.95, slot.x, a), lerp(1.0, slot.y, a), lerp(2.9, D / 2 + 0.72, a) - b * 1.32);
      disk.rotation.set(lerp(0.12, -Math.PI / 2, a), lerp(-0.34, 0, a), lerp(0.2, 0, a));
      disk.visible = b < 1;
      const boot = seg(p, 0.46, 0.53);
      screenMat.color.setScalar(boot * (boot < 1 ? 0.75 + 0.25 * Math.sin(time * 40) : 1));
      if (boot > 0) play();
    } };
  }

  /* 4. puzzlecafe: the game's own roadster, and scrolling is the gas. */
  function makeCar() {
    const r = new T.Group(), g = new T.Group(); r.add(g); g.position.y = -0.42;
    const L = 9.5, wid = 2.1;
    const road = paint(64, 1024, (x, w, h) => {
      gouache(x, w, h, "#34322d", { n: 120, j: 3, wid: [4, 12], len: [40, 160], angle: Math.PI / 2 });
      x.globalCompositeOperation = "destination-in";
      const f = x.createLinearGradient(0, 0, 0, h); f.addColorStop(0, "rgba(0,0,0,0)"); f.addColorStop(0.16, "#000"); f.addColorStop(0.84, "#000"); f.addColorStop(1, "rgba(0,0,0,0)");
      x.fillStyle = f; x.fillRect(0, 0, w, h);
    });
    const roadMesh = mesh(new T.PlaneGeometry(wid, L), std({ map: road, transparent: true }), g, 0, 0, 0, false);
    roadMesh.rotation.x = -Math.PI / 2;
    const walkers = [];
    const dashMat = basic({ color: 0xf6f1df, transparent: true });
    for (let i = 0; i < 6; i++) { const d = mesh(new T.PlaneGeometry(0.1, 0.62), dashMat.clone(), g, 0, 0.006, 0, false); d.rotation.x = -Math.PI / 2; walkers.push({ n: d, z0: (i / 6) * L, fade: true }); }
    const soft = paint(64, 64, (x, w) => { const a = x.createRadialGradient(w / 2, w / 2, 2, w / 2, w / 2, w / 2); a.addColorStop(0, "rgba(40,30,10,.32)"); a.addColorStop(1, "rgba(40,30,10,0)"); x.fillStyle = a; x.fillRect(0, 0, w, w); });
    const leaf = std({ map: paint(128, 256, (x, w, h) => gouache(x, w, h, "#2c5a44", { n: 150, j: 7, wid: [6, 16], len: [20, 70], angle: Math.PI / 2, spread: 0.5 })) });
    const crown = new T.SphereGeometry(0.25, 18, 14).scale(1, 2.7, 1), trunk = std({ color: 0x5a4028 });
    for (let i = 0; i < 8; i++) {
      const t = new T.Group(); g.add(t);
      mesh(new T.CylinderGeometry(0.04, 0.05, 0.2, 6), trunk, t, 0, 0.1, 0, false);
      mesh(crown, leaf, t, 0, 0.74, 0, false);
      const blob = mesh(new T.PlaneGeometry(0.9, 0.9), basic({ map: soft, transparent: true, depthWrite: false }), t, 0, 0.005, 0, false); blob.rotation.x = -Math.PI / 2;
      t.position.x = wid / 2 + 0.34 + (i % 3) * 0.55 + rand(0, 0.2);
      walkers.push({ n: t, z0: ((i + rand(0, 0.4)) / 8) * L, s: rand(0.8, 1.25) });
    }
    const holder = new T.Group(); g.add(holder);
    const under = paint(128, 128, (x, w) => { const a = x.createRadialGradient(w / 2, w / 2, 6, w / 2, w / 2, w / 2); a.addColorStop(0, "rgba(0,0,0,.72)"); a.addColorStop(0.62, "rgba(0,0,0,.5)"); a.addColorStop(1, "rgba(0,0,0,0)"); x.fillStyle = a; x.fillRect(0, 0, w, w); });
    const grounded = mesh(new T.PlaneGeometry(1.75, 3.5), basic({ map: under, transparent: true, depthWrite: false }), holder, 0, 0.012, 0, false); grounded.rotation.x = -Math.PI / 2;
    let asked = false;
    const lazy = () => {
      if (asked) return; asked = true;
      const failed = (err) => { console.error(err); $("#puzzlecafe").classList.add("no3d"); };
      const place = (gltf) => {
        const m = gltf.scene, box = new T.Box3().setFromObject(m), s = box.getSize(new T.Vector3()), c = box.getCenter(new T.Vector3());
        const k = 2.75 / Math.max(s.x, s.z);
        m.scale.setScalar(k); m.position.set(-c.x * k, -box.min.y * k, -c.z * k);
        const turn = new T.Group(); turn.add(m); if (s.x > s.z) turn.rotation.y = Math.PI / 2; holder.add(turn); holder.rotation.y = Math.PI;
        m.traverse((n) => { if (n.isMesh) { n.castShadow = true; n.material.metalness = Math.min(n.material.metalness, 0.18); n.material.roughness = Math.max(n.material.roughness, 0.42); } });
      };
      new GLTFLoader().load("/cars/coupe.glb", place, undefined, failed);
    };
    return { root: r, maxW: 3.4, maxH: 2.6, lazy, wallOff: true, update(p, e, v) {
      const o = scrollY * 0.0052;
      walkers.forEach((w) => {
        const z = (((w.z0 - o) % L) + L) % L - L / 2;   // the world rolls away behind the car
        w.n.position.z = z;
        const edge = clamp((L / 2 - Math.abs(z)) / 1.5);
        if (w.fade) w.n.material.opacity = edge; else w.n.scale.setScalar(ease(edge) * w.s);
      });
      holder.position.y = Math.sin(o * 9) * 0.008;
      holder.rotation.z = clamp(v / 9000, -0.03, 0.03);
      g.rotation.y = lerp(0.98, 0.7, p);
      g.rotation.x = 0.34;
    } };
  }

  /* 5. Desky: thelocalcode's drawing of it, in the round, with the real time on it. */
  function makeDesky() {
    const r = new T.Group(), g = new T.Group(); r.add(g); g.position.y = 0.02;
    const W = 3.5, s = W / 1394, px = (x) => (x - 697) * s, py = (y) => (465.5 - y) * s, D = 0.95;
    const shell = std({ color: "#2a292f", roughness: 0.6 }), silver = std({ color: "#ced1d6", roughness: 0.5, metalness: 0.12 }), ink = std({ color: "#0d0d0f", roughness: 0.7 });
    mesh(rbox(1382 * s, 640 * s, D, 0.12), shell, g, 0, py(560), 0);
    mesh(rbox(1322 * s, 538 * s, 0.05, 0.05), silver, g, 0, py(581), D / 2 + 0.01);
    [112, 1282].forEach((x) => mesh(rbox(100 * s, 62 * s, 0.5, 0.05), shell, g, px(x), py(885), 0));
    const screenW = 0.1966 * W, screenH = 0.4657 * 931 * s, screenY = py((0.3927 + 0.4657 / 2) * 931);
    const makeScreen = (fx) => {
      const c = document.createElement("canvas"); c.width = 256; c.height = 404;
      const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.anisotropy = aniso;
      const x0 = px((fx + 0.0983) * 1394);
      mesh(rbox(screenW + 0.07, screenH + 0.07, 0.03, 0.05), ink, g, x0, screenY, D / 2 + 0.035);
      const m = basic({ map: t, color: 0x000000 });
      mesh(new T.PlaneGeometry(screenW, screenH), m, g, x0, screenY, D / 2 + 0.052, false);
      return { x: c.getContext("2d"), t, m };
    };
    const [petS, sunS, timS] = [0.0746, 0.3056, 0.5366].map(makeScreen);
    const knob = new T.Group(); knob.position.set(px(1194), py(539), D / 2 + 0.04); g.add(knob);
    mesh(new T.CylinderGeometry(98 * s, 98 * s, 0.05, 40).rotateX(Math.PI / 2), ink, knob);
    mesh(new T.CylinderGeometry(70 * s, 76 * s, 0.17, 40).rotateX(Math.PI / 2), shell, knob, 0, 0, 0.09);
    mesh(new T.BoxGeometry(0.035, 0.12, 0.02), std({ color: "#f2efe6" }), knob, 0, 0.1, 0.18, false);
    const led = basic({ color: 0x4be06a });
    mesh(new T.SphereGeometry(20 * s, 16, 12), led, g, px(1194), py(389), D / 2 + 0.04, false);
    [672, 719, 765].forEach((y) => mesh(rbox(205 * s, 27 * s, 0.02, 0.03), ink, g, px(1194), py(y + 13), D / 2 + 0.04, false));
    const grill = paint(256, 256, (x, w) => {
      x.fillStyle = "#ced1d6"; x.beginPath(); x.arc(w / 2, w / 2, w / 2, 0, 7); x.fill();
      x.fillStyle = "#3a3a40"; for (let ring = 0; ring < 6; ring++) { const n = ring ? ring * 7 : 1; for (let k = 0; k < n; k++) { const a = (k / n) * 6.283 + ring * 0.3; x.beginPath(); x.arc(w / 2 + Math.cos(a) * ring * 20, w / 2 + Math.sin(a) * ring * 20, 6, 0, 7); x.fill(); } }
    });
    [377, 1015].forEach((cx) => {
      const a = new T.Shape(), R = 118 * s, h = 206 * s;
      a.moveTo(R, 0); a.absellipse(0, 0, R, h, 0, Math.PI, false); a.lineTo(R, 0);
      const ge = new T.ExtrudeGeometry(a, { depth: 0.6, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 2, curveSegments: 20 }); ge.translate(0, 0, -0.3);
      mesh(ge, shell, g, px(cx), py(262), 0);
      mesh(new T.CircleGeometry(84 * s, 40), std({ map: grill, roughness: 0.6 }), g, px(cx), py(166), 0.326, false);
    });
    mesh(new T.CylinderGeometry(0.05, 0.08, 48 * s, 12), shell, g, px(152), py(238), 0);
    mesh(new T.CylinderGeometry(0.014, 0.014, 188 * s, 8), silver, g, px(152), py(124), 0);
    mesh(new T.SphereGeometry(16 * s, 12, 10), silver, g, px(152), py(24), 0);
    /* Three screens, drawn live. */
    const mono = `500 15px ${MONO}`, big = (n) => `700 ${n}px ${SANS}`;
    const label = (x, t) => { x.fillStyle = "#9aa09c"; x.font = mono; x.textAlign = "left"; x.fillText(t, 16, 30); };
    const PET = ["..xxxxx..", ".xxxxxxx.", "xxxxxxxxx", "xx.xxx.xx", "xxxxxxxxx", "xxxx.xxxx", ".xxxxxxx.", "..x...x.."];
    const draw = (p, time) => {
      let x = petS.x; x.fillStyle = "#0b0d0c"; x.fillRect(0, 0, 256, 404); label(x, "PIXEL");
      x.fillStyle = "#59e27c"; const bob = Math.floor(time * 2) % 2 ? 8 : 0;
      PET.forEach((row, j) => [...row].forEach((c, i) => { if (c === "x") x.fillRect(56 + i * 16, 118 + bob + j * 16, 16, 16); }));
      x.fillStyle = "#9aa09c"; x.fillText("HAPPINESS", 16, 352); x.fillStyle = "#26302a"; x.fillRect(16, 366, 224, 8); x.fillStyle = "#59e27c"; x.fillRect(16, 366, 170, 8);
      x = sunS.x; x.fillStyle = "#0b0d0c"; x.fillRect(0, 0, 256, 404); label(x, "HOME");
      x.fillStyle = "#fff"; x.font = big(62); x.textAlign = "center"; x.fillText(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }), 128, 104);
      x.fillStyle = "#a78de6"; x.fillRect(16, 130, 224, 110); x.fillStyle = "#e4563f"; x.fillRect(16, 240, 224, 90);
      x.save(); x.beginPath(); x.rect(16, 130, 224, 200); x.clip(); x.fillStyle = "#f4c774"; x.beginPath(); x.arc(128, lerp(340, 226, p), 54, 0, 7); x.fill(); x.fillStyle = "#0b0d0c"; x.beginPath(); x.ellipse(128, 345, 180, 44, 0, 0, 7); x.fill(); x.restore();
      x = timS.x; x.fillStyle = "#0b0d0c"; x.fillRect(0, 0, 256, 404); label(x, "TIMER");
      const left = 1500 - Math.floor(p * 1500); x.fillStyle = "#fff"; x.font = big(72); x.textAlign = "center"; x.fillText(`${String(Math.floor(left / 60)).padStart(2, "0")}:${String(left % 60).padStart(2, "0")}`, 128, 214);
      x.fillStyle = "#9aa09c"; x.font = mono; x.fillText("FOCUS", 128, 248); x.fillStyle = "#26302a"; x.fillRect(16, 366, 224, 8); x.fillStyle = "#59e27c"; x.fillRect(16, 366, 224 * (left / 1500), 8);
      [petS, sunS, timS].forEach((n) => (n.t.needsUpdate = true));
    };
    let last = -1;
    return { root: r, maxW: 3.8, maxH: 2.5, update(p, e, v, time) {
      g.rotation.y = lerp(-0.6, 0.32, ease(p)) + Math.sin(time * 0.5) * 0.01; g.rotation.x = 0.07;
      knob.rotation.z = -p * 5.8;
      [petS, sunS, timS].forEach((n, i) => n.m.color.setScalar(ease(seg(p, 0.05 + i * 0.1, 0.13 + i * 0.1))));
      if (time - last > 0.11) { draw(p, time); last = time; }
    } };
  }

  /* 6. Butterfly clutcher: the painting, split at the body and hinged. Scroll speed flaps it. */
  function makeButterfly() {
    const r = new T.Group(), g = new T.Group(); r.add(g);
    const iw = butterflyImg.naturalWidth, ih = butterflyImg.naturalHeight, W = 3.9, H = (W * ih) / iw, a = 0.44;
    const slice = (u0, u1) => { const c = document.createElement("canvas"); c.width = Math.round(iw * (u1 - u0)); c.height = ih; c.getContext("2d").drawImage(butterflyImg, -iw * u0, 0); const t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.anisotropy = aniso; return t; };
    const mat = (t) => std({ map: t, transparent: true, alphaTest: 0.04, side: T.DoubleSide, roughness: 0.78 });
    const Lw = new T.Group(), Rw = new T.Group(); Lw.position.x = -(0.5 - a) * W; Rw.position.x = (0.5 - a) * W; g.add(Lw, Rw);
    mesh(new T.PlaneGeometry(a * W, H), mat(slice(0, a)), Lw, -(a * W) / 2);
    mesh(new T.PlaneGeometry(a * W, H), mat(slice(1 - a, 1)), Rw, (a * W) / 2);
    mesh(new T.PlaneGeometry(0.14 * W, H), mat(slice(0.43, 0.57)), g, 0, 0, 0.025);
    let phase = 0, drive = 0;
    return { root: r, maxW: 3.9, wideW: 4.4, maxH: 3, shiftX: 0.55, update(p, e, v, time, dt) {
      drive += (clamp(Math.abs(v) / 1500) - drive) * (1 - Math.exp(-dt * 6));
      phase += dt * (2 + 17 * drive);
      const ang = 0.2 + (0.12 + 0.95 * drive) * (0.5 + 0.5 * Math.sin(phase));
      Lw.rotation.y = ang; Rw.rotation.y = -ang;
      g.rotation.x = -0.34 + Math.sin(time * 0.7) * 0.02;
      g.rotation.z = Math.sin(time * 0.6) * 0.035 + lerp(-0.08, 0.08, p);
      g.rotation.y = lerp(-0.22, 0.22, p);
      g.position.y = drive * 0.1;
    } };
  }

  /* 7. Pixel keychain: it hangs on a peg and swings when you scroll. The cat walks whichever way you do. */
  function makeKeychain() {
    const r = new T.Group(), g = new T.Group(); r.add(g); g.position.set(-0.38, 1.5, 0);
    const swing = new T.Group(); g.add(swing);
    const metal = std({ color: "#c6cad0", roughness: 0.38, metalness: 0.18 }), ink = std({ color: "#121214", roughness: 0.6 });
    const yellow = std({ map: paint(512, 512, (x, w, h) => gouache(x, w, h, "#f2bf1d", { n: 260, j: 4, a: [0.04, 0.12] })), roughness: 0.62 });
    mesh(new T.CylinderGeometry(0.05, 0.05, 0.7, 12).rotateX(Math.PI / 2), std({ color: "#7c6a4c", roughness: 0.5 }), g, 0, 0.05, -0.2);
    mesh(new T.SphereGeometry(0.09, 16, 12), std({ color: "#7c6a4c", roughness: 0.5 }), g, 0, 0.05, 0.16);
    const ring = mesh(new T.TorusGeometry(0.46, 0.042, 12, 48), metal, swing, 0, -0.46, 0); ring.rotation.y = 0.75;
    mesh(rbox(0.66, 0.6, 0.3, 0.24), yellow, swing, 0, -1.0, 0);
    mesh(new T.CircleGeometry(0.1, 24), ink, swing, 0, -0.92, 0.152, false);
    const cx = 0.62, cy = -2.2;
    mesh(rbox(2.42, 1.98, 0.42, 0.3), yellow, swing, cx, cy, 0);
    mesh(rbox(1.84, 1.1, 0.03, 0.07), ink, swing, cx, cy + 0.11, 0.215, false);
    const SW = 100, SH = 56;
    const c = document.createElement("canvas"); c.width = SW; c.height = SH;
    const sx = c.getContext("2d"), st = new T.CanvasTexture(c);
    st.encoding = T.sRGBEncoding; st.magFilter = st.minFilter = T.NearestFilter; st.generateMipmaps = false;
    mesh(new T.PlaneGeometry(1.66, 0.93), basic({ map: st }), swing, cx, cy + 0.11, 0.232, false);
    [-0.28, 0.28].forEach((dx) => mesh(new T.CylinderGeometry(0.135, 0.135, 0.06, 28).rotateX(Math.PI / 2), ink, swing, cx + dx, cy - 0.68, 0.225, false));
    /* The key, on the ring. */
    const keyShape = new T.Shape(); keyShape.absarc(0, -0.2, 0.25, 0, Math.PI * 2, false);
    const hole = new T.Path(); hole.absarc(0, -0.09, 0.075, 0, Math.PI * 2, true); keyShape.holes.push(hole);
    const blade = new T.Shape(); [[-0.07, -0.4], [0.07, -0.4], [0.07, -1.45], [0, -1.56], [-0.07, -1.45], [-0.07, -1.36], [-0.14, -1.3], [-0.07, -1.22], [-0.07, -1.14], [-0.14, -1.08], [-0.07, -1], [-0.07, -0.4]].forEach(([x, y], i) => (i ? blade.lineTo(x, y) : blade.moveTo(x, y)));
    const keyGroup = new T.Group(); keyGroup.position.set(-0.28, -0.75, 0.255); swing.add(keyGroup);
    [keyShape, blade].forEach((sh) => mesh(new T.ExtrudeGeometry(sh, { depth: 0.03, bevelEnabled: true, bevelSize: 0.008, bevelThickness: 0.008, bevelSegments: 1, curveSegments: 20 }), metal, keyGroup));
    /* The meadow. */
    let catX = 30, dir = 1, stride = 0;
    const meadow = (time) => {
      const x = sx; x.fillStyle = "#8fd6f4"; x.fillRect(0, 0, SW, SH);
      x.fillStyle = "#f7c948"; x.fillRect(84, 6, 7, 7);
      x.fillStyle = "#fff"; const cl = Math.floor(time * 1.4) % (SW + 24); [[cl - 12, 9], [((cl + 58) % (SW + 24)) - 12, 16]].forEach(([u, y]) => { x.fillRect(u, y, 15, 3); x.fillRect(u + 3, y - 2, 8, 2); });
      x.fillStyle = "#74c97f"; for (let i = 0; i < SW; i++) { const h = Math.round(32 + Math.sin(i * 0.09) * 4 + Math.sin(i * 0.031 + 1) * 3); x.fillRect(i, h, 1, SH - h); }
      x.fillStyle = "#4fae5a"; x.fillRect(0, 42, SW, SH - 42);
      x.fillStyle = "#3f9a4b"; for (let i = 0; i < 16; i++) x.fillRect((i * 37) % SW, 44 + ((i * 13) % 11), 2, 1);
      x.fillStyle = "#fff"; for (let i = 0; i < 7; i++) x.fillRect((i * 29 + 6) % SW, 46 + ((i * 7) % 8), 1, 1);
      x.fillStyle = "#6b4a2c"; x.fillRect(15, 28, 3, 16);
      x.fillStyle = "#2f8a46"; x.fillRect(9, 18, 15, 11); x.fillRect(12, 14, 9, 4);
      const frame = WALK[Math.floor(stride) % 2];
      frame.forEach((row, j) => [...row].forEach((ch, i) => { if (ch === ".") return; x.fillStyle = ch === "w" ? "#fff" : "#17171a"; const col = dir > 0 ? i : 12 - i; x.fillRect(Math.round(catX) + col, 40 + j, 1, 1); }));
      st.needsUpdate = true;
    };
    let th = -0.14, om = 0, phi = 0, omk = 0, last = -1;
    return { root: r, maxW: 3.3, maxH: 3.5, update(p, e, v, time, dt) {
      const target = -0.14 + clamp(v / 2600, -0.42, 0.42);
      om += (-(th - target) * 13 - om * 0.75) * dt; th += om * dt;
      omk += (-(phi - th * 0.7) * 24 - omk * 1.1) * dt; phi += omk * dt;
      swing.rotation.z = th; keyGroup.rotation.z = phi - th - 0.02; keyGroup.rotation.y = 0.6;
      g.rotation.y = lerp(-0.34, 0.3, p) + Math.sin(time * 0.6) * 0.02;
      if (Math.abs(v) > 30) dir = v > 0 ? 1 : -1;
      const sp = 7 + Math.min(70, Math.abs(v) / 24);
      catX += dir * sp * dt; stride += sp * dt * 0.42;
      if (catX > SW + 2) catX = -14; if (catX < -14) catX = SW + 2;
      if (time - last > 0.08) { meadow(time); last = time; }
    } };
  }

  const makers = { paperboxd: makeBox, stickynotes: makeNotebook, thelocalcode: makeMac, puzzlecafe: makeCar, desky: makeDesky, "butterfly-clutcher": makeButterfly, "pixel-keychain": makeKeychain };
  const objs = stops.map((s) => {
    const o = makers[s.id]();
    o.root.visible = false; o.sp = 0; o.was = false;
    scene.add(o.root);
    return o;
  });

  /* Framing */
  let rest = { x: 0, y: 0 }, unit = 1;
  function frameUp() {
    measure();
    const { vw, vh } = geo, narrow = vw < 760;
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, narrow ? 1.5 : 2));
    renderer.setSize(vw, vh, false);
    camera.aspect = vw / vh; camera.updateProjectionMatrix();
    const worldH = 2 * camera.position.z * Math.tan(rad(camera.fov / 2)), worldW = worldH * camera.aspect;
    unit = worldH / vh;
    rest = narrow ? { x: 0, y: worldH * 0.035 } : { x: worldW * 0.165, y: -worldH * 0.015 };
    const availW = narrow ? worldW * 0.94 : worldW * 0.54, availH = narrow ? worldH * 0.46 : worldH * 0.64;
    objs.forEach((o) => o.root.scale.setScalar(Math.min(1.25, availW / (narrow ? o.maxW : o.wideW ?? o.maxW), availH / o.maxH)));
    onScroll(false);
  }
  frameUp();
  new ResizeObserver(frameUp).observe($(".stage"));

  /* The loop runs only while the journey is on screen. */
  let on = false, lastT = performance.now(), lastY = scrollY, vel = 0, slow = 0, count = 0, tired = 0, wallShown = 1;
  new IntersectionObserver(([en]) => { const was = on; on = en.isIntersecting; if (on && !was) { lastT = performance.now(); lastY = scrollY; requestAnimationFrame(tick); } }, { rootMargin: "10% 0px" }).observe(journey);

  function tick(now) {
    if (!on || root.classList.contains("calm")) return;
    requestAnimationFrame(tick);
    const raw = (now - lastT) / 1000; lastT = now;
    const dt = Math.min(0.05, raw || 0.016);
    const y = scrollY;
    vel += ((y - lastY) / Math.max(raw, 0.001) - vel) * (1 - Math.exp(-dt * 10)); lastY = y;
    if (Math.abs(vel) < 1) vel = 0;
    skip.style.setProperty("--nudge", clamp(vel / 900, -3, 3).toFixed(2));
    const { vh, jTop, jH, tops, hs } = geo, time = now / 1000;
    const canvasTop = clamp(jTop - y, jTop + jH - vh - y, 0);
    let wallWant = 1;
    objs.forEach((o, i) => {
      const t = tops[i] - y, H = hs[i], seen = t < vh && t + H > 0;
      if (!seen) { if (o.was) { o.root.visible = false; o.was = false; o.hide?.(); } return; }
      const p = clamp(-t / (H - vh));
      if (!o.was) { o.root.visible = true; o.was = true; o.sp = p; }
      o.sp = TEST ? p : o.sp + (p - o.sp) * (1 - Math.exp(-dt * 8));
      const off = t > 0 ? t : t + H < vh ? t + H - vh : 0, dy = off - canvasTop;
      o.root.position.set(rest.x + (geo.vw < 760 ? 0 : o.shiftX ?? 0), rest.y - dy * unit, 0);
      o.root.rotation.y = -(1 - ease(clamp(1 - t / vh))) * 0.85;
      o.update(o.sp, 0, vel, time, dt);
      if (o.wallOff) wallWant = Math.min(wallWant, clamp(Math.abs(dy) / (vh * 0.8)));
    });
    wallShown += (wallWant - wallShown) * 0.2;
    wall.material.opacity = 0.24 * wallShown;
    if (y > tops[2] - vh) objs[3].lazy();   // the car's 2.5 MB waits until the sheet before it
    renderer.render(scene, camera);
    if (!root.classList.contains("gl")) { root.classList.add("gl"); window.__built = true; }
    /* A struggling device gets the painted stills. */
    if (TEST || raw > 0.5) return;
    slow += raw; count++;
    if (count === 90) {
      const mean = slow / count; slow = 0; count = 0;
      if (mean > 0.05) { tired++; renderer.setPixelRatio(1); renderer.setSize(geo.vw, geo.vh, false); key.castShadow = false; }
      if (tired >= 2) { console.warn("Falling back to stills: this device is struggling with the 3D."); stills(); }
    }
  }
}
}
