import type * as React from 'react';

import { cn } from '@/shared/ui';

/**
 * The application-window chrome shared by every product preview.
 *
 * Three deliberate choices:
 *
 * 1. **Zero client JavaScript.** These previews use inline SVG and CSS only —
 *    no lucide, no interactivity. The landing page is the most
 *    performance-sensitive route in the product, and a decorative mockup should
 *    not cost a hydration payload.
 *
 * 2. **One accessible node.** The frame is a `role="img"` with a written label,
 *    which makes the whole mockup a single leaf in the accessibility tree.
 *    Without this, a screen reader would read out invented company names,
 *    match percentages, and deal values as though they were real page content.
 *
 * 3. **Tokens, not literals.** Everything resolves through the design system, so
 *    the previews follow light and dark themes without a second implementation.
 */
export function PreviewFrame({
  label,
  workspace = 'Northwind Trading',
  view,
  children,
  className,
  contentClassName,
}: {
  /** Sentence describing the preview for assistive technology. Required. */
  label: string;
  workspace?: string | undefined;
  /** Breadcrumb-style location shown in the window bar. */
  view: string;
  children: React.ReactNode;
  // Explicitly `| undefined`: with `exactOptionalPropertyTypes`, an optional
  // prop and a prop that may be passed as `undefined` are different types, and
  // callers forward their own optional className straight through.
  className?: string | undefined;
  contentClassName?: string | undefined;
}) {
  return (
    <figure
      role="img"
      aria-label={`${label} Illustrative product preview containing sample data.`}
      className={cn(
        'overflow-hidden rounded-xl border border-border bg-card shadow-overlay',
        className,
      )}
    >
      {/* Window bar */}
      <div className="flex h-10 items-center gap-3 border-b border-border bg-muted/40 px-3">
        <span className="flex shrink-0 gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-foreground/15" />
          <span className="size-2.5 rounded-full bg-foreground/15" />
          <span className="size-2.5 rounded-full bg-foreground/15" />
        </span>

        <span className="hidden min-w-0 items-center gap-1.5 rounded-md border border-border/70 bg-background/60 px-2 py-1 sm:flex">
          <span className="flex size-4 items-center justify-center rounded-[3px] bg-primary/12 text-[0.5rem] font-bold text-primary">
            {workspace.charAt(0)}
          </span>
          <span className="truncate text-[0.6875rem] font-medium text-foreground/80">
            {workspace}
          </span>
        </span>

        <span className="min-w-0 truncate text-[0.6875rem] text-muted-foreground">
          {view}
        </span>

        <span className="ml-auto hidden shrink-0 items-center gap-1 md:flex">
          <span className="rounded border border-border/70 px-1.5 py-0.5 font-mono text-[0.5625rem] text-muted-foreground">
            ⌘K
          </span>
        </span>
      </div>

      <div className={cn('relative', contentClassName)}>{children}</div>
    </figure>
  );
}

/**
 * A circular progress ring for match scores.
 *
 * Drawn as SVG rather than a bar because the score is a single figure that
 * should read at a glance without a label to anchor it.
 */
export function MatchRing({ value, className }: { value: number; className?: string }) {
  const radius = 15.5;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center',
        className,
      )}
    >
      <svg viewBox="0 0 36 36" className="size-9 -rotate-90" aria-hidden="true">
        <circle
          cx="18"
          cy="18"
          r={radius}
          className="fill-none stroke-current opacity-15"
          strokeWidth="2.5"
        />
        <circle
          cx="18"
          cy="18"
          r={radius}
          className="fill-none stroke-primary"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={`${(clamped / 100) * circumference} ${circumference}`}
        />
      </svg>
      <span className="tabular absolute text-[0.625rem] font-semibold">{clamped}</span>
    </span>
  );
}

/** Verification grade chip. A is the strongest. */
export function TrustChip({ grade }: { grade: 'A' | 'B' | 'C' }) {
  const tone =
    grade === 'A'
      ? 'bg-success/12 text-success border-success/25'
      : grade === 'B'
        ? 'bg-warning/15 text-warning-foreground border-warning/30'
        : 'bg-muted text-muted-foreground border-transparent';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded border px-1.5 py-0.5',
        'text-[0.625rem] font-medium whitespace-nowrap',
        tone,
      )}
    >
      <svg viewBox="0 0 16 16" className="size-2.5" aria-hidden="true">
        <path
          d="M8 1.5 2.75 3.6v4.05c0 3.2 2.2 5.5 5.25 6.85 3.05-1.35 5.25-3.65 5.25-6.85V3.6L8 1.5Z"
          className="fill-current opacity-25"
        />
        <path
          d="m5.6 8.1 1.7 1.7 3.3-3.4"
          className="fill-none stroke-current"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Verified {grade}
    </span>
  );
}

/** Two-letter country marker. Avoids flag emoji, which render inconsistently. */
export function CountryChip({ code }: { code: string }) {
  return (
    <span className="rounded-[3px] border border-border/70 px-1 py-px font-mono text-[0.5625rem] font-medium tracking-wide text-muted-foreground">
      {code}
    </span>
  );
}

/**
 * The honest caption that must accompany every preview.
 *
 * Uses `text-muted-foreground` at full strength. An opacity modifier such as
 * `/70` looks tempting for a caption, but the token is already calibrated to
 * sit just above the 4.5:1 floor — thinning it drops this text to 2.9:1 in
 * light mode. Muted is a colour, not an opacity.
 */
export function PreviewCaption({ className }: { className?: string }) {
  return (
    <p className={cn('mt-3 text-center text-xs text-muted-foreground', className)}>
      Product preview · sample data
    </p>
  );
}
