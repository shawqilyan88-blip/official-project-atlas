import { site } from '@/shared/config/site';

import { cn } from './utils/cn';

/**
 * The Atlas mark: a meridian arc crossing a sphere.
 *
 * Drawn as inline SVG rather than an image file so it inherits `currentColor`
 * and therefore adapts to light, dark, and the sidebar surface without three
 * separate assets to keep in sync.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={cn('size-6', className)}
      aria-hidden="true"
      focusable="false"
    >
      <circle
        cx="12"
        cy="12"
        r="9.25"
        stroke="currentColor"
        strokeWidth="1.6"
        opacity="0.28"
      />
      {/* The meridian — the element that carries the brand. */}
      <path
        d="M12 2.75c3.1 2.6 4.85 5.85 4.85 9.25S15.1 18.65 12 21.25c-3.1-2.6-4.85-5.85-4.85-9.25S8.9 5.35 12 2.75Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M3.1 9.4h17.8M3.1 14.6h17.8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}

/**
 * Sizes are a small fixed set rather than free-form classes.
 *
 * A wordmark whose glyph and type drift out of proportion is one of the fastest
 * ways to make a site look unfinished, so the pairing of mark size to type size
 * and tracking is decided here once and reused, not re-guessed per surface.
 */
const WORDMARK_SIZES = {
  sm: { mark: 'size-6', text: 'text-[0.9375rem] tracking-tight', gap: 'gap-2' },
  md: { mark: 'size-8', text: 'text-[1.1875rem] tracking-[-0.02em]', gap: 'gap-2.5' },
  lg: { mark: 'size-9', text: 'text-[1.375rem] tracking-[-0.022em]', gap: 'gap-2.5' },
  // Tracking tightens as the mark grows: letterforms that look correctly spaced
  // at 15px read loose and scattered at 30px. Optical, not mathematical.
  xl: { mark: 'size-12', text: 'text-[1.875rem] tracking-[-0.03em]', gap: 'gap-3' },
} as const;

export type WordmarkSize = keyof typeof WORDMARK_SIZES;

export function Wordmark({
  className,
  markClassName,
  size = 'sm',
}: {
  className?: string;
  markClassName?: string;
  size?: WordmarkSize;
}) {
  const scale = WORDMARK_SIZES[size];

  return (
    <span className={cn('inline-flex items-center', scale.gap, className)}>
      <LogoMark className={cn('text-primary', scale.mark, markClassName)} />
      <span className={cn('font-semibold', scale.text)}>{site.name}</span>
    </span>
  );
}
