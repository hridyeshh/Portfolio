import { lost, site } from "../lib/content.ts";

// The Sentence's own frame, with one line and one way back.
export default function NotFound() {
  return (
    <div className="hero">
      <nav className="bar gut" aria-label={site.name}>
        <a href="/">{site.name}</a>
      </nav>
      <div className="say gut">
        <h1>
          {lost.title}{" "}
          <a className="w" href="/">
            {lost.back}
          </a>
          .
        </h1>
      </div>
    </div>
  );
}
