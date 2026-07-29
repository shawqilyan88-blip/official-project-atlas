/**
 * Personalization — the "About You" domain.
 *
 * This module is the seam for a feature that does not fully exist yet: a page
 * where Atlas gradually learns how you work and adapts. Building the *shape* now
 * — even though the only value it carries today is a timezone — means the
 * greeting engine, the dashboard, and a future settings page all already speak
 * in terms of a `PersonalizationSnapshot`, so filling it in later adds data, not
 * a rewrite.
 *
 * The design distinction that matters: a fact Atlas *observed* (inferred from
 * behaviour) is not the same as one the user *stated*. Keeping `source` and
 * `confidence` on every fact is what will let the About You page show "Atlas
 * thinks your main market is the EU — is that right?" and let the user correct
 * it. That correction loop is the whole point of the future feature, so the type
 * is built for it from the start.
 */

export type FactSource = 'stated' | 'observed';

export interface LearnedFact {
  readonly id: string;
  /** What this fact is about, e.g. "Primary market". */
  readonly label: string;
  /** The value, e.g. "European Union". */
  readonly value: string;
  /** Whether the user told Atlas, or Atlas inferred it. */
  readonly source: FactSource;
  /** 0-1. Observed facts start low and rise as evidence accumulates. */
  readonly confidence: number;
  readonly learnedAt: string;
}

/** How Atlas should address and speak to the user. Future About You controls. */
export type VoiceTone = 'warm' | 'concise';

export interface PersonalizationSnapshot {
  /** IANA timezone. Drives the greeting's time-of-day; the first thing learned. */
  readonly timezone: string;
  /** Overrides the profile name in greetings when the user sets a preference. */
  readonly preferredName: string | null;
  readonly tone: VoiceTone;
  /**
   * What Atlas has learned about how this person trades. Empty today; the About
   * You page and the trade engines will populate it over time.
   */
  readonly facts: readonly LearnedFact[];
}

/**
 * The snapshot for a brand-new user, before anything is known or captured.
 * `UTC` is the safe default until the browser reports the real timezone.
 */
export const DEFAULT_PERSONALIZATION: PersonalizationSnapshot = {
  timezone: 'UTC',
  preferredName: null,
  tone: 'warm',
  facts: [],
};

/** Valid IANA-ish timezone check — cheap guard before trusting a client value. */
export function isPlausibleTimezone(value: string): boolean {
  if (value.length === 0 || value.length > 64) return false;
  // Region/City, or a fixed offset like Etc/GMT+3, or 'UTC'.
  return /^[A-Za-z]+(?:[/_+-][A-Za-z0-9]+)*$/.test(value);
}
