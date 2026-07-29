'use client';

import { useState } from 'react';

import { cn } from '@/shared/ui';
import { CornerDownLeftIcon, SparklesIcon } from '@/shared/ui/icons';

/**
 * The AI Command Center — the visual and functional centre of the dashboard.
 *
 * Atlas is directed, not operated, so the largest, brightest object on the
 * screen is the place you tell it what to do. The presence orb breathes and
 * carries a slow orbit ring so the surface feels alive without demanding
 * attention — motion as ambient signal, not decoration.
 *
 * It stays honest about what is live: the discovery, outreach, and deal engines
 * arrive in later sprints, so submitting acknowledges the instruction and says
 * plainly that Atlas is still activating rather than fabricating a result. When
 * the engines land, this component becomes their entry point unchanged.
 */
const DEFAULT_SUGGESTIONS = [
  'Find buyers in Germany',
  'Find suppliers in Vietnam',
  'Research the UAE market',
  'Draft a supplier introduction',
] as const;

export function CommandCenter({
  firstName,
  suggestions = DEFAULT_SUGGESTIONS,
}: {
  readonly firstName: string;
  /** Tuned to the workspace's Trade Profile when one exists. */
  readonly suggestions?: readonly string[];
}) {
  const [value, setValue] = useState('');
  const [submitted, setSubmitted] = useState<string | null>(null);

  const send = () => {
    const trimmed = value.trim();
    if (trimmed.length === 0) return;
    setSubmitted(trimmed);
    setValue('');
  };

  return (
    <section
      aria-labelledby="command-center-heading"
      className={cn(
        'relative overflow-hidden rounded-3xl border border-primary/15 p-6 sm:p-8',
        'bg-gradient-to-br from-primary/[0.09] via-card to-card',
        'shadow-[0_1px_0_0_color-mix(in_oklch,var(--primary)_20%,transparent)_inset,0_24px_60px_-32px_color-mix(in_oklch,var(--primary)_45%,transparent)]',
      )}
    >
      {/* Ambient aura, top-right, drifting slowly. Purely atmospheric. */}
      <div
        aria-hidden="true"
        className="animate-breathe pointer-events-none absolute -top-28 -right-16 size-72 rounded-full bg-primary/20 blur-3xl"
      />

      <div className="relative">
        <div className="mb-5 flex items-center gap-3">
          {/* Presence: a breathing orb inside a slowly orbiting ring. */}
          <span className="relative flex size-9 items-center justify-center">
            <span
              aria-hidden="true"
              className="animate-orbit absolute inset-0 rounded-full border border-dashed border-primary/40"
            />
            <span className="animate-breathe flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <SparklesIcon className="size-4" aria-hidden="true" />
            </span>
          </span>

          <div className="flex items-center gap-2">
            <h2 id="command-center-heading" className="text-sm font-semibold">
              Atlas
            </h2>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/60 px-2 py-0.5 text-[0.625rem] font-medium text-muted-foreground">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
                <span className="relative inline-flex size-1.5 rounded-full bg-success" />
              </span>
              Online
            </span>
          </div>
        </div>

        <p className="mb-5 text-xl font-medium tracking-tight text-balance sm:text-2xl">
          What would you like Atlas to do{firstName ? `, ${firstName}` : ''}?
        </p>

        <div className="flex items-end gap-2 rounded-2xl border border-input bg-background/80 p-2.5 shadow-subtle transition focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/15">
          <label htmlFor="command-input" className="sr-only">
            Tell Atlas what to do
          </label>
          <textarea
            id="command-input"
            rows={1}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                send();
              }
            }}
            placeholder="Find buyers or suppliers, research a market, draft outreach…"
            className="max-h-40 min-h-[2.5rem] flex-1 resize-none bg-transparent px-2 py-2 text-sm leading-relaxed outline-none placeholder:text-muted-foreground/70"
          />
          <button
            type="button"
            onClick={send}
            disabled={value.trim().length === 0}
            className={cn(
              'flex size-10 shrink-0 items-center justify-center rounded-xl transition',
              'bg-primary text-primary-foreground hover:bg-primary-hover active:scale-95',
              'disabled:opacity-40 disabled:hover:bg-primary',
            )}
          >
            <CornerDownLeftIcon className="size-4" aria-hidden="true" />
            <span className="sr-only">Send to Atlas</span>
          </button>
        </div>

        <ul className="mt-3 flex flex-wrap gap-2">
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion}
              className="animate-rise"
              style={{ ['--rise-delay' as string]: `${140 + index * 70}ms` }}
            >
              <button
                type="button"
                onClick={() => setValue(suggestion)}
                className="rounded-full border border-border/70 bg-background/50 px-3 py-1 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
              >
                {suggestion}
              </button>
            </li>
          ))}
        </ul>

        {submitted !== null && (
          <div
            role="status"
            className="animate-rise mt-4 rounded-2xl border border-border/70 bg-background/60 p-4"
          >
            <p className="text-sm">
              <span className="text-muted-foreground">You asked Atlas to</span>{' '}
              <span className="font-medium">“{submitted}”</span>
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              Atlas is still being activated — buyer and supplier discovery, outreach, and
              deal tracking come online in the next releases. Your instruction is noted,
              and this is exactly where the work will appear once the engines are live.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
