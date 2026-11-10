import { type CSSProperties, Fragment } from "react";
import { Ask } from "../components/Ask.tsx";
import { CopyEmail } from "../components/CopyEmail.tsx";
import { JourneyClient } from "../components/JourneyClient.tsx";
import { Out } from "../components/Out.tsx";
import { ask, career, end, experience, hero, journey, journeyCopy, projects, site, skills, studies } from "../lib/content.ts";

const studied = new Set(studies.map(({ slug }) => slug));

function Sentence() {
  return (
    <header className="hero" id="top" tabIndex={-1}>
      <nav className="bar gut" aria-label={hero.navLabel}>
        <a href="#top">{site.name}</a>
        <span>
          {hero.nav.map(({ label, href }) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </span>
      </nav>
      <div className="say gut">
        <h1>
          {hero.hello}{" "}
          {projects.map(({ slug }, i) => {
            const { phrase, sticker } = journey[slug];
            const last = i === projects.length - 1;
            // The Sentence never ends on a stranded word or two: the last three words break as one.
            return (
              <Fragment key={slug}>
                {last ? "and " : ""}
                <a className="w" href={`#${slug}`}>
                  <img className="o stick-sm" style={{ "--r": i % 2 ? "4deg" : "-4deg" } as CSSProperties} src={sticker.src} width={sticker.width} height={sticker.height} alt="" />
                  {last ? phrase.replace(/ (\S+) (\S+)$/, "\u00a0$1\u00a0$2") : phrase}
                </a>
                {last ? "." : ", "}
              </Fragment>
            );
          })}
        </h1>
      </div>
      <p className="hint gut">
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="M8 2v11M3.5 8.5 8 13l4.5-4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {hero.hint}
      </p>
    </header>
  );
}

function Journey() {
  return (
    <section id="journey" aria-label={journeyCopy.label}>
      <div className="stage" aria-hidden="true">
        <canvas id="gl" />
      </div>
      <div className="sheets">
        {projects.map(({ slug, name, status }) => {
          const { plain, detail, note, lines, sticker } = journey[slug];
          return (
            <article key={slug} id={slug} className={`stop tone-${slug}`} style={lines ? ({ "--lines": lines } as CSSProperties) : undefined}>
              <h2 className="name gut">{name}</h2>
              <div className="stop-copy gut">
                {/* The sheet's picture when there's no 3D: reduced motion, no WebGL, no JavaScript. */}
                {slug === "thelocalcode" ? (
                  <span className="still stick macstill">
                    <img src={sticker.src} width={sticker.width} height={sticker.height} alt={sticker.alt} loading="lazy" />
                    <img className="macshot" src="/loops/thelocalcode.jpg" alt="" loading="lazy" />
                  </span>
                ) : (
                  <img className="still stick" src={sticker.src} width={sticker.width} height={sticker.height} alt={sticker.alt} loading="lazy" />
                )}
                <p className="more">{detail}</p>
                <div className="about">
                  <p>{plain}</p>
                  {note ? <p className="sub">{note}</p> : null}
                  <p className="meta">
                    <span className="pill">{status.label}</span>
                    {"links" in status
                      ? status.links.map((link) => <Out key={link.href} {...link} />)
                      : null}
                    {studied.has(slug) ? <a href={`/work/${slug}`}>{journeyCopy.study}</a> : null}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
        <div className="skipbar">
          <a className="skip" id="skip" href="#experience">
            <span className="skip-label">
              <span>{journeyCopy.skip}</span>
            </span>
            <span className="dial" aria-hidden="true">
              <svg viewBox="0 0 42 42">
                <circle className="ring-back" cx="21" cy="21" r="18" />
                <circle className="ring" cx="21" cy="21" r="18" pathLength="1" />
                <path className="arrow" d="M21 13v15M14.5 21.5 21 28l6.5-6.5" />
              </svg>
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}

function Experience() {
  return (
    <section className="exp gut" id="experience" tabIndex={-1} aria-labelledby="experience-title">
      <h2 id="experience-title">{career.title}</h2>
      {experience.map(({ company, place, role, period, about, points }, i) => (
        <details key={company} className="job" open={i === 0}>
          <summary>
            <h3>{company}</h3>
            <span className="role">
              {role}, {place}
            </span>
            <span className="when">{period}</span>
            <span className="plus" aria-hidden="true" />
          </summary>
          <div className="job-body">
            {about ? <p>{about}</p> : null}
            <ul>
              {points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
        </details>
      ))}
      <div className="reach-for">
        <h3>{career.skills}</h3>
        <dl>
          {Object.entries(skills).map(([group, list]) => (
            <div key={group}>
              <dt>{group}:</dt> <dd>{list}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function End() {
  const topics = projects.map(({ slug, name, status }) => ({ slug, name, tag: status.tag, question: journey[slug].ask, sticker: journey[slug].sticker }));
  return (
    <Ask copy={ask} title={end.title} topics={topics}>
      <div className="end-foot">
        <p className="end-write">{end.write}</p>
        <p className="mail">
          <b>
            <a href={`mailto:${site.email}`}>{site.email}</a>
          </b>
          <CopyEmail email={site.email} label={end.copy} done={end.copied} />
        </p>
        <ul className="links">
          {end.links.map((link) => (
            <li key={link.href}>
              <Out {...link} />
            </li>
          ))}
        </ul>
      </div>
    </Ask>
  );
}

export default function Home() {
  return (
    <>
      <Sentence />
      <Journey />
      <Experience />
      <End />
      <JourneyClient />
    </>
  );
}
