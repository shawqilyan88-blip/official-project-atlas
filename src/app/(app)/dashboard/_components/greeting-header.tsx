import type { Greeting, GreetingTone } from '@/modules/dashboard/domain/greeting';
import { TimezoneCapture } from '@/modules/personalization/ui/timezone-capture';
import { cn } from '@/shared/ui';

/**
 * The dynamic greeting.
 *
 * The text comes from the greeting engine, which varies it by time, day, and
 * activity and never repeats the same line two days running. This component only
 * dresses it: a tone-coloured eyebrow, a large salutation, and Atlas's status
 * line beneath. The mounted `TimezoneCapture` teaches Atlas the browser's
 * timezone so tomorrow's greeting knows the user's real local time.
 */
const TONE_EYEBROW: Readonly<Record<GreetingTone, { label: string; className: string }>> =
  {
    welcome: { label: 'Welcome to Atlas', className: 'text-primary' },
    achievement: { label: 'Milestone', className: 'text-success' },
    active: { label: 'Atlas · online', className: 'text-primary' },
    weekend: { label: 'Weekend', className: 'text-muted-foreground' },
    quiet: { label: 'Atlas · standing by', className: 'text-muted-foreground' },
    neutral: { label: 'Atlas · online', className: 'text-primary' },
  };

export function GreetingHeader({
  greeting,
  timezone,
}: {
  greeting: Greeting;
  timezone: string;
}) {
  const eyebrow = TONE_EYEBROW[greeting.tone];

  return (
    <header className="animate-rise">
      <TimezoneCapture known={timezone} />

      <p
        className={cn(
          'flex items-center gap-2 text-xs font-semibold tracking-wider uppercase',
          eyebrow.className,
        )}
      >
        <span className="relative flex size-1.5">
          <span className="animate-breathe absolute inline-flex size-full rounded-full bg-current opacity-70" />
          <span className="relative inline-flex size-1.5 rounded-full bg-current" />
        </span>
        {eyebrow.label}
      </p>

      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-balance sm:text-[1.75rem]">
        {greeting.salutation}
      </h1>
      <p className="mt-1.5 max-w-2xl text-[0.9375rem] leading-relaxed text-muted-foreground">
        {greeting.subline}
      </p>
    </header>
  );
}
