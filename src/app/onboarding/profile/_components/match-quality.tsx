'use client';

import type {
  ProfileStrength,
  ProfileTier,
} from '@/modules/trade-profile/domain/match-quality';
import { cn } from '@/shared/ui';
import { SparklesIcon, StarIcon } from '@/shared/ui/icons';

/**
 * The shared readiness ladder, in words. Verbal-first: the tier is always shown
 * as a word, so strength survives colour-blindness, screen readers, and the
 * stars being decorative (D.2 CT-1/AX-1, PAT-RL). Same words as the opportunity
 * quality meter.
 */
const TIER_LABEL: Record<ProfileTier, string> = {
  forming: 'Forming',
  developing: 'Developing',
  strong: 'Strong',
  ready: 'Ready',
};

/**
 * The live "Match quality" meter.
 *
 * A calm, always-visible read on how discoverable the profile is, updating as
 * the user types. It never nags for optional fields — it shows what the profile
 * can already do, and offers the single most valuable next step as an option,
 * not a requirement.
 */
export function MatchQuality({ strength }: { readonly strength: ProfileStrength }) {
  const { score, filledStars, tier, headline, tip } = strength;

  return (
    <section
      aria-label="Profile match quality"
      className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm backdrop-blur-sm"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Match quality</span>
          <div className="flex items-center gap-0.5" aria-hidden="true">
            {Array.from({ length: 5 }, (_, i) => (
              <StarIcon
                key={i}
                className={cn(
                  'size-4 transition-colors duration-[--duration-slow]',
                  i < filledStars
                    ? 'fill-primary text-primary'
                    : 'fill-transparent text-muted-foreground/30',
                )}
              />
            ))}
          </div>
        </div>
        <span
          className="text-sm font-semibold text-muted-foreground tabular-nums"
          aria-label={`${score} percent complete — ${TIER_LABEL[tier]}`}
        >
          {score}% · <span className="text-foreground">{TIER_LABEL[tier]}</span>
        </span>
      </div>

      {/* Animated fill. The width transition is the whole animation. */}
      <div
        role="progressbar"
        aria-label="Match quality"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={`${score}% · ${TIER_LABEL[tier]}`}
        className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted"
      >
        <div
          className={cn(
            'h-full rounded-full transition-[width] duration-[--duration-slow] ease-[--ease-out-quart]',
            tier === 'ready' ? 'bg-success' : 'bg-primary',
          )}
          style={{ width: `${Math.max(score, 3)}%` }}
        />
      </div>

      <p className="mt-3 text-sm leading-relaxed text-foreground/90">{headline}</p>

      {tip !== null && (
        <p className="mt-1.5 flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground">
          <SparklesIcon
            className="mt-0.5 size-3.5 shrink-0 text-primary"
            aria-hidden="true"
          />
          <span>{tip}</span>
        </p>
      )}
    </section>
  );
}
