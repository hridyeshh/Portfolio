// Portfolio chat on Claude Haiku 5.5, streamed as plain text.
import Anthropic from "@anthropic-ai/sdk";
import type { MessageStream } from "@anthropic-ai/sdk/lib/MessageStream";
import { parseChat, rateLimited, systemPrompt } from "../../../lib/chat.ts";
import { chatMessages } from "../../../lib/content.ts";

// Short timeout so a stuck call ends in the fallback instead of hanging the function.
const client = new Anthropic({ timeout: 8000, maxRetries: 1 });
// That timeout stops at the response headers. This one bounds the whole answer.
const ANSWER_DEADLINE_MS = 25_000;
const SYSTEM_PROMPT = systemPrompt();

const refuse = (status: number, error: string) => Response.json({ error }, { status });

// Listens before the request connects, so no early text can slip past.
function answerBody<T>(answer: MessageStream<T>) {
  const encoder = new TextEncoder();
  let answered = false;
  let cancelled = false;

  return new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (text: string) => {
        if (!cancelled) controller.enqueue(encoder.encode(text));
      };

      // Thinking is on by default. This event carries text deltas only, never thinking.
      answer.on("text", (delta) => {
        answered ||= delta.trim() !== "";
        send(delta);
      });

      answer
        .finalMessage()
        .then((message) => message.stop_reason !== "refusal" && answered)
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
      answer.abort();
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

  const answer = client.messages.stream(
    {
      model: "claude-haiku-5-5",
      max_tokens: 1024,
      output_config: { effort: "low" },
      system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
      messages: [...parsed.history, { role: "user", content: parsed.query }],
    },
    { signal: AbortSignal.timeout(ANSWER_DEADLINE_MS) },
  );
  const body = answerBody(answer);

  try {
    await answer.withResponse(); // API errors surface here, while a real status can still go out
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) return refuse(429, chatMessages.slowDown);
    return refuse(500, chatMessages.fallback);
  }

  return new Response(body, { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" } });
}
