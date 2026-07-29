/**
 * The greeting engine.
 *
 * Atlas is meant to read as a colleague, not a control panel, and the greeting
 * is where that voice lives. Two rules govern it:
 *
 * 1. It must never feel canned. The same account on two different days must get
 *    two different greetings. This is achieved deterministically: a seed derived
 *    from `userId + dateKey` selects the variant, so the choice is *stable
 *    within a day* (no flicker on re-render) but rotates as the date changes.
 *    No randomness at call time, which also keeps server and client in sync.
 *
 * 2. It must respond to reality — the hour, the day of week, how new the account
 *    is, what just happened, and how quiet things have been. The engine picks a
 *    *context* from those signals first, then a variant within it.
 *
 * The engine is pure: it takes a fully-resolved clock and signal set and returns
 * text. It knows nothing about React, Supabase, or the current time — the caller
 * resolves those, which is what makes it trivially testable and what lets the
 * future "About You" page feed it learned preferences (tone, preferred name)
 * without touching this file's shape.
 */

export interface GreetingClock {
  /** Local hour 0-23, resolved from the user's timezone. */
  readonly hour: number;
  readonly isWeekend: boolean;
  /** Local `YYYY-MM-DD`. The daily component of the variant seed. */
  readonly dateKey: string;
}

export type Achievement =
  'workspace-created' | 'first-teammate' | 'first-search' | 'first-reply';

export interface GreetingSignals {
  /** The account was created today. */
  readonly isFirstDay: boolean;
  readonly daysSinceJoined: number;
  readonly memberCount: number;
  /** Actions Atlas has taken on the user's behalf today. 0 until the engines ship. */
  readonly actionsToday: number;
  /** Consecutive days with no Atlas activity. */
  readonly quietDays: number;
  /** Milestones reached recently, most significant first. */
  readonly achievements: readonly Achievement[];
}

/** How the caller should colour the greeting. */
export type GreetingTone =
  'welcome' | 'achievement' | 'active' | 'weekend' | 'quiet' | 'neutral';

export interface Greeting {
  /** The headline. Already personalised. */
  readonly salutation: string;
  /** One line beneath, in Atlas's voice — what it is doing or waiting to do. */
  readonly subline: string;
  readonly tone: GreetingTone;
}

// ---------------------------------------------------------------------------
// Deterministic selection
// ---------------------------------------------------------------------------

