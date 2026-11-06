// "Take it apart": a product as flat sheets at depth, one decision per layer, with data running down a trace.
// Data-driven, so each case study can pass its own layers. All CSS: the default styles are the still version with
// every layer showing, and app/globals.css pins and animates it only where scroll timelines and motion are welcome.
import type { CSSProperties } from "react";
import type { apart, Figure, Layer } from "../lib/content.ts";

const OPENS_BY = 14; // percent of the pinned scroll spent coming apart, before the first sheet lifts

function FigureArt({ figure }: { figure: Figure }) {
  switch (figure.kind) {
    case "feed":
      return (
        <>
          <text x="40" y="60" className="fig-display">
            {figure.heading}
          </text>
          {figure.books.map((lines, i) => {
            const x = 40 + i * 190;
            return (
              <g key={x}>
                <rect x={x} y="82" width="128" height="176" rx="4" className={`fig-cover-${i}`} />
                <rect x={x} y="82" width="12" height="176" className="fig-spine" />
                {lines.map((line, n) => (
                  <text key={line} x={x} y={286 + n * 26} className="fig-body">
                    {line}
                  </text>
                ))}
              </g>
            );
          })}
        </>
      );
    case "clients": {
      const frames = [
        { x: 40, w: 310, covers: 4, size: "fig-display" },
        { x: 376, w: 104, covers: 2, size: "fig-small" },
        { x: 500, w: 104, covers: 2, size: "fig-small" },
      ];
      return (
        <>
          {frames.map(({ x, w, covers, size }, i) => (
            <g key={x}>
              <rect x={x} y="36" width={w} height="226" rx={i ? 16 : 8} className="fig-frame" />
              <text x={x + 14} y={i ? 76 : 92} className={size}>
                {figure.title}
              </text>
              {Array.from({ length: covers }, (_, n) => {
                const gap = 10;
                const width = (w - 28 - gap * (covers - 1)) / covers;
                return <rect key={n} x={x + 14 + n * (width + gap)} y={i ? 96 : 116} width={width} height={i ? 66 : 120} rx="3" className={`fig-cover-${n % 3}`} />;
              })}
              <text x={x} y="300" className="fig-body">
                {figure.clients[i]}
              </text>
            </g>
          ))}
        </>
      );
    }
    case "code":
      return (
        <>
          {figure.lines.map((line, i) =>
            line ? (
              <text key={line} x="40" y={58 + i * 37} className="fig-code">
                {line}
              </text>
            ) : null,
          )}
        </>
      );
    case "tables": {
      const spots = [
        { x: 40, y: 34, w: 270 },
        { x: 330, y: 34, w: 270 },
        { x: 40, y: 182, w: 300 },
      ];
      return (
        <>
          {figure.tables.map(({ name, columns }, i) => {
            const { x, y, w } = spots[i];
            const last = i === figure.tables.length - 1;
            return (
              <g key={name}>
                <rect x={x} y={y} width={w} height={46 + columns.length * 30 + 10} rx="6" className="fig-frame" />
                <text x={x + 14} y={y + 34} className="fig-table">
                  {name}
                </text>
                {columns.map((column, n) => (
                  <text key={column} x={x + 14} y={y + 72 + n * 30} className={`fig-column ${last && n === columns.length - 1 ? "fig-marked" : ""}`}>
                    {column}
                  </text>
                ))}
              </g>
            );
          })}
          <text x="356" y="296" transform="rotate(-4 356 296)" className="fig-note">
            {figure.note}
          </text>
        </>
      );
    }
  }
}

type Props = { id: string; copy: typeof apart; layers: Layer[] };

export function CrossSection({ id, copy, layers }: Props) {
  const count = layers.length;
  const beat = (100 - OPENS_BY) / count;
  const range = (i: number) => ({ "--from": `${OPENS_BY + i * beat}%`, "--to": `${OPENS_BY + (i + 1) * beat}%` });

  return (
    <section id={id} className="apart" aria-labelledby={`${id}-title`}>
      <div className="apart-track" style={{ "--layers": count, "--opens-by": `${OPENS_BY}%` } as CSSProperties}>
        <div className="apart-stage">
          <header className="apart-intro">
            <h2 id={`${id}-title`}>{copy.title}</h2>
            <p>{copy.intro}</p>
          </header>

          <div className="apart-figure" role="img" aria-label={`${copy.figure} ${layers.map(({ name }) => name).join(", ")}.`}>
            <div className="apart-iso">
              <div className="apart-trace">
                <svg viewBox="0 0 6 100" preserveAspectRatio="none" aria-hidden="true">
                  <line x1="3" y1="0" x2="3" y2="100" className="signal" />
                </svg>
              </div>
              {layers.map(({ name, sheet, figure }, i) => (
                <div key={name} className={`apart-sheet sheet-${sheet}`} style={{ "--depth": (count - 1) / 2 - i, ...range(i) } as CSSProperties}>
                  <svg viewBox="0 0 640 400" aria-hidden="true">
                    <rect width="640" height="400" rx="6" className="fig-ground" />
                    <FigureArt figure={figure} />
                    <text x="40" y="370" className="fig-name">
                      {name}
                    </text>
                    <circle cx="596" cy="356" r="10" className="fig-via" />
                  </svg>
                </div>
              ))}
            </div>
          </div>

          <ol className="apart-decisions">
            {layers.map(({ name, sheet, decision, body, rejected, cost }, i) => (
              <li key={name} className={`sheet-${sheet}`} style={range(i) as CSSProperties}>
                <span className="chip">{name}</span>
                <h3>{decision}</h3>
                <p>{body}</p>
                <dl>
                  <div>
                    <dt>{copy.rejected}</dt>
                    <dd>{rejected}</dd>
                  </div>
                  <div>
                    <dt>{copy.cost}</dt>
                    <dd>{cost}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
