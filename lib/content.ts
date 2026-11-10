// Every word on the site lives here, and the chat prompt is built from it, so page and bot cannot disagree.
// When something launches, change its status here. A link can only sit on a status that can carry one,
// so the build fails before anything claims to be live early.

export type Link = { label: string; href: string };

export type Status =
  | { state: "live" | "working"; label: string; tag: string; text: string; links: Link[] }
  | { state: "launching" | "workshop"; label: string; tag: string; text: string };

// `tag` is the status in a word or two, for the paper labels on the bench at the end.

// What a sheet draws in the take-apart figure. The strings are the figure's own words.
export type Figure =
  | { kind: "feed"; heading: string; books: string[][] }
  | { kind: "clients"; title: string; clients: string[] }
  | { kind: "code"; lines: string[] }
  | { kind: "tables"; tables: { name: string; columns: string[] }[]; note: string };

// One layer of a product: the decision, what it replaced, what it cost. The chat answers from these too.
export type Layer = {
  name: string;
  decision: string;
  body: string;
  rejected: string;
  cost: string;
  sheet: "paper" | "kraft" | "mustard" | "green";
  figure: Figure;
};

export type Project = {
  slug: string;
  name: string;
  line?: string;
  about: string;
  facts: string[];
  layers?: Layer[];
  status: Status;
};

export const site = {
  name: "Hridyesh",
  fullName: "Hridyesh Kumar",
  email: "hridyesh2309@gmail.com",
  description:
    "Hridyesh makes a social network for readers, a notebook for the best lines on the web, websites in a two-person studio, a calm little driving game, and small machines you can hold.",
  skip: "Skip to the content",
  newTab: "(opens in a new tab)",
};

