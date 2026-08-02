'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { routes } from '@/shared/config/routes';
import { Button } from '@/shared/ui';
import { ArrowRightIcon, CheckIcon } from '@/shared/ui/icons';

/**
 * The closing beat of onboarding.
 *
 * The profile is already saved before this screen renders, so there is no work
 * to narrate. It is a still, honest confirmation — no fabricated "building…"
 * steps and no "preparing AI recommendations" theatre (D.3: motion and progress
 * only for real work) — then a hand-off to the dashboard, with a manual button
 * as a fallback if the auto-redirect is slow.
 */
export function BuildingProfile() {
  const router = useRouter();

  useEffect(() => {
    // A brief pause to register the confirmation, then continue. No staged timer.
    const timer = setTimeout(() => router.push(routes.dashboard), 1600);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center text-center">
      {/* A still presence mark — nothing is computing here. */}
      <span className="relative mb-8 flex size-20 items-center justify-center">
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full border border-dashed border-primary/40"
        />
        <span
          aria-hidden="true"
          className="absolute inset-2 rounded-full bg-primary/20 blur-lg"
        />
        <span className="relative flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <CheckIcon className="size-7" aria-hidden="true" />
        </span>
      </span>

      <h1 className="text-2xl font-semibold tracking-tight text-balance">
        Your Company Profile is ready.
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Atlas is oriented around your business and ready to get to work.
      </p>

      <Button asChild size="lg" className="mt-8">
        <a href={routes.dashboard}>
          Enter Atlas
          <ArrowRightIcon aria-hidden="true" />
        </a>
      </Button>
    </div>
  );
}
