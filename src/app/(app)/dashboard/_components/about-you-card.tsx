import Link from 'next/link';

import type { PersonalizationSnapshot } from '@/modules/personalization/domain/personalization';
import type {
  LookingFor,
  TradeProfile,
} from '@/modules/trade-profile/domain/trade-profile';
import { routes } from '@/shared/config/routes';
import { ArrowRightIcon, SparklesIcon } from '@/shared/ui/icons';

/**
 * The About You card — what Atlas actually knows about the user's business.
 *
 * It reflects real, stated facts: the company profile (what you trade, your
 * markets, industry, and whether you're finding buyers or suppliers) plus the
 * timezone learned from the browser. It never claims to be "learning" things it
 * has no way to know, and it points to the one action that sharpens it — keeping
 * the profile current (D.5: every surface guides the next step; nothing implies
 * capability that isn't real).
 */
interface Fact {
  readonly label: string;
  readonly value: string | null;
  /** Shown, muted, when the value is not set. */
  readonly empty: string;
}

export function AboutYouCard({
  personalization,
  profile,
}: {
  personalization: PersonalizationSnapshot;
  profile: TradeProfile | null;
}) {
  const facts: readonly Fact[] = [
    {
      label: 'What you trade',
      value: joinList(profile?.products ?? []),
      empty: 'Not set',
    },
    {
      label: 'Primary markets',
      value: countLabel(profile?.countries.length ?? 0, 'market', 'markets'),
      empty: 'Not set',
    },
    { label: 'Industry', value: profile?.industry ?? null, empty: 'Not set' },
    {
      label: 'Finding',
      value: lookingForLabel(profile?.lookingFor ?? null),
      empty: 'Not set',
    },
    {
      label: 'Timezone',
      value: timezoneLabel(personalization.timezone),
      empty: 'Not detected yet',
    },
  ];

  return (
    <section
      aria-labelledby="about-you-heading"
      className="animate-rise rounded-2xl border border-border/70 bg-card p-5"
      style={{ ['--rise-delay' as string]: '200ms' }}
    >
      <div className="flex items-center gap-2">
        <SparklesIcon className="size-4 text-primary" aria-hidden="true" />
        <h2 id="about-you-heading" className="text-sm font-semibold">
          About you
        </h2>
      </div>
      <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-muted-foreground">
        What Atlas knows about your business, drawn from your profile. The fuller it is,
        the sharper every match.
      </p>

      <dl className="mt-4 space-y-2.5">
        {facts.map((fact) => (
          <div key={fact.label} className="flex items-center justify-between gap-3">
            <dt className="text-[0.8125rem] text-muted-foreground">{fact.label}</dt>
            <dd>
              {fact.value !== null ? (
                <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[0.75rem] font-medium text-primary">
                  {fact.value}
                </span>
              ) : (
                <span className="text-[0.75rem] text-muted-foreground/60">
                  {fact.empty}
                </span>
              )}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 border-t border-border/60 pt-3">
        <Link
          href={routes.onboardingProfile}
          className="focus-ring inline-flex items-center gap-1 rounded text-xs font-medium text-primary hover:underline"
        >
          Update your profile
          <ArrowRightIcon className="size-3.5" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

function joinList(items: readonly string[]): string | null {
  if (items.length === 0) return null;
  const shown = items.slice(0, 2).join(', ');
  return items.length > 2 ? `${shown} +${items.length - 2}` : shown;
}

function countLabel(count: number, one: string, many: string): string | null {
  if (count === 0) return null;
  return `${count} ${count === 1 ? one : many}`;
}

function lookingForLabel(lookingFor: LookingFor | null): string | null {
  if (lookingFor === 'buyers') return 'Buyers';
  if (lookingFor === 'suppliers') return 'Suppliers';
  if (lookingFor === 'both') return 'Buyers & suppliers';
  return null;
}

function timezoneLabel(timezone: string): string | null {
  if (timezone === 'UTC') return null; // default — not yet learned from the browser
  // Show the city, not the region prefix: "Europe/London" -> "London".
  const city = timezone.split('/').pop();
  return city ? city.replaceAll('_', ' ') : timezone;
}
