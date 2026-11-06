import { footer, site } from "../lib/content.ts";
import { CopyEmail } from "./CopyEmail.tsx";

export function Footer() {
  return (
    <footer className="footer">
      <p className="signoff">{footer.signOff}</p>
      <div className="email">
        <a href={`mailto:${site.email}`}>{site.email}</a>
      </div>
      <CopyEmail email={site.email} label={footer.copy} done={footer.copied} />

      <ul className="elsewhere">
        {footer.links.map(({ label, href }) => (
          <li key={href}>
            <a href={href}>{label}</a>
          </li>
        ))}
      </ul>

      <section className="colophon" aria-labelledby="colophon-title">
        <h2 id="colophon-title">{footer.colophonTitle}</h2>
        {footer.colophon.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </section>

      <p className="wordmark" aria-hidden="true">
        <span>{site.name}</span>
      </p>
    </footer>
  );
}
