"use client";

import { type CSSProperties, type FormEvent, type ReactNode, useEffect, useRef, useState } from "react";
import { MAX_QUERY, nextHistory, type Turn } from "../lib/chat.ts";
import type { ask } from "../lib/content.ts";

export type Topic = { slug: string; name: string; tag: string; question: string; sticker: { src: string; width: number; height: number } };
type Exchange = { question: string; answer: string };
type Props = { copy: typeof ask; title: string; topics: Topic[]; children: ReactNode };

// The end of the page is my bench: the seven stickers lie on a cutting mat with a paper label each, and picking one up
// asks about its project. Inline, never a modal. Answers render as text, so markup in a reply can't run.
export function Ask({ copy, title, topics, children }: Props) {
  const [ready, setReady] = useState(false); // stays false with JavaScript off, so the controls don't pretend to work
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState("");
  const [peek, setPeek] = useState<Topic | null>(null); // the sticker under the pointer or focus
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const history = useRef<Turn[]>([]);

  useEffect(() => setReady(true), []);

  const write = (answer: string) => setExchanges((all) => all.map((exchange, i) => (i === all.length - 1 ? { ...exchange, answer } : exchange)));

  async function send(question: string) {
    const query = question.trim();
    if (!query || busy) return;
    setBusy(true);
    setDraft("");
    setPeek(null);
    setExchanges((all) => [...all, { question: query, answer: "" }]);

    let answer = "";
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query, conversationHistory: history.current }),
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => null);
        write(data?.error ?? copy.networkError);
        return; // a failed turn stays out of history
      }
      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        answer += value;
        write(answer);
      }
      history.current = nextHistory(history.current, query, answer);
    } catch {
      write(answer ? `${answer}\n\n${copy.networkError}` : copy.networkError);
    } finally {
      setBusy(false);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    send(draft);
  }

  return (
    <footer className="end gut" id="end" tabIndex={-1}>
      <h2>{title}</h2>

      <section className="ask" id="ask" tabIndex={-1} aria-label={copy.title}>
        <ul className="ask-topics">
          {topics.map((topic, i) => (
            <li key={topic.slug}>
              <button
                type="button"
                className="ask-topic"
                style={{ "--r": i % 2 ? "5deg" : "-5deg" } as CSSProperties}
                disabled={!ready || busy}
                onClick={() => send(topic.question)}
                onPointerEnter={() => setPeek(topic)}
                onPointerLeave={() => setPeek(null)}
                onFocus={() => setPeek(topic)}
                onBlur={() => setPeek(null)}
              >
                <img className="stick" src={topic.sticker.src} width={topic.sticker.width} height={topic.sticker.height} alt="" loading="lazy" />
                <span className="ask-tag">
                  {topic.name} <i>{topic.tag}</i>
                </span>
                <span className="sr">{topic.question}</span>
              </button>
            </li>
          ))}
          <li>
            <button type="button" className="ask-now" disabled={!ready || busy} onClick={() => send(copy.now)}>
              {copy.now}
            </button>
          </li>
        </ul>

        <form className="ask-form" onSubmit={submit}>
          <label className="sr" htmlFor="ask-input">
            {copy.inputLabel}
          </label>
          <input
            id="ask-input"
            type="text"
            autoComplete="off"
            enterKeyHint="send"
            maxLength={MAX_QUERY}
            placeholder={peek?.question ?? copy.placeholder}
            value={draft}
            disabled={!ready}
            onChange={(event) => setDraft(event.target.value)}
          />
          <button type="submit" className="ask-send" disabled={!ready || busy}>
            <span className="sr">{copy.submit}</span>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 12h15M12.5 5.5 19 12l-6.5 6.5" />
            </svg>
          </button>
        </form>

        <p className="ask-label">{copy.label}</p>

        {/* Always in the page: screen readers miss changes in a live region that appears mid-session. Newest shows first, by CSS only. */}
        <div className="ask-log" role="log" aria-live="polite" aria-busy={busy}>
          {exchanges.map(({ question, answer }, i) => (
            <div key={i} className="ask-exchange">
              <p className="ask-question">{question}</p>
              {answer ? <p className="ask-answer">{answer.trim()}</p> : <p className="note">{copy.waiting}</p>}
            </div>
          ))}
        </div>

        <noscript>
          <p>
            {copy.noScript} <a href={`mailto:${copy.email}`}>{copy.email}</a>
          </p>
        </noscript>
      </section>

      {children}
    </footer>
  );
}
