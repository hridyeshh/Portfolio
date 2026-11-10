// Portfolio chat on Claude Haiku 5.5, streamed as plain text. It has one tool, for what's new on my public GitHub.
import Anthropic from "@anthropic-ai/sdk";
import { parseChat, rateLimited, systemPrompt } from "../../../lib/chat.ts";
import { chatMessages } from "../../../lib/content.ts";
import { githubTool, recentGithubActivity } from "../../../lib/github.ts";

// Short timeout so a stuck call ends in the fallback instead of hanging the function.
const client = new Anthropic({ timeout: 8000, maxRetries: 1 });
// That timeout stops at the response headers. This one bounds the whole answer, tool round included.
const ANSWER_DEADLINE_MS = 25_000;
const SYSTEM_PROMPT = systemPrompt();

const refuse = (status: number, error: string) => Response.json({ error }, { status });

// The final round can't call the tool again, so no question can loop and spend.
function stream(messages: Anthropic.MessageParam[], signal: AbortSignal, final = false) {
  return client.messages.stream(
    {
      model: "claude-haiku-5-5",
      max_tokens: 1024,
      output_config: { effort: "low" },
      system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
      tools: [githubTool],
      ...(final ? { tool_choice: { type: "none" as const } } : {}),
      messages,
    },
    { signal },
  );
}

async function githubResults(message: Anthropic.Message): Promise<Anthropic.ToolResultBlockParam[]> {
  const uses = message.content.filter((block): block is Anthropic.ToolUseBlock => block.type === "tool_use");
  const result = await recentGithubActivity().then(
    (content) => ({ content }),
    (error: unknown) => {
      console.error("GitHub lookup failed:", error instanceof Error ? error.message : "unknown error");
      return { content: "GitHub can't be reached right now.", is_error: true };
    },
  );
  return uses.map(({ id }) => ({ type: "tool_result", tool_use_id: id, ...result }));
}

// Listens before the request connects, so no early text can slip past.
function answerBody(first: ReturnType<typeof stream>, messages: Anthropic.MessageParam[], signal: AbortSignal) {
  const encoder = new TextEncoder();
  let current = first;
  let answered = false;
  let cancelled = false;

  return new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (text: string) => {
        if (!cancelled) controller.enqueue(encoder.encode(text));
      };

      // Thinking is on by default. This event carries text deltas only, never thinking.
      const listen = (answer: typeof first) =>
        answer.on("text", (delta) => {
          answered ||= delta.trim() !== "";
          send(delta);
        });

      const finish = async () => {
        let message = await first.finalMessage();
        if (message.stop_reason === "tool_use") {
          const results = await githubResults(message);
          if (cancelled) return false;
          // The whole assistant turn goes back unchanged, thinking blocks included, as the API requires.
          current = stream([...messages, { role: "assistant", content: message.content }, { role: "user", content: results }], signal, true);
          if (answered) send("\n\n");
          listen(current);
          message = await current.finalMessage();
        }
        return message.stop_reason !== "refusal" && answered;
      };

      listen(first);
      finish()
        .catch((error: unknown) => {
          if (!cancelled) console.error(error instanceof Anthropic.APIError ? `Claude API error ${error.status}: ${error.message}` : error);
          return false;
        })
        .then((finished) => {
          if (!finished) send(answered ? `\n\n${chatMessages.fallback}` : chatMessages.fallback);
          if (!cancelled) controller.close();
        });
    },
    cancel() {
      cancelled = true; // the visitor left, so stop paying for the rest of the answer
      current.abort();
    },
  });
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (rateLimited(ip)) return refuse(429, chatMessages.slowDown);

  // A JSON content type makes browsers send a preflight, which fails because no CORS headers go out.
  // Without this check, any page on the web could spend the budget with a plain form post.
  if (!req.headers.get("content-type")?.includes("application/json")) return refuse(400, "Expected JSON");

  const parsed = parseChat(await req.json().catch(() => null));
  if ("error" in parsed) return refuse(400, parsed.error);

  const signal = AbortSignal.timeout(ANSWER_DEADLINE_MS);
  const messages: Anthropic.MessageParam[] = [...parsed.history, { role: "user", content: parsed.query }];
  const answer = stream(messages, signal);
  const body = answerBody(answer, messages, signal);

  try {
    await answer.withResponse(); // API errors surface here, while a real status can still go out
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) return refuse(429, chatMessages.slowDown);
    return refuse(500, chatMessages.fallback);
  }

  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" } });
}
