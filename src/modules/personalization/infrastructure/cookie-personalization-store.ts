import { cookies } from 'next/headers';

import { isProduction } from '@/shared/config/env';
import type { PersonalizationStore } from '@/modules/personalization/application/ports';
import {
  DEFAULT_PERSONALIZATION,
  isPlausibleTimezone,
  type PersonalizationSnapshot,
} from '@/modules/personalization/domain/personalization';

const TIMEZONE_COOKIE = 'atlas.tz';
const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

/**
 * The interim personalization store.
 *
 * It reads only the timezone — the one preference the browser can report on its
 * own — and returns defaults for everything else. It is deliberately thin: the
 * point of this class is to satisfy the port so the rest of the app can be built
 * against real personalization data before the About You page and its table
 * exist. The future store swaps in here and the callers are untouched.
 *
 * The timezone is a *preference cookie*, not a security boundary: it only
 * affects which words the greeting uses, so an invalid or forged value can do
 * nothing worse than show the wrong time of day, and `isPlausibleTimezone`
 * rejects the obviously malformed before it reaches `Intl`.
 */
export class CookiePersonalizationStore implements PersonalizationStore {
  async read(): Promise<PersonalizationSnapshot> {
    const store = await cookies();
    const raw = store.get(TIMEZONE_COOKIE)?.value;
    const timezone =
      raw !== undefined && isPlausibleTimezone(raw)
        ? raw
        : DEFAULT_PERSONALIZATION.timezone;

    return { ...DEFAULT_PERSONALIZATION, timezone };
  }

  async rememberTimezone(timezone: string): Promise<void> {
    if (!isPlausibleTimezone(timezone)) return;

    const store = await cookies();
    store.set(TIMEZONE_COOKIE, timezone, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProduction(),
      path: '/',
      maxAge: ONE_YEAR_IN_SECONDS,
    });
  }
}
