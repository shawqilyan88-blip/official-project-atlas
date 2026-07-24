/**
 * The meridian-and-routes backdrop behind the hero.
 *
 * Restrained on purpose. The brief is that the product preview is the subject,
 * so this sits at low opacity and fades out well before it reaches the mockup —
 * atmosphere, not decoration competing for attention.
 *
 * Drawn with `currentColor` and masked with a radial gradient so it works in
 * both themes from one implementation. It is `aria-hidden` and
 * `pointer-events-none`: purely presentational, and it must never intercept a
 * click meant for the buttons above it.
 */
export function TradeRoutesBackdrop() {
  // Great-circle-ish arcs. Endpoints are chosen to read as trade lanes rather
  // than to be geographically accurate — this is a motif, not a map.
  const routes = [
    { d: 'M120 300 C 300 180, 560 165, 760 250', from: [120, 300], to: [760, 250] },
    { d: 'M200 420 C 420 340, 700 330, 900 200', from: [200, 420], to: [900, 200] },
    { d: 'M90 200 C 340 120, 620 250, 880 330', from: [90, 200], to: [880, 330] },
  ] as const;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[34rem] overflow-hidden text-foreground"
      style={{
        maskImage:
          'radial-gradient(120% 78% at 50% 8%, black 0%, black 42%, transparent 78%)',
        WebkitMaskImage:
          'radial-gradient(120% 78% at 50% 8%, black 0%, black 42%, transparent 78%)',
      }}
    >
      <svg
        viewBox="0 0 1000 520"
        preserveAspectRatio="xMidYMin slice"
        className="size-full"
      >
        {/* Latitude lines — flattened ellipses suggesting a globe seen edge-on. */}
        <g className="stroke-current opacity-[0.07]" strokeWidth="1" fill="none">
          {[110, 190, 270, 350, 430].map((cy, i) => (
            <ellipse key={cy} cx="500" cy={cy} rx={470 - i * 18} ry={54 + i * 10} />
          ))}
        </g>

        {/* Meridians. */}
        <g className="stroke-current opacity-[0.055]" strokeWidth="1" fill="none">
          {[-3, -2, -1, 0, 1, 2, 3].map((i) => (
            <path
              key={i}
              d={`M500 40 C ${500 + i * 150} 190, ${500 + i * 150} 330, 500 480`}
            />
          ))}
        </g>

        {/* Trade lanes, with a node at each end. */}
        <g fill="none">
          {routes.map((route, index) => (
            <g key={route.d}>
              <path
                d={route.d}
                className="stroke-primary"
                strokeWidth="1.25"
                strokeLinecap="round"
                opacity={0.28 - index * 0.06}
                strokeDasharray="5 7"
              />
              {[route.from, route.to].map(([cx, cy]) => (
                <circle
                  key={`${cx}-${cy}`}
                  cx={cx}
                  cy={cy}
                  r="3"
                  className="fill-primary"
                  opacity={0.4 - index * 0.08}
                />
              ))}
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
