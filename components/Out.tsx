import { type Link, site } from "../lib/content.ts";

// A link that leaves the site opens in a new tab, and says so to screen readers.
export function Out({ label, href }: Link) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {label}
      <span className="sr"> {site.newTab}</span>
    </a>
  );
}