export const projects: Project[] = [
  {
    slug: "paperboxd",
    name: "Paperboxd",
    line: "A diary, not a database.",
    about:
      "A social network for readers: track, rate and share the books you love. It's the project I'd point to first, because it has the most layers and I built it end to end.",
    facts: [
      "Clients: Next.js web, SwiftUI iOS and Jetpack Compose Android, and every client renders the same answers.",
      "Backend: Go, chi and sqlc, 140+ routes. PostgreSQL 16 with pgvector, 57 migrations embedded and applied on boot. Redis 7 as a soft dependency.",
      "Zero-downtime migration from MongoDB to PostgreSQL. Every user, book, shelf and diary entry came across. Non-integer ratings didn't, because the new schema stored whole numbers. p50 search went from 200-500ms to 10-50ms, and external API calls fell 70-80%.",
      "Closed an OAuth account-takeover path by matching on provider-stable claims.",
      "Decoupled LLM cost from traffic with a pre-generation pipeline. The discovery engine was built in releases R0 to R7.",
    ],
    layers: [
      {
        name: "Surface",
        decision: "Every recommendation has to say why.",
        body: "A reason only appears when its own evidence holds. “Because you loved Middlemarch” needs the book to really sit near it. “maya loved this” needs maya to have given it four stars.",
        rejected: "“Matches your taste for Fiction”, which was all the old engine could say.",
        cost: "A row with no evidence doesn't render, so a new reader's home starts short.",
        sheet: "paper",
        figure: {
          kind: "feed",
          heading: "Picked for you",
          books: [["maya loved this"], ["Because you", "loved Middlemarch"], ["4 readers with", "your taste", "loved this"]],
        },
      },
      {
        name: "Client",
        decision: "Three clients, one set of answers.",
        body: "The server writes every module title and every reason. Next.js, SwiftUI and Compose only draw them, so the answers can't drift apart.",
        rejected: "A copy of the ranking in each app.",
        cost: "Mobile carousels have no slot for a second line yet, so subtitles only show on the web.",
        sheet: "kraft",
        figure: { kind: "clients", title: "Picked for you", clients: ["Next.js", "SwiftUI", "Compose"] },
      },
      {
        name: "API",
        decision: "Search reads the query before it searches.",
        body: "“Like Sally Rooney, under 300 pages, no romance” is three instructions. A deterministic parser splits them, and a Redis session lets “shorter” refine the last ask instead of starting over.",
        rejected: "Embedding the whole string, which lands near all three and exactly on none. And a model call on every debounced keystroke.",
        cost: "It only knows a closed set of patterns. “Something that will destroy me” has to go to the model.",
        sheet: "mustard",
        figure: {
          kind: "code",
          lines: [
            "POST /api/v1/search",
            '"like Sally Rooney, under 300',
            ' pages, no romance"',
            "",
            "intent        similarity",
            "similar_to    Sally Rooney",
            "max_pages     300",
            "exclude_axes  romance_centrality",
          ],
        },
      },
      {
        name: "Data",
        decision: "Left MongoDB for PostgreSQL, with no downtime.",
        body: "A dry run first, ObjectIds mapped to UUIDs, Mongo kept as the backup. Book search went from 200-500ms to 10-50ms, and foreign keys caught follows pointing at deleted users.",
        rejected: "Staying on MongoDB and going out to Google Books on every search.",
        cost: "The new schema stored whole-number ratings, so every 3.5 stayed behind. I should have settled that before migrating.",
        sheet: "green",
        figure: {
          kind: "tables",
          tables: [
            { name: "users", columns: ["id uuid", "mongo_id varchar(24)"] },
            { name: "books", columns: ["id uuid", "embedding vector(1024)"] },
            { name: "bookshelf", columns: ["book_id uuid", "rating integer"] },
          ],
          note: "3.5 didn't fit",
        },
      },
    ],
    status: {
      state: "live",
      label: "Live on the web",
      tag: "live",
      text: "the web app is live at paperboxd.in. The iOS and Android apps are built and launching on the App Store and Play Store by December 2026, so there are no store links yet.",
      links: [{ label: "paperboxd.in", href: "https://paperboxd.in" }],
    },
  },
  {
    slug: "stickynotes",
    name: "stickynotes",
    line: "Read the web. Keep the parts that matter.",
    about: "A browser extension and web library that keeps highlights from any page, with one note per topic, not per URL.",
    facts: [
      "Tints highlights with the CSS Custom Highlight API, so the page's DOM is never touched.",
      "Uses chrome.storage.local plus an outbox, so it works offline, with repeat-safe push and cursor pull. The extension sends nothing until you save a note.",
      "No CORS anywhere: pages and server actions run on the Next.js server with HttpOnly cookies. The backend is Go and Postgres.",
    ],
    status: {
      state: "live",
      label: "Live",
      tag: "live",
      text: "live at stickynotes.in and on the Chrome Web Store.",
      links: [
        { label: "stickynotes.in", href: "https://www.stickynotes.in" },
        { label: "Chrome Web Store", href: "https://chromewebstore.google.com/detail/stickynotes/fciennljceeoagambkjppepghigkcnep" },
      ],
    },
  },
  {
    slug: "thelocalcode",
    name: "thelocalcode",
    line: "Built like a product, not a template.",
    about: "A two-person studio in Bengaluru for websites and branding. Sites shipped: PaperBoxd, stickynotes and CircuitSupport.",
    facts: [],
    status: {
      state: "launching",
      label: "Launching November",
      tag: "November",
      text: "launching November 2026, so there's no public link yet.",
    },
  },
  {
    slug: "puzzlecafe",
    name: "puzzlecafe",
    line: "An endless, calm drive through places that feel real.",
    about: "A driving game in the browser.",
    facts: ["Built with Vite, TypeScript, three.js (WebGPU with WebGL2 fallback) and Rapier physics, on a pure seeded world with tests."],
    status: {
      state: "launching",
      label: "Launching November",
      tag: "November",
      text: "launching November 2026, so there's no public link yet.",
    },
  },
  {
    slug: "desky",
    name: "Desky",
    about: "A desk display: a Raspberry Pi Zero 2W with 3 SPI screens polling a Go API every 5 seconds, with an iPhone companion app.",
    facts: [
      "It has grown into a voice assistant with a two-tier LLM router (Haiku to Sonnet), on-device OpenCV presence detection with vision reasoning offloaded, and an offline-first voice stack with sub-second wake-to-response.",
    ],
    status: {
      state: "working",
      label: "Working",
      tag: "working",
      text: "working. Code at github.com/hridyeshh/desky.",
      links: [{ label: "GitHub", href: "https://github.com/hridyeshh/desky" }],
    },
  },
  {
    slug: "butterfly-clutcher",
    name: "Butterfly clutcher",
    about: "A hair clip with wings: ESP32-C3 Super Mini, ADXL345, SG90 servo, LiPo and USB-C.",
    facts: [],
    status: { state: "workshop", label: "In the workshop", tag: "in the workshop", text: "in the workshop." },
  },
  {
    slug: "pixel-keychain",
    name: "Pixel keychain",
    about: "An ESP32 on your keys with a tiny screen. A pixel cat lives in it.",
    facts: [],
    status: { state: "workshop", label: "In the workshop", tag: "in the workshop", text: "in the workshop." },
  },
];

