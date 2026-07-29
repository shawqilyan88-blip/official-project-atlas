import type { PersonalizationSnapshot } from '../domain/personalization';

/**
 * The personalization port.
 *
 * Today a single implementation reads the timezone from a cookie and returns
 * defaults for everything else. When the About You page arrives, a
 * Supabase-backed implementation will satisfy the same interface — the dashboard
 * and greeting engine that depend on this port will not change.
 */
export interface PersonalizationStore {
  /** The current snapshot for this request's user. Never throws; falls back to defaults. */
  read(): Promise<PersonalizationSnapshot>;

  /**
   * Remembers the browser-reported timezone so the greeting shows the user's
   * real local time from the next request onward.
   */
  rememberTimezone(timezone: string): Promise<void>;
}
