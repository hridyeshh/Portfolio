// The chat's one tool: what has moved on my public GitHub lately, so it can mention work the site doesn't list yet.
// Only public repos can come back: /users/{name}/repos lists public repos whichever token is sent.
import type Anthropic from "@anthropic-ai/sdk";

const USER = "hridyeshh";
const DAY_MS = 24 * 60 * 60 * 1000;
const RECENT_DAYS = 90;
const MAX_REPOS = 10;
const REPOS_WITH_COMMITS = 4;
const COMMITS_PER_REPO = 3;
const TIMEOUT_MS = 4000;
const CACHE_MS = 10 * 60 * 1000;

export const githubTool: Anthropic.Tool = {
  name: "recent_github_activity",
  description:
    "Lists my public GitHub repositories with recent pushes, newest first, with the latest commit messages on the most recent ones. Use it for questions about what I'm working on now, what's new, or a project the site doesn't list.",
  input_schema: { type: "object", properties: {}, additionalProperties: false },
};

type Repo = {
  name: string;
  description: string | null;
  language: string | null;
  html_url: string;
  pushed_at: string;
  fork: boolean;
  archived: boolean;
  private: boolean;
};

async function github<T>(path: string): Promise<T> {
  const { GITHUB_TOKEN } = process.env;
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {
      accept: "application/vnd.github+json",
      "user-agent": "hridyesh-portfolio",
      "x-github-api-version": "2022-11-28",
      ...(GITHUB_TOKEN ? { authorization: `Bearer ${GITHUB_TOKEN}` } : {}), // optional: it only raises the rate limit
    },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`GitHub answered ${res.status}`);
  return res.json() as Promise<T>;
}

// GITHUB_HIDE is a comma-separated list of repo names that shouldn't come up in chat. It's an env var so the list stays out of this public repo.
function pickRepos(repos: Repo[], now: number) {
  const hidden = new Set((process.env.GITHUB_HIDE ?? "").split(",").map((name) => name.trim().toLowerCase()));
  return repos
    .filter((repo) => !repo.private && !repo.fork && !repo.archived && !hidden.has(repo.name.toLowerCase()))
    .filter((repo) => now - Date.parse(repo.pushed_at) < RECENT_DAYS * DAY_MS)
    .slice(0, MAX_REPOS);
}

async function commitSubjects(repo: string) {
  try {
    const commits = await github<{ commit: { message: string } }[]>(`/repos/${USER}/${repo}/commits?per_page=${COMMITS_PER_REPO}`);
    return commits.map(({ commit }) => commit.message.split("\n")[0].slice(0, 100));
  } catch {
    return []; // an empty repo answers 409, and one missing list shouldn't lose the rest
  }
}

// ponytail: cached per warm instance, so GitHub sees about one call per instance every 10 minutes. Upgrade path: a shared store, if that ever matters.
let cached: { at: number; text: string } | undefined;

export async function recentGithubActivity(now = Date.now()): Promise<string> {
  if (cached && now - cached.at < CACHE_MS) return cached.text;
  const repos = pickRepos(await github<Repo[]>(`/users/${USER}/repos?type=owner&sort=pushed&per_page=30`), now);
  const listed = await Promise.all(
    repos.map(async ({ name, description, language, html_url, pushed_at }, i) => ({
      name,
      description,
      language,
      lastPushed: pushed_at.slice(0, 10),
      url: html_url,
      recentCommits: i < REPOS_WITH_COMMITS ? await commitSubjects(name) : undefined,
    })),
  );
  const text = JSON.stringify({ today: new Date(now).toISOString().slice(0, 10), repos: listed });
  cached = { at: now, text };
  return text;
}
