import type { PersonalizationSnapshot } from '@/modules/personalization/domain/personalization';
import { SparklesIcon } from '@/shared/ui/icons';

/**
 * The About You card — a first, visible surface of the personalization seam.
 *
 * The full About You page does not exist yet, but the concept earns a place on
 * the dashboard now because it is core to the product's promise: Atlas gets to
 * know you. The card shows what Atlas has already learned (today, just the
 * timezone) and names what it is still learning, so the idea of a system that
 * adapts over time is present from day one rather than bolted on later.
 *
 * It reads from the same `PersonalizationSnapshot` the greeting engine uses, so
 * when the About You page starts writing real learned facts, this fills in with
 * no change here.
 */
interface Learnable {
  readonly label: string;
  readonly value: string | null;
}

export function AboutYouCard({
  personalization,
}: {
  personalization: PersonalizationSnapshot;
}) {
  // Today only the timezone is known; the rest are shown as "learning" so the
  // adaptive nature of the feature is legible before the data exists.
  const learned: readonly Learnable[] = [
    { label: 'Timezone', value: timezoneLabel(personalization.timezone) },
    { label: 'Working hours', value: factValue(personalization, 'Working hours') },
    { label: 'Primary markets', value: factValue(personalization, 'Primary markets') },
    { label: 'What you trade', value: factValue(personalization, 'What you trade') },
    { label: 'Industry', value: factValue(personalization, 'Industry') },
    {
      label: 'Buyer & supplier preferences',
      value: factValue(personalization, 'Buyer & supplier preferences'),
    },
    {
      label: 'Communication style',
      value: factValue(personalization, 'Communication style'),
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
        Atlas learns your markets, your buyer and supplier preferences, and how you like
        to work — and adapts. Here is what it knows so far.
      </p>

      <dl className="mt-4 space-y-2.5">
        {learned.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-3">
            <dt className="text-[0.8125rem] text-muted-foreground">{item.label}</dt>
            <dd>
              {item.value !== null ? (
                <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[0.75rem] font-medium text-primary">
                  {item.value}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[0.75rem] text-muted-foreground/70">
                  <span
                    className="animate-breathe size-1.5 rounded-full bg-muted-foreground/50"
                    aria-hidden="true"
                  />
                  Learning…
                </span>
              )}
            </dd>
          </div>
        ))}
      </dl>

      <p className="mt-4 border-t border-border/60 pt-3 text-xs leading-relaxed text-muted-foreground/80">
        The more you work with Atlas, the more this fills in — and the sharper its
        suggestions get.
      </p>
    </section>
  );
}

function timezoneLabel(timezone: string): string | null {
  if (timezone === 'UTC') return null; // default — not yet learned from the browser
  // Show the city, not the region prefix: "Europe/London" -> "London".
  const city = timezone.split('/').pop();
  return city ? city.replaceAll('_', ' ') : timezone;
}

function factValue(
  personalization: PersonalizationSnapshot,
  label: string,
): string | null {
  return personalization.facts.find((fact) => fact.label === label)?.value ?? null;
}
