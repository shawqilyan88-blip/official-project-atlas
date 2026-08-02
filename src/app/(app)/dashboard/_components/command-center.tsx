import Link from 'next/link';

import { routes } from '@/shared/config/routes';
import { Button, cn } from '@/shared/ui';
import { PlusIcon, SparklesIcon, TargetIcon, UserIcon } from '@/shared/ui/icons';

/**
 * The Command Center — the honest entry point at the top of the dashboard.
 *
 * Atlas cannot yet understand free-form instructions, so this surface does not
 * pretend to. Instead of a text box that only echoes what you typed, it offers
 * clear shortcuts to the actions that genuinely work today, and says plainly
 * that directing Atlas in your own words is a planned capability. When
 * conversational direction lands, it becomes this component's primary input —
 * until then, nothing here implies intelligence Atlas does not have
 * (D.6; D.1 §5.9 — no inert hero; PAT-NEXT — every surface offers a real step).
 */
export function CommandCenter({ firstName }: { readonly firstName: string }) {
  return (
    <section
      aria-labelledby="command-center-heading"
      className={cn(
        'relative overflow-hidden rounded-3xl border border-primary/15 p-6 sm:p-8',
        'bg-gradient-to-br from-primary/[0.09] via-card to-card',
        'shadow-[0_1px_0_0_color-mix(in_oklch,var(--primary)_20%,transparent)_inset,0_24px_60px_-32px_color-mix(in_oklch,var(--primary)_45%,transparent)]',
      )}
    >
      {/* Ambient aura, top-right. Purely atmospheric — still, per D.3 ML-B. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-28 -right-16 size-72 rounded-full bg-primary/20 blur-3xl"
      />

      <div className="relative">
        <div className="mb-5 flex items-center gap-3">
          {/* Presence: a still mark. Motion is reserved for real work (D.3 ML-B). */}
          <span className="relative flex size-9 items-center justify-center">
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-full border border-dashed border-primary/40"
            />
            <span className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <SparklesIcon className="size-4" aria-hidden="true" />
            </span>
          </span>

          <div className="flex items-center gap-2">
            <h2 id="command-center-heading" className="text-sm font-semibold">
              Atlas
            </h2>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/60 px-2 py-0.5 text-[0.625rem] font-medium text-muted-foreground">
              <span className="size-1.5 rounded-full bg-success" aria-hidden="true" />
              Online
            </span>
          </div>
        </div>

        <p className="text-xl font-medium tracking-tight text-balance sm:text-2xl">
          What would you like to work on{firstName ? `, ${firstName}` : ''}?
        </p>
        <p className="mt-1.5 mb-5 text-sm leading-relaxed text-muted-foreground">
          Start with a shortcut. Directing Atlas in your own words is a capability we’re
          building — for now, pick one below.
        </p>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button asChild>
            <Link href={routes.opportunityNew}>
              <PlusIcon aria-hidden="true" />
              Start a new opportunity
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href={routes.opportunities}>
              <TargetIcon aria-hidden="true" />
              Your opportunities
            </Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href={routes.onboardingProfile}>
              <UserIcon aria-hidden="true" />
              Update your profile
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
