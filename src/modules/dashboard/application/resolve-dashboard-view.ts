import { type TenantContext, displayName } from '@/core/entities';
import type { PersonalizationSnapshot } from '@/modules/personalization/domain/personalization';

import { type Briefing, composeBriefing } from '../domain/briefing';
import {
  type Achievement,
  composeGreeting,
  type Greeting,
  type GreetingClock,
  type GreetingSignals,
} from '../domain/greeting';

/**
 * Assembles everything the dashboard header needs from the request's facts.
 *
 * This is the application seam between the raw tenant context and the pure
 * greeting engine: it resolves the user's local clock from their timezone,
 * derives the behavioural signals the engine reads, and returns a view model.
 * Kept out of the page so the derivation is testable without rendering, and out
 * of the domain so the domain stays free of dates and timezones.
 */
export interface DashboardView {
  readonly greeting: Greeting;
  readonly briefing: Briefing;
  readonly firstName: string;
  readonly signals: GreetingSignals;
  readonly clock: GreetingClock;
}

/**
 * The city inside an IANA timezone, or null while still the UTC default.
 * "Europe/London" -> "London"; the default is treated as "not yet learned".
 */
function timezoneCityOf(timezone: string): string | null {
  if (timezone === 'UTC') return null;
  const city = timezone.split('/').pop();
  return city ? city.replaceAll('_', ' ') : timezone;
}

/** Resolves the local hour, weekend flag, and date key for a timezone. */
function clockFor(timezone: string, at: Date): GreetingClock {
  // `en-CA` yields YYYY-MM-DD parts, which compose into the date key directly.
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    weekday: 'short',
  }).formatToParts(at);

  const get = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((part) => part.type === type)?.value ?? '';

  // A midnight hour can format as '24' in some engines; fold it back to 0.
  const hour = Number.parseInt(get('hour'), 10) % 24;
  const weekday = get('weekday');

  return {
    hour: Number.isNaN(hour) ? 12 : hour,
    isWeekend: weekday === 'Sat' || weekday === 'Sun',
    dateKey: `${get('year')}-${get('month')}-${get('day')}`,
  };
}

function firstNameOf(name: string): string {
  return name.split(/\s+/)[0] ?? name;
}

export function resolveDashboardView(input: {
  context: TenantContext;
  personalization: PersonalizationSnapshot;
  memberCount: number;
  /** Real DB fact: the company profile is complete. */
  profileComplete: boolean;
  /** Real DB fact: at least one trade opportunity exists. */
  hasOpportunity: boolean;
  now: Date;
}): DashboardView {
  const { context, personalization, memberCount, profileComplete, hasOpportunity, now } =
    input;

  const clock = clockFor(personalization.timezone, now);
  const createdAt = new Date(context.organization.createdAt);
  const createdKey = clockFor(personalization.timezone, createdAt).dateKey;

  const isFirstDay = createdKey === clock.dateKey;
  const daysSinceJoined = Math.max(
    0,
    Math.floor((now.getTime() - createdAt.getTime()) / 86_400_000),
  );

  const achievements: Achievement[] = [];
  if (daysSinceJoined <= 1) achievements.push('workspace-created');
  if (memberCount > 1) achievements.push('first-teammate');

  const signals: GreetingSignals = {
    isFirstDay,
    daysSinceJoined,
    memberCount,
    // No activity engine yet; both are zero/idle until the trade modules ship.
    actionsToday: 0,
    quietDays: daysSinceJoined,
    achievements,
  };

  const name = personalization.preferredName ?? firstNameOf(displayName(context.profile));

  const briefing = composeBriefing({
    workspaceName: context.organization.name,
    isFirstDay,
    memberCount,
    timezoneCity: timezoneCityOf(personalization.timezone),
    profileComplete,
    hasOpportunity,
  });

  return {
    greeting: composeGreeting({ name, clock, signals }),
    briefing,
    firstName: name,
    signals,
    clock,
  };
}
