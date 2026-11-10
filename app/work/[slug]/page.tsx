// One skeleton for every case study. Plain links, not next/link: home's scene script expects a fresh page.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CrossSection } from "../../../components/CrossSection.tsx";
import { Loop } from "../../../components/Loop.tsx";
import { Out } from "../../../components/Out.tsx";
import { apart, journey, loop, projects, site, studies, studyCopy } from "../../../lib/content.ts";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => studies.map(({ slug }) => ({ slug }));

const nameOf = (slug: string) => projects.find((project) => project.slug === slug)?.name ?? slug;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: `${nameOf(slug)} | ${site.name}`, description: studies.find((study) => study.slug === slug)?.problem };
}

export default async function StudyPage({ params }: Props) {
  const { slug } = await params;
  const at = studies.findIndex((study) => study.slug === slug);
  const project = projects.find((candidate) => candidate.slug === slug);
  if (at < 0 || !project) notFound();

  const { problem, meta, recording, decisions, flow, details, change } = studies[at];
  const { status, layers } = project;
  const { sticker } = journey[slug];
  const next = studies[(at + 1) % studies.length].slug;

  return (
    <>
      <header className={`study-band gut tone-${slug}`}>
        <nav className="bar" aria-label={studyCopy.navLabel}>
          <a href="/">{site.name}</a>
          <a href={`/#${slug}`}>{studyCopy.back}</a>
        </nav>
        <div className="study-head">
          <div>
            <h1>{project.name}</h1>
            <p className="study-lead">{problem}</p>
            <p className="meta">
              <span className="pill">{status.label}</span>
              {"links" in status
                ? status.links.map((link) => <Out key={link.href} {...link} />)
                : null}
            </p>
          </div>
          <img className="study-art stick" src={sticker.src} width={sticker.width} height={sticker.height} alt={sticker.alt} />
        </div>
      </header>

      <div className="study-body gut">
        <dl className="study-meta">
          {meta.map(([term, value]) => (
            <div key={term}>
              <dt>{term}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>

        {recording ? <Loop {...recording} copy={loop} className="study-loop" /> : null}

        {decisions ? (
          <section>
            <h2>{studyCopy.decisions}</h2>
            <ol className="study-decisions">
              {decisions.map(({ title, body, rejected, cost }) => (
                <li key={title}>
                  <h3>{title}</h3>
                  <p>{body}</p>
                  {rejected || cost ? (
                    <dl>
                      {rejected ? (
                        <div>
                          <dt>{studyCopy.rejected}</dt>
                          <dd>{rejected}</dd>
                        </div>
                      ) : null}
                      {cost ? (
                        <div>
                          <dt>{studyCopy.cost}</dt>
                          <dd>{cost}</dd>
                        </div>
                      ) : null}
                    </dl>
                  ) : null}
                </li>
              ))}
            </ol>
          </section>
        ) : null}
      </div>

      {layers ? <CrossSection id="take-it-apart" copy={apart} layers={layers} /> : null}

      <div className="study-body gut">
        {flow ? (
          <section>
            <h2>{flow.title}</h2>
            <ol className="study-flow">
              {flow.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </section>
        ) : null}

        {details ? (
          <section>
            <h2>{studyCopy.details}</h2>
            <ul className="study-list">
              {details.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {change ? (
          <section>
            <h2>{studyCopy.change}</h2>
            <ul className="study-list">
              {change.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>

      <a className={`study-next gut tone-${next}`} href={`/work/${next}`}>
        <span>{studyCopy.next}</span>
        {nameOf(next)}
      </a>
    </>
  );
}
