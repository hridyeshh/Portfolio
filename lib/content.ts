// Every word on the site lives here, and the chat prompt is built from it, so page and bot cannot disagree.
// When something launches, change its status here. A link can only sit on a status that can carry one,
// so the build fails before anything claims to be live early.

export type Link = { label: string; href: string };

export type Status =
  | { state: "live" | "working"; label: string; text: string; links: Link[] }
  | { state: "launching" | "not-deployed" | "workshop"; label: string; text: string };

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
  headline: "I design software all the way down.",
  support: "Users feel every layer. So I design every layer.",
  description:
    "Every layer of software is a design problem, from interface to schema. Paperboxd, stickynotes, thelocalcode and more, taken apart.",
  skip: "Skip to the content",
};

export const nav = {
  label: "Sections",
  left: [
    { label: "Work", href: "/#work" },
    { label: "About", href: "/#about" },
  ],
  right: [
    { label: "Ask", href: "/#ask" },
    { label: "Email", href: `mailto:${site.email}` },
  ],
};

// The first three get full chapters on the home page. The rest are an index with a status per item.
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
      state: "not-deployed",
      label: "Not deployed yet",
      text: "not deployed yet, so there's no link.",
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
      text: "working. Code at github.com/hridyeshh/desky.",
      links: [{ label: "GitHub", href: "https://github.com/hridyeshh/desky" }],
    },
  },
  {
    slug: "butterfly-clutcher",
    name: "Butterfly clutcher",
    about: "A hair clip with wings: ESP32-C3 Super Mini, ADXL345, SG90 servo, LiPo and USB-C.",
    facts: [],
    status: { state: "workshop", label: "In the workshop", text: "in the workshop." },
  },
  {
    slug: "pixel-keychain",
    name: "Pixel keychain",
    about: "An ESP32 on your keys with a tiny screen. A pixel cat lives in it.",
    facts: [],
    status: { state: "workshop", label: "In the workshop", text: "in the workshop." },
  },
];

export const experience = [
  {
    company: "Thinkerbell Labs",
    place: "Bengaluru",
    role: "Full Stack Software Engineer",
    period: "March 2026 to present",
    about: "Thinkerbell builds assistive technology for the visually impaired.",
    points: [
      "Built the real-time multiplayer subsystem for Helios, 25 pull requests in 8 days.",
      "Root-caused a scoring race condition.",
      "Ran a self-initiated security audit of a Go auth backend and fixed 4 vulnerabilities.",
      "Designed and built Braille Ed, a Next.js teacher platform with an on-screen braille device simulator and a lesson-authoring engine.",
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

export const about = {
  title: "About",
  paragraphs: [
    "I want to know how things work underneath, so I build all of it: web, iOS, Android, Go backends, the brand and the launch.",
    "Away from the keyboard it's literature, poetry especially. It sharpens how I write, code included.",
  ],
};

export const work = { title: "Work" };

export const masthead = {
  note: "go on, lift it",
  art: "Two painted hands lift a blank sheet off a stack of kraft, mustard, terracotta and green sheets.",
};

export const chapters = {
  paperboxd: {
    note: "web, iOS, Android, Go",
    apps: "The iOS and Android apps are built and reach the stores by December 2026.",
    art: "Two hands offer a kraft box packed with hardback books.",
    loop: {
      src: "/loops/paperboxd.webm",
      poster: "/loops/paperboxd.jpg",
      label: "A recording of paperboxd.in scrolling through its own chapters.",
    },
  },
  stickynotes: {
    note: "no CORS anywhere",
    mark: "the parts that matter",
    art: "A kraft notebook with a star sticker, passed between two hands.",
  },
  thelocalcode: {
    note: "two people",
    art: "A beige classic computer.",
    hand: "A gloved hand brings a floppy disk labeled thelocalcode to the computer.",
    loop: {
      src: "/loops/thelocalcode.webm",
      poster: "/loops/thelocalcode.jpg",
      label: "A recording of the thelocalcode site, playing on the computer's screen.",
    },
  },
};

export const loop = { pause: "Pause", play: "Play" };

export const apart = {
  title: "Take it apart.",
  intro: "Paperboxd, one layer at a time. Each is a decision, with what it replaced and what it cost.",
  rejected: "Rejected",
  cost: "It cost",
  figure: "A stack of sheets coming apart, with a signal running between them. The sheets are",
};

export const bench = {
  title: "Making now, and also built",
  art: {
    puzzlecafe: "A hand holds up a small sea-green toy roadster.",
    desky: "A dark desk display with two speakers and three lit screens: a pixel pet, a sunrise and a 25-minute timer.",
    butterfly: "A butterfly hair clip with lavender wings and a small circuit board down its body.",
    keychain: "A yellow keychain whose little screen shows a pixel cat in a meadow.",
  },
};

export const career = { title: "Experience", skills: "What I reach for" };

export const ask = {
  title: "Ask",
  label: "An AI answering from this site's content. Email me for anything important.",
  inputLabel: "Your question",
  placeholder: "Ask about the work",
  submit: "Ask",
  waiting: "one sec",
  suggestions: ["How did Paperboxd leave MongoDB?", "Why no CORS in stickynotes?", "What lives in the pixel keychain?"],
  noScript: "The chat needs JavaScript. Email doesn't:",
  email: site.email,
  networkError: `Network trouble. Try again, or email me at ${site.email}.`,
};

// What the route sends when it can't answer. Every path ends in a way to reach a person.
export const chatMessages = {
  fallback: `I can't answer that right now. Try again, or email me at ${site.email}.`,
  slowDown: `That's a lot of questions at once. Give it a minute, or email me at ${site.email}.`,
};

export const footer = {
  signOff: "Building something worth taking apart?",
  copy: "Copy",
  copied: "copied",
  // The resume joins these once public/resume.pdf exists.
  links: [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/hridyeshh/" },
    { label: "GitHub", href: "https://github.com/hridyeshh" },
    { label: "LeetCode", href: "https://leetcode.com/hridyeshh" },
  ],
  colophonTitle: "Colophon",
  colophon: [
    "Headlines in Libre Caslon Condensed. Reading in Atkinson Hyperlegible Next, from the Braille Institute, which seemed right for someone who builds braille devices by day.",
    "Margin notes in Caveat, the same hand as stickynotes.",
    "Built with Next.js and plain CSS. Questions go to Claude Haiku 5.5.",
  ],
};