/** FNV-1a: a small, well-distributed string hash. Not cryptographic. */
function hashString(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** Picks a stable element from a pool for a given seed+salt. */
function pick<T>(pool: readonly T[], seed: number, salt: string): T {
  const index = hashString(salt + seed.toString(36)) % pool.length;
  // Pool is never empty by construction below; the assertion documents that.
  return pool[index] as T;
}

// ---------------------------------------------------------------------------
// Time of day
// ---------------------------------------------------------------------------

type Daypart = 'morning' | 'afternoon' | 'evening' | 'night';

function daypartOf(hour: number): Daypart {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
}

const TIME_WORD: Readonly<Record<Daypart, string>> = {
  morning: 'morning',
  afternoon: 'afternoon',
  evening: 'evening',
  night: 'night',
};

// ---------------------------------------------------------------------------
// Salutation pools, keyed by context. `{name}` and `{time}` are filled in.
// ---------------------------------------------------------------------------

const SALUTATIONS = {
  firstDay: [
    'Welcome aboard, {name}.',
    "Let's get you started, {name}.",
    'Good {time}, {name} — welcome to Atlas.',
    "You're all set up, {name}.",
  ],
  achievement: [
    'Nicely done, {name}.',
    "That's a milestone, {name}.",
    'Momentum, {name}.',
  ],
  weekendQuiet: [
    'Enjoying the weekend, {name}?',
    'Quiet {time}, {name}.',
    "Weekend mode, {name} — I've got the watch.",
    'Take the {time} off, {name}.',
  ],
  quiet: [
    "It's been quiet, {name}.",
    'Ready when you are, {name}.',
    'Standing by, {name}.',
    'Point me somewhere, {name}.',
  ],
  night: [
    'Burning the midnight oil, {name}?',
    'Late one, {name}.',
    'Still here, {name}? So am I.',
    'Good {time}, {name}.',
  ],
  active: [
    'Good {time}, {name}.',
    "Here's where things stand, {name}.",
    'Back at it, {name}.',
    'Good {time}, {name} — busy day.',
  ],
  neutral: [
    'Good {time}, {name}.',
    'Hello, {name}.',
    'Good to see you, {name}.',
    'Good {time}, {name}.',
  ],
} as const;

// ---------------------------------------------------------------------------
// Sublines — Atlas's status, answering "what have I done for you today?"
// ---------------------------------------------------------------------------

const SUBLINES = {
  firstDay: [
    "I'm Atlas. Tell me what you trade and I'll start finding buyers and suppliers.",
    "Point me at a market and I'll get to work — no setup required.",
    'Give me a product and a region, and watch me open the first doors.',
  ],
  idleWeekday: [
    "I haven't started yet — give me a market and I'll begin.",
    'Nothing on the board today. Tell me who to look for.',
    'Standing by. The moment you point me somewhere, I start.',
    "No moves yet today. Hand me a brief and I'll run it.",
  ],
  idleWeekend: [
    "I'll keep scanning while you're away and brief you when you're back.",
    'Rest easy — I watch the markets even on weekends.',
    "Enjoy the break. I'll have something for you when you return.",
  ],
  active: [
    'Here is what I moved on today.',
    "Today's progress is below.",
    "Here's what happened while you were away.",
  ],
} as const;

// ---------------------------------------------------------------------------
// Composition
// ---------------------------------------------------------------------------

function fill(template: string, name: string, timeWord: string): string {
  return template.replaceAll('{name}', name).replaceAll('{time}', timeWord);
}

export function composeGreeting(input: {
  name: string;
  clock: GreetingClock;
  signals: GreetingSignals;
}): Greeting {
  const { name, clock, signals } = input;
  const daypart = daypartOf(clock.hour);
  const timeWord = TIME_WORD[daypart];

  // The seed changes every day and differs per user, so variant selection
  // rotates daily. Salt each pick so salutation and subline vary independently.
  const seed = hashString(`${name}|${clock.dateKey}`);

  // Context precedence: a genuine milestone or a brand-new account outranks the
  // routine time-of-day greeting; a weekend outranks an ordinary quiet day.
  let salutationPool: readonly string[];
  let sublinePool: readonly string[];
  let tone: GreetingTone;

  if (signals.isFirstDay) {
    salutationPool = SALUTATIONS.firstDay;
    sublinePool = SUBLINES.firstDay;
    tone = 'welcome';
  } else if (signals.achievements.length > 0 && signals.actionsToday === 0) {
    salutationPool = SALUTATIONS.achievement;
    sublinePool = clock.isWeekend ? SUBLINES.idleWeekend : SUBLINES.idleWeekday;
    tone = 'achievement';
  } else if (signals.actionsToday > 0) {
    salutationPool = SALUTATIONS.active;
    sublinePool = SUBLINES.active;
    tone = 'active';
  } else if (clock.isWeekend) {
    salutationPool = SALUTATIONS.weekendQuiet;
    sublinePool = SUBLINES.idleWeekend;
    tone = 'weekend';
  } else if (daypart === 'night') {
    salutationPool = SALUTATIONS.night;
    sublinePool = SUBLINES.idleWeekday;
    tone = 'quiet';
  } else if (signals.quietDays >= 2) {
    salutationPool = SALUTATIONS.quiet;
    sublinePool = SUBLINES.idleWeekday;
    tone = 'quiet';
  } else {
    salutationPool = SALUTATIONS.neutral;
    sublinePool = SUBLINES.idleWeekday;
    tone = 'neutral';
  }

  return {
    salutation: fill(pick(salutationPool, seed, 'salutation'), name, timeWord),
    subline: fill(pick(sublinePool, seed, 'subline'), name, timeWord),
    tone,
  };
}
