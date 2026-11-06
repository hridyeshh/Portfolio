"use client";

import { useEffect, useState } from "react";

// With JavaScript off, or no clipboard, this renders nothing: the mailto link beside it still works.
export function CopyEmail({ email, label, done }: { email: string; label: string; done: string }) {
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => setReady(Boolean(navigator.clipboard)), []);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  if (!ready) return null;

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
    } catch {
      // Clipboard permission denied. The address is on screen and the link still works.
    }
  }

  return (
    <span className="copy">
      <button type="button" className="button" onClick={copy}>
        {label}
      </button>
      <span className="note" role="status">
        {copied ? done : ""}
      </span>
    </span>
  );
}
