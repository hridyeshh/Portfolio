// The first screen, composed to the approved comp: the headline is written on the sheet the hands are lifting.
import Image, { type StaticImageData } from "next/image";
import type { CSSProperties } from "react";
import art from "../lib/art.json";
import { masthead, projects, site } from "../lib/content.ts";
import heroArt from "../public/art/hero-1.webp";
import mac from "../public/art/mac.webp";
import box from "../public/art/pbx-box.webp";
import car from "../public/art/puzzle-car.webp";
import notebook from "../public/art/sticky-hands.jpg";

const TILES: { slug: string; image: StaticImageData }[] = [
  { slug: "paperboxd", image: box },
  { slug: "puzzlecafe", image: car },
  { slug: "stickynotes", image: notebook },
  { slug: "thelocalcode", image: mac },
];

const percent = (fraction: number) => `${fraction * 100}%`;
const { blank } = art["hero-1"]; // found by scripts/process-art.py, so the live text sits exactly on the painted sheet

export function Masthead() {
  return (
    <header className="masthead">
      <h1 className="wordmark">
        <span>{site.name}</span>
      </h1>
      <div className="stage">
        <div className="hero-art">
          <Image src={heroArt} alt={masthead.art} sizes="(min-width: 64rem) 69vw, 154vw" priority />
          <div className="hero-sheet" style={{ left: percent(blank.x), top: percent(blank.y), width: percent(blank.w), height: percent(blank.h) }}>
            <p className="statement">{site.headline}</p>
            <p className="support">{site.support}</p>
            <a className="note hero-note" href="#take-it-apart">
              {masthead.note}
            </a>
          </div>
        </div>

        <ul className="tiles">
          {TILES.map(({ slug, image }, i) => {
            const project = projects.find((candidate) => candidate.slug === slug);
            if (!project) return null;
            return (
              <li key={slug} className={`tile tile-${slug} tone tone-${slug}`} style={{ "--i": i } as CSSProperties}>
                <a href={`#${slug}`}>
                  <span className="tile-name">{project.name}</span>
                  {/* Decorative here: each project's chapter carries the same art with its description. */}
                  <Image src={image} alt="" sizes="(min-width: 48rem) 16vw, 45vw" />
                  <span className="chip">{project.status.label}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </header>
  );
}
