import Image from "next/image";
import { Ask } from "../components/Ask.tsx";
import { bySlug, Chapters, StatusLine } from "../components/Chapters.tsx";
import { CrossSection } from "../components/CrossSection.tsx";
import { Masthead } from "../components/Masthead.tsx";
import { about, apart, ask, bench, career, experience, skills, work } from "../lib/content.ts";
import butterfly from "../public/art/butterfly.webp";
import desky from "../public/art/desky.webp";
import keychain from "../public/art/keychain.webp";
import car from "../public/art/puzzle-car.webp";

const BENCH = [
  { slug: "desky", image: desky, alt: bench.art.desky },
  { slug: "butterfly-clutcher", image: butterfly, alt: bench.art.butterfly },
  { slug: "pixel-keychain", image: keychain, alt: bench.art.keychain },
];

export default function Home() {
  const puzzlecafe = bySlug("puzzlecafe");
  return (
    <>
      <Masthead />

      <section id="work" aria-labelledby="work-title">
        <h2 id="work-title" className="sr">
          {work.title}
        </h2>
        <Chapters />
      </section>

      <CrossSection id="take-it-apart" copy={apart} layers={bySlug("paperboxd").layers ?? []} />

      <section id="bench" className="bench" aria-labelledby="bench-title">
        <h2 id="bench-title" className="section-title">
          {bench.title}
        </h2>

        <div id={puzzlecafe.slug} className="chapter tone tone-puzzlecafe">
          <div className="chapter-inner puzzle">
            <div className="puzzle-copy">
              <h3 className="chapter-name">{puzzlecafe.name}</h3>
              <p className="chapter-line">{puzzlecafe.line}</p>
              <p className="chapter-about">{puzzlecafe.about}</p>
              <StatusLine status={puzzlecafe.status} />
            </div>
            <Image src={car} alt={bench.art.puzzlecafe} sizes="(min-width: 60rem) 38vw, 86vw" className="puzzle-car" />
          </div>
        </div>

        <ul className="bench-rows">
          {BENCH.map(({ slug, image, alt }) => {
            const { name, about: summary, status } = bySlug(slug);
            return (
              <li key={slug} id={slug} className={`bench-row bench-${slug}`}>
                <h3>{name}</h3>
                <div className="bench-copy">
                  <p>{summary}</p>
                  <StatusLine status={status} />
                </div>
                <Image src={image} alt={alt} sizes="(min-width: 60rem) 24vw, 70vw" />
              </li>
            );
          })}
        </ul>
      </section>

      <section id="experience" className="section" aria-labelledby="experience-title">
        <h2 id="experience-title" className="section-title">
          {career.title}
        </h2>
        <div className="jobs">
          {experience.map(({ company, place, role, period, about: summary, points }, i) => (
            <details key={company} className="job" open={i === 0}>
              <summary>
                <h3>{company}</h3>
                <span>{role}</span>
                <span className="job-when">{period}</span>
              </summary>
              <div className="job-body">
                <p>{summary ? `${place}. ${summary}` : place}</p>
                <ul>
                  {points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              </div>
            </details>
          ))}
        </div>
        <section className="skills" aria-labelledby="skills-title">
          <h3 id="skills-title">{career.skills}</h3>
          <dl>
            {Object.entries(skills).map(([group, list]) => (
              <div key={group}>
                <dt>{group}</dt>
                <dd>{list}</dd>
              </div>
            ))}
          </dl>
        </section>
      </section>

      <div className="section about-ask">
        <section id="about" aria-labelledby="about-title">
          <h2 id="about-title" className="section-title">
            {about.title}
          </h2>
          <div className="about-copy">
            {about.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>

        <section id="ask" aria-labelledby="ask-title">
          <h2 id="ask-title" className="section-title">
            {ask.title}
          </h2>
          <Ask copy={ask} />
        </section>
      </div>
    </>
  );
}
