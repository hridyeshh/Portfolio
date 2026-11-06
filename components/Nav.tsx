import { type Link, nav } from "../lib/content.ts";

function Pill({ links }: { links: Link[] }) {
  return (
    <ul className="pill">
      {links.map(({ label, href }) => (
        <li key={href}>
          <a href={href}>{label}</a>
        </li>
      ))}
    </ul>
  );
}

// Two pills split around the content, not a bar. Plain anchors, so it works with JavaScript off.
export function Nav() {
  return (
    <nav className="nav" aria-label={nav.label}>
      <Pill links={nav.left} />
      <Pill links={nav.right} />
    </nav>
  );
}