export const experience = [
  {
    company: "Thinkerbell Labs",
    place: "Bengaluru",
    role: "Full Stack Software Engineer",
    period: "March 2026 to present",
    about: "Thinkerbell builds assistive technology for blind and low-vision learners. Annie teaches braille, and Tactera is a braille computer.",
    points: [
      "Designed and built the braille scientific calculator for Tactera, a Raspberry Pi device. A hand-written parser, a live editor that renders Nemeth, UEB and computer braille, and the maths in a supervised worker with a 2 second timeout, so a runaway calculation can't freeze the device. 700+ unit and fuzz tests.",
      "Shipped a real-time multiplayer learning game across Annie devices and the Helios web portal in under two weeks, in 25 pull requests: matchmaking, server-run timers, live spectating and a leaderboard. Fixed a race that dropped final scores.",
      "Built mobile sign-in for Chalk, Tactera's cloud platform, in Go with Redis and MongoDB: emailed one-time codes and Google OAuth. Closed four auth flaws, among them a rate-limit bypass through a spoofed header and 30-day tokens that couldn't be revoked.",
      "Built a browser emulator that boots unmodified Annie and Tactera firmware from any pushed Git branch, with the hardware modelled beneath the real drivers, so firmware and lessons can be tested without a device.",
    ],
  },
  {
    company: "Limeroad",
    place: "Gurugram",
    role: "Software Engineer Intern",
    period: "February 2025 to August 2025",
    points: [
      "Built a WebView-native bridge for V-Mart.",
      "Used Fused Location to lift checkout completion 12% and cut manual entry errors 15%.",
      "Built fuzzy search that recovered 40% of zero-result queries and lifted discovery 30%.",
    ],
  },
];

export const skills = {
  Languages: "Go, Java, TypeScript, JavaScript, Kotlin, Swift, Python, SQL",
  Frameworks: "Next.js, React, Node.js, SwiftUI, Jetpack Compose",
  "Data and infrastructure": "PostgreSQL, Redis, MongoDB, AWS, Railway, Vercel",
};

export const loop = { pause: "Pause", play: "Play" };

export const apart = {
  title: "Take it apart.",
  intro: "Paperboxd, one layer at a time. Each is a decision, with what it replaced and what it cost.",
  rejected: "Rejected",
  cost: "It cost",
  figure: "A stack of sheets coming apart, with a signal running between them. The sheets are",
};

export const career = { title: "Experience", skills: "What I reach for" };

export const ask = {
  title: "Ask",
  label: "An AI answering from this site and my public GitHub. Email me for anything important.",
  inputLabel: "Your question",
  placeholder: "Ask about the work",
  submit: "Ask",
  waiting: "one sec",
  now: "What are you working on right now?",
  noScript: "The chat needs JavaScript. Email doesn't:",
  email: site.email,
  networkError: `Network trouble. Try again, or email me at ${site.email}.`,
};

// What the route sends when it can't answer. Every path ends in a way to reach a person.
export const chatMessages = {
  fallback: `I can't answer that right now. Try again, or email me at ${site.email}.`,
  slowDown: `That's a lot of questions at once. Give it a minute, or email me at ${site.email}.`,
};

export const hero = {
  hello: "Hi, I'm Hridyesh. I make",
  hint: "Tap one, or scroll through all seven.",
  navLabel: "Sections",
  nav: [
    { label: "Experience", href: "#experience" },
    { label: "Ask", href: "#ask" },
    { label: "Email", href: "#end" },
  ],
};

export type Stop = {
  phrase: string; // its part of the Sentence
  plain: string; // the one plain line on its sheet
  detail: string; // a short paragraph for the sheet's open space
  note?: string;
  ask: string; // the question its sticker asks at the end of the page
  lines?: number; // how many lines its big name takes, so the paragraph sits clear of it
  sticker: { src: string; width: number; height: number; alt: string };
};

