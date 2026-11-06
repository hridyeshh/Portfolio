import { Ask } from "../components/Ask.tsx";
import { about, ask, projects, site, work } from "../lib/content.ts";

export default function Home() {
  return (
    <>
      <header className="masthead">
        <h1 className="wordmark">
          <span>{site.name}</span>
        </h1>
        <p className="statement">{site.headline}</p>
        <p className="support">{site.support}</p>
      </header>

      <section id="work" className="section" aria-labelledby="work-title">
        <h2 id="work-title" className="section-title">
          {work.title}
        </h2>
        <ul className="work">
          {projects.map(({ slug, name, line, about: summary, status }) => (
            <li key={slug}>
              <h3>{name}</h3>
              <div className="work-copy">
                {line ? <p className="work-line">{line}</p> : null}
                <p>{summary}</p>
              </div>
              <div className="work-status">
                <span className="chip">{status.label}</span>
                {"links" in status
                  ? status.links.map(({ label, href }) => (
                      <a key={href} href={href}>
                        {label}
                      </a>
                    ))
                  : null}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section id="about" className="section" aria-labelledby="about-title">
        <h2 id="about-title" className="section-title">
          {about.title}
        </h2>
        <div className="prose">
          {about.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section id="ask" className="section" aria-labelledby="ask-title">
        <h2 id="ask-title" className="section-title">
          {ask.title}
        </h2>
        <Ask copy={ask} />
      </section>
    </>
  );
}
