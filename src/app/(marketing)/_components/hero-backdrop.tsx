/**
 * The hero backdrop — a quiet layered aurora in navy, teal, and blue.
 *
 * The design constraint that governs every value here is *quiet*: the headline
 * is the focal point, and the background exists only to give the top of the
 * page depth and a premium sense of light. Nothing in it is meant to be looked
 * at directly. No illustration, no globe, no particles — just soft fields of
 * colour and a film grain for texture.
 *
 * Depth comes from layering, not from any single strong element: a deep navy
 * base, two broad aurora fields at different hues and scales, and one elongated
 * light ribbon, each heavily blurred so they read as overlapping washes rather
 * than shapes. Opacities are deliberately low.
 *
 * Colours are tuned to work on both canvases. The dark theme's `--background`
 * is already a deep navy (oklch ~0.17, hue 258), so the aurora deepens it; the
 * light theme's near-white lets the same fields read as soft pastels. Because
 * the fields are low-opacity tints and the page surface itself switches with
 * the theme, text contrast is preserved in both — verified, not assumed.
 */

/** Tileable film grain from an SVG turbulence filter, inlined as a data URI. */
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

// Deep navy, held constant across themes: on white it reads as a cool shadow,
// on the dark navy canvas it deepens the base. Kept out of the token layer
// because it exists only for this backdrop.
const NAVY = 'oklch(0.29 0.07 262)';
const BLUE = 'oklch(0.48 0.14 244)';

export function HeroBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {/* Base wash — a navy tint pooled at the top, fading out well before the
          headline. Establishes the deep-navy foundation without darkening the
          area the text sits on. */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, color-mix(in oklch, ${NAVY} 22%, transparent) 0%, color-mix(in oklch, ${NAVY} 7%, transparent) 30%, transparent 60%)`,
        }}
      />

      {/* Teal aurora — broad, upper-left, the warmest field. Uses the brand
          teal so it tracks the theme. */}
      <div
        className="absolute top-[-20rem] left-[-6rem] h-[52rem] w-[68rem] rounded-[50%] blur-[140px]"
        style={{
          background:
            'radial-gradient(closest-side, color-mix(in oklch, var(--primary) 26%, transparent), transparent 70%)',
        }}
      />

      {/* Blue aurora — upper-right, cooler, slightly smaller. The hue offset
          from the teal is what makes the two read as an aurora rather than one
          glow. */}
      <div
        className="absolute top-[-14rem] right-[-10rem] h-[46rem] w-[58rem] rounded-[50%] blur-[140px]"
        style={{
          background: `radial-gradient(closest-side, color-mix(in oklch, ${BLUE} 24%, transparent), transparent 70%)`,
        }}
      />

      {/* Navy depth field — low and centred, a darker anchor that gives the
          aurora above it something to sit against. This is the layer that reads
          as "depth" rather than a flat tint. */}
      <div
        className="absolute top-[6rem] left-1/2 h-[40rem] w-[76rem] -translate-x-1/2 rounded-[50%] blur-[150px]"
        style={{
          background: `radial-gradient(closest-side, color-mix(in oklch, ${NAVY} 20%, transparent), transparent 72%)`,
        }}
      />

      {/* Aurora ribbon — an elongated, gently rotated band of teal-into-blue
          light across the upper third. Heavily blurred and low opacity, it is
          the one element that gives the field its aurora-like directionality. */}
      <div
        className="absolute top-[3rem] left-1/2 h-[15rem] w-[80rem] -translate-x-1/2 -rotate-6 rounded-[50%] opacity-70 blur-[100px]"
        style={{
          background: `linear-gradient(90deg, transparent, color-mix(in oklch, var(--primary) 22%, transparent), color-mix(in oklch, ${BLUE} 22%, transparent), transparent)`,
        }}
      />

      {/* Film grain over everything, at soft-light so it rides the colour
          beneath as texture rather than sitting on top as speckle. Low enough
          to stay quiet. */}
      <div
        className="absolute inset-0 opacity-[0.1] mix-blend-soft-light dark:opacity-[0.14]"
        style={{ backgroundImage: GRAIN, backgroundSize: '200px 200px' }}
      />

      {/* Resolve into the page surface at the bottom edge so the section below
          begins on the same plane, with no visible seam. */}
      <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-b from-transparent to-background" />
    </div>
  );
}