export const journey: Record<string, Stop> = {
  paperboxd: {
    phrase: "a social network for readers",
    plain: "A social network for readers. Track, rate and share the books you love.",
    detail: "Web, iOS and Android all draw the same answers from one Go backend, on PostgreSQL and pgvector. I moved it off MongoDB with no downtime, and book search went from 200-500ms to 10-50ms.",
    note: "The iOS and Android apps reach the stores by December.",
    ask: "How did Paperboxd leave MongoDB?",
    sticker: { src: "/stickers/box.webp", width: 700, height: 655, alt: "Two hands offer a kraft box packed with hardback books." },
  },
  stickynotes: {
    phrase: "a notebook for the best lines on the web",
    plain: "Keeps the best lines from any page you read, with one note per topic, not per URL. It works offline.",
    detail: "Highlights are tinted with the CSS Custom Highlight API, so the page itself is never touched. Notes wait in an outbox, and the extension sends nothing until you save one.",
    ask: "Why is there no CORS in stickynotes?",
    sticker: { src: "/stickers/notebook.webp", width: 800, height: 346, alt: "A kraft notebook with a star sticker, passed between two hands." },
  },
  thelocalcode: {
    phrase: "websites in a two-person studio",
    plain: "A two-person studio in Bengaluru for websites and branding.",
    detail: "Built like a product, not a template. We've shipped PaperBoxd, stickynotes and CircuitSupport. The site playing on this Mac is the studio's own.",
    ask: "What has thelocalcode shipped?",
    sticker: { src: "/stickers/mac.webp", width: 560, height: 720, alt: "A beige classic computer showing the thelocalcode site." },
  },
  puzzlecafe: {
    phrase: "a calm little driving game",
    plain: "A calm driving game in the browser. An endless drive through places that feel real.",
    detail: "TypeScript and three.js, WebGPU with a WebGL2 fallback, and Rapier for the physics. The world comes from a seed, with tests. This green coupe is one of the game's own cars.",
    ask: "How is the puzzlecafe world built?",
    sticker: { src: "/stickers/car.webp", width: 620, height: 648, alt: "A hand holds up a small sea-green toy roadster." },
  },
  desky: {
    phrase: "a display for my desk",
    plain: "A display for my desk. Three small screens on a Raspberry Pi, with an iPhone app to go with it.",
    detail: "A Raspberry Pi Zero 2W runs three SPI screens off a Go API, polled every 5 seconds. It has grown into a voice assistant too, with on-device presence detection and sub-second wake-to-response.",
    ask: "What can Desky do?",
    sticker: { src: "/stickers/desky.webp", width: 720, height: 481, alt: "A dark desk display with two speakers and three lit screens." },
  },
  "butterfly-clutcher": {
    phrase: "a hair clip that flaps when you move your head",
    plain: "A hair clip with wings. Move your head and it flaps.",
    detail: "An ESP32-C3 Super Mini reads an ADXL345 accelerometer and moves the wings with an SG90 servo. It runs on a LiPo, with USB-C.",
    lines: 2,
    ask: "How does the butterfly clip flap?",
    sticker: { src: "/stickers/butterfly.webp", width: 700, height: 517, alt: "A butterfly hair clip with lavender wings and a small circuit board down its body." },
  },
  "pixel-keychain": {
    phrase: "a keychain with a cat living in it",
    plain: "A tiny screen on your keys. A pixel cat lives in it.",
    detail: "An ESP32 and a small colour screen in a case with two buttons, on a LiPo. The cat lives in a pixel meadow.",
    ask: "What's inside the pixel keychain?",
    sticker: { src: "/stickers/keychain.webp", width: 560, height: 453, alt: "A yellow keychain whose little screen shows a pixel cat in a meadow." },
  },
};

export const lost = { title: "Nothing lives at this address.", back: "Go back to the work" };

export const journeyCopy = { label: "Projects", skip: "Skip to experience", study: "Read the case study" };

