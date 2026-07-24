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

export function Wordmark({
  className,
  markClassName,
}: {
  className?: string;
  markClassName?: string;
}) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <LogoMark className={cn('size-6 text-primary', markClassName)} />
      <span className="text-[0.9375rem] font-semibold tracking-tight">{site.name}</span>
    </span>
  );
}
