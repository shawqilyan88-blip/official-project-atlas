'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { routes } from '@/shared/config/routes';
import { Button, cn } from '@/shared/ui';
import { ArrowRightIcon, CheckIcon, SparklesIcon } from '@/shared/ui/icons';

/**
 * The closing beat: Atlas assembling the profile, then handing the user off.
 *
 * The steps are honest about what actually just happened — the profile was
 * saved and Atlas is orienting around it. It is a moment of polish, not a fake
 * loading bar: it advances on a timer and then routes to the dashboard, with a
 * manual button as a fallback if a user's motion settings or a slow client
 * leave the timer behind.
 */
const STEPS = [
  'Building your Trade Profile',
  'Understanding your products',
  'Mapping your markets',
  'Preparing AI recommendations',
] as const;

const STEP_MS = 750;
const HOLD_MS = 900;

export function BuildingProfile() {
  const router = useRouter();
  const [active, setActive] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    STEPS.forEach((_, index) => {
      timers.push(setTimeout(() => setActive(index), index * STEP_MS));
    });

    const total = STEPS.length * STEP_MS;
    timers.push(setTimeout(() => setDone(true), total));
    timers.push(setTimeout(() => router.push(routes.dashboard), total + HOLD_MS));

    return () => timers.forEach(clearTimeout);
  }, [router]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center text-center">
      {/* Presence: a breathing orb inside a slow orbit ring. */}
      <span className="relative mb-8 flex size-20 items-center justify-center">
        <span
          aria-hidden="true"
          className="animate-orbit absolute inset-0 rounded-full border border-dashed border-primary/40"
        />
        <span
          aria-hidden="true"
          className="absolute inset-2 rounded-full bg-primary/20 blur-lg"
        />
        <span className="animate-breathe relative flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
          {done ? (
            <CheckIcon className="size-7" aria-hidden="true" />
          ) : (
            <SparklesIcon className="size-6" aria-hidden="true" />
          )}
        </span>
      </span>

      <h1 className="text-2xl font-semibold tracking-tight text-balance">
        {done ? 'Your Company Profile is ready.' : 'Teaching Atlas about your business'}
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {done
          ? 'Atlas is oriented around your business and ready to get to work.'
          : 'This only takes a moment.'}
      </p>

      <ul className="mt-8 w-full space-y-2.5 text-left" aria-live="polite">
        {STEPS.map((step, index) => {
          const state =
            done || index < active ? 'done' : index === active ? 'active' : 'idle';
          return (
            <li
              key={step}
              className={cn(
                'flex items-center gap-3 rounded-xl border px-4 py-2.5 transition-colors duration-[--duration-base]',
                state === 'idle'
                  ? 'border-border/50 bg-transparent'
                  : 'border-border/70 bg-card',
              )}
            >
              <span
                className={cn(
                  'flex size-5 shrink-0 items-center justify-center rounded-full border',
                  state === 'done'
                    ? 'border-success/40 bg-success/15 text-success'
                    : state === 'active'
                      ? 'border-primary/50 bg-primary/10 text-primary'
                      : 'border-border bg-muted/40 text-muted-foreground',
                )}
                aria-hidden="true"
              >
                {state === 'done' ? (
                  <CheckIcon className="size-3" />
                ) : state === 'active' ? (
                  <span className="animate-breathe size-1.5 rounded-full bg-current" />
                ) : (
                  <span className="size-1.5 rounded-full bg-current opacity-40" />
                )}
              </span>
              <span
                className={cn(
                  'text-sm',
                  state === 'idle' ? 'text-muted-foreground/60' : 'text-foreground',
                )}
              >
                {step}
              </span>
            </li>
          );
        })}
      </ul>

      {done && (
        <Button asChild size="lg" className="animate-rise mt-8">
          <a href={routes.dashboard}>
            Enter Atlas
            <ArrowRightIcon aria-hidden="true" />
          </a>
        </Button>
      )}
    </div>
  );
}
