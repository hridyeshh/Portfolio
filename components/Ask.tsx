"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { MAX_QUERY, nextHistory, type Turn } from "../lib/chat.ts";
import type { ask } from "../lib/content.ts";

type Exchange = { question: string; answer: string };

// Inline, never a modal. Answers render as text, so markup in a reply can't run.
export function Ask({ copy }: { copy: typeof ask }) {
  const [ready, setReady] = useState(false); // stays false with JavaScript off, so the controls don't pretend to work
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState("");
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const history = useRef<Turn[]>([]);

  useEffect(() => setReady(true), []);

  const write = (answer: string) => setExchanges((all) => all.map((exchange, i) => (i === all.length - 1 ? { ...exchange, answer } : exchange)));

  async function send(question: string) {
    const query = question.trim();
    if (!query || busy) return;
    setBusy(true);
    setDraft("");
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
    <div className="ask">
      <p className="ask-label">{copy.label}</p>

      {/* Always in the page: screen readers miss changes in a live region that appears mid-session. */}
      <div className="ask-log" role="log" aria-live="polite" aria-busy={busy}>
        {exchanges.map(({ question, answer }, i) => (
          <div key={i} className="ask-exchange">
            <p className="ask-question">{question}</p>
            {answer ? <p className="ask-answer">{answer.trim()}</p> : <p className="note">{copy.waiting}</p>}
          </div>
        ))}
      </div>

      {exchanges.length === 0 ? (
        <ul className="ask-suggestions">
          {copy.suggestions.map((suggestion) => (
            <li key={suggestion}>
              <button type="button" className="button button-quiet" disabled={!ready || busy} onClick={() => send(suggestion)}>
                {suggestion}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

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
          placeholder={copy.placeholder}
          value={draft}
          disabled={!ready}
          onChange={(event) => setDraft(event.target.value)}
        />
        <button type="submit" className="button" disabled={!ready || busy}>
          {copy.submit}
        </button>
      </form>

      <noscript>
        <p>
          {copy.noScript} <a href={`mailto:${copy.email}`}>{copy.email}</a>
        </p>
      </noscript>
    </div>
  );
}
