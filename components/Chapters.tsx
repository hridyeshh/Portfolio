// The three lead projects, each drenched in its own palette with a composition of its own.
import Image from "next/image";
import { chapters, loop, type Project, projects } from "../lib/content.ts";
import handHold from "../public/art/hand-hold.webp";
import mac from "../public/art/mac.webp";
import box from "../public/art/pbx-box.webp";
import notebook from "../public/art/sticky-hands.jpg";
import { Loop } from "./Loop.tsx";

export function bySlug(slug: string): Project {
  const project = projects.find((candidate) => candidate.slug === slug);
  if (!project) throw new Error(`No project ${slug}`);
  return project;
}

export function StatusLine({ status }: { status: Project["status"] }) {
  return (
    <div className="status">
      <span className="chip">{status.label}</span>
      {"links" in status
        ? status.links.map(({ label, href }) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))
        : null}
    </div>
  );
}

function Paperboxd() {
  const { slug, name, line = "", about, status } = bySlug("paperboxd");
  const { note, apps, art, loop: recording } = chapters.paperboxd;
  const [first, second] = line.split(", ");
  return (
    <section id={slug} className="chapter tone tone-paperboxd" aria-labelledby={`${slug}-name`}>
      <div className="chapter-inner pbx">
        <h3 id={`${slug}-name`} className="chapter-name">
          {name}
        </h3>
        <div className="pbx-head">
          <p className="chapter-line">
            {first}, <br />
            {second}
          </p>
          <p className="note chapter-note">{note}</p>
        </div>
        <div className="pbx-copy">
          <p className="chapter-about">
            {about} {apps}
          </p>
          <StatusLine status={status} />
        </div>
        <div className="pbx-media">
          <Loop {...recording} copy={loop} className="pbx-loop" />
          <Image src={box} alt={art} sizes="(min-width: 60rem) 30vw, 72vw" className="pbx-box" />
        </div>
      </div>
    </section>
  );
}

function Stickynotes() {
  const { slug, name, line = "", about, status } = bySlug("stickynotes");
  const { note, mark, art } = chapters.stickynotes;
  const [first, second] = line.split(". ");
  const [before, after] = second.split(mark);
  return (
    <section id={slug} className="chapter tone tone-stickynotes" aria-labelledby={`${slug}-name`}>
      <div className="chapter-inner sticky">
        <h3 id={`${slug}-name`} className="chapter-name">
          {name}
        </h3>
        <p className="chapter-line">
          {first}. <br />
          {before}
          <mark className="marker">{mark}</mark>
          {after}
        </p>
        <p className="note chapter-note">{note}</p>
        <Image src={notebook} alt={art} sizes="(min-width: 48rem) 100vw, 170vw" className="sticky-art" />
        <div className="sticky-foot">
          <p className="chapter-about">{about}</p>
          <StatusLine status={status} />
        </div>
      </div>
    </section>
  );
}

function Thelocalcode() {
  const { slug, name, line, about, status } = bySlug("thelocalcode");
  const { note, art, hand, loop: recording } = chapters.thelocalcode;
  return (
    <section id={slug} className="chapter tone tone-thelocalcode" aria-labelledby={`${slug}-name`}>
      <div className="chapter-inner tlc">
        <div className="tlc-copy">
          <h3 id={`${slug}-name`} className="chapter-name">
            {name}
          </h3>
          <p className="chapter-line">{line}</p>
          <p className="note chapter-note">{note}</p>
          <p className="chapter-about">{about}</p>
          <StatusLine status={status} />
        </div>
        <div className="tlc-media">
          <div className="mac">
            <Image src={mac} alt={art} sizes="(min-width: 60rem) 30vw, 66vw" />
            <Loop {...recording} copy={loop} className="mac-screen" />
            <Image src={handHold} alt={hand} sizes="(min-width: 60rem) 35vw, 80vw" className="mac-hand" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function Chapters() {
  return (
    <>
      <Paperboxd />
      <Stickynotes />
      <Thelocalcode />
    </>
  );
}