export const end = {
  title: "That's all seven, on my bench. Pick one up and ask about it.",
  write: "Or write to me.",
  copy: "Copy",
  copied: "Copied",
  // The resume joins these once public/resume.pdf exists.
  links: [
    { label: "GitHub", href: "https://github.com/hridyeshh" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/hridyeshh/" },
    { label: "LeetCode", href: "https://leetcode.com/hridyeshh" },
  ],
};

export type Decision = { title: string; body: string; rejected?: string; cost?: string };

export type Study = {
  slug: string;
  problem: string;
  meta: [string, string][];
  recording?: { src: string; poster: string; label: string };
  decisions?: Decision[];
  flow?: { title: string; steps: string[] };
  details?: string[];
  change?: string[];
};

export const studyCopy = {
  navLabel: "Back",
  back: "Back to the journey",
  decisions: "Decisions",
  details: "The details",
  change: "What I'd change",
  rejected: "Rejected",
  cost: "It cost",
  next: "Next",
};

// Every number and claim here needs its owner's check before launch.
export const studies: Study[] = [
  {
    slug: "paperboxd",
    problem: "A reading network has to earn trust: a recommendation is only useful if it can say why, on whichever device is in your hand.",
    meta: [
      ["Made", "End to end: web, iOS, Android, Go backend and brand"],
      ["Stack", "Next.js, SwiftUI, Jetpack Compose, Go, PostgreSQL, pgvector, Redis"],
    ],
    recording: { src: "/loops/paperboxd.webm", poster: "/loops/paperboxd.jpg", label: "A recording of paperboxd.in scrolling through its own chapters." },
    details: projects[0].facts,
    change: [
      "Settle the rating type before migrating. The new schema stored whole numbers, so every 3.5 stayed behind.",
      "Give the mobile carousels a slot for a second line, so subtitles stop being web-only.",
    ],
  },
  {
    slug: "stickynotes",
    problem: "Highlights filed by URL scatter what you read. People think in subjects, so a note here belongs to a topic, and the page it came from is only a source.",
    meta: [
      ["Made", "Chrome extension, web library, Go API, brand and art"],
      ["Stack", "Extension, Next.js, Go, PostgreSQL"],
    ],
    decisions: [
      {
        title: "One note per topic, not per URL.",
        body: "The page's heading picks the topic, on your device. Every passage is marked with its source, and a numbered Sources list closes the note.",
        rejected: "Filing notes by URL.",
        cost: "Topic matching compares exact words with plurals folded, so \"hash\" and \"hashing\" don't match.",
      },
      {
        title: "Tint the page without touching it.",
        body: "Highlights are drawn with the CSS Custom Highlight API, so the page's DOM is never rewritten.",
        rejected: "Rewriting the page to show highlights.",
        cost: "A page's own scripts can read which passages were saved on it, through the CSS Highlight registry.",
      },
      {
        title: "Nothing leaves the browser until you save.",
        body: "No page lookups and no browsing history. Topic matching runs on the device, and a note goes to your account only when you save it.",
        rejected: "Looking up the pages you visit.",
        cost: "The extension's store is one storage key, rewritten on every change.",
      },
    ],
    flow: {
      title: "How a note travels",
      steps: [
        "Select text on any page, and a bar offers Save note, four colours and the topic it will go to.",
        "Save. The background worker, the only code that writes the store, works out the address, topic, section heading and an anchor to find the passage again.",
        "Kept locally. The note goes into chrome.storage.local and its actions into the outbox.",
        "Push. The worker sends the outbox to the server, which applies each action and merges a topic with one you already have under the same title.",
        "Pull. It asks for whatever changed elsewhere with a cursor, and open tabs update their tints and badge.",
      ],
    },
    details: ["No CORS anywhere: pages and server actions run on the Next.js server with HttpOnly cookies. The backend is Go and Postgres."],
    change: [
      "Split the extension's store per record, before stores reach many MB.",
      "Make topic matching fold more than plurals, so \"hash\" and \"hashing\" land together.",
    ],
  },
  {
    slug: "thelocalcode",
    problem: "Most small sites start from a template. This studio builds each one like a product, with its own brand.",
    meta: [
      ["Made", "A two-person studio in Bengaluru"],
      ["Shipped", "PaperBoxd, stickynotes, CircuitSupport"],
    ],
    recording: { src: "/loops/thelocalcode.webm", poster: "/loops/thelocalcode.jpg", label: "A recording of the thelocalcode site." },
    decisions: [
      {
        title: "Anything that zooms or comes apart is SVG.",
        body: "Desky, the keychain and the floppy at the slot get zoomed far past any raster, and they come apart into layers, so they're drawn as SVG. The rest of the site's art is painted.",
        rejected: "Rasters for everything.",
        cost: "Each of those parts is drawn in code, by hand.",
      },
      {
        title: "Every word in one file.",
        body: "All of the site's copy lives in one content file, not in the components, so editing a sentence never means touching a layout.",
      },
      {
        title: "Each site gets what it needs.",
        body: "PaperBoxd got a web app, iOS and Android, a backend and a brand. stickynotes got a Chrome extension, a web library, a Go API and hand-painted art. CircuitSupport got a storefront, an order flow, a brand and SEO.",
      },
    ],
  },
];
