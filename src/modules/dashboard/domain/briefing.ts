/**
 * Today's Briefing — Atlas summarising the day in its own voice.
 *
 * The command centre takes direction; the briefing gives an account. It answers
 * two questions a good assistant answers unprompted: *what have you handled?*
 * and *what still needs me?* Split into two short lists so the reassurance and
 * the ask are never tangled.
 *
 * Everything here is true. On a new workspace the accomplishments are real
 * system facts — the workspace was provisioned with tenant isolation, the
 * timezone was detected, Atlas is on watch — and the asks are the real next
 * steps, each pointing somewhere concrete. As the trade engines come online and
 * start doing autonomous work, those actions flow into `accomplished` through
 * this same shape.
 *
 * Pure: it takes resolved facts and returns text. No dates, no I/O.
 */

export interface BriefingItem {
  readonly text: string;
  /** A concrete place to act, when one exists. */
  readonly href?: string;
}

export interface Briefing {
  /** Atlas's one-line read on where things stand. */
  readonly headline: string;
  /** What is already handled — reassurance. */
  readonly accomplished: readonly BriefingItem[];
  /** What needs the user now — the ask. */
  readonly attention: readonly BriefingItem[];
}

export interface BriefingFacts {
  readonly workspaceName: string;
  readonly isFirstDay: boolean;
  readonly memberCount: number;
  /** City resolved from the browser, or null while still the UTC default. */
  readonly timezoneCity: string | null;
  /** Whether the company profile is complete — a real DB fact. */
  readonly profileComplete: boolean;
  /** Whether at least one trade opportunity exists — a real DB fact. */
  readonly hasOpportunity: boolean;
}

/**
 * Both columns are derived purely from real facts, so the day a milestone is
 * met it moves from `attention` to `accomplished` on its own — there are no
 * unconditional placeholders that linger after the work is done.
 */
export function composeBriefing(facts: BriefingFacts): Briefing {
  const accomplished: BriefingItem[] = [
    {
      text: `Provisioned ${facts.workspaceName} with tenant-isolated security`,
    },
  ];

  if (facts.timezoneCity !== null) {
    accomplished.push({
      text: `Detected your timezone — ${facts.timezoneCity} — to time outreach well`,
    });
  }

  if (facts.memberCount > 1) {
    accomplished.push({
      text: `Set up access for ${facts.memberCount} team members`,
    });
  }

  if (facts.profileComplete) {
    accomplished.push({
      text: 'Learned your business from your company profile',
    });
  }

  if (facts.hasOpportunity) {
    accomplished.push({
      text: 'Set up your first trade opportunity — ready to search',
    });
  }

  const attention: BriefingItem[] = [];

  // Each ask is gated on its milestone being unmet, so completing it removes it.
  if (!facts.profileComplete) {
    attention.push({
      text: 'Complete your company profile so I can match you accurately',
      href: '/onboarding/profile',
    });
  } else if (!facts.hasOpportunity) {
    attention.push({
      text: 'Create your first trade opportunity to start finding partners',
      href: '/opportunities/new',
    });
  }

  if (facts.memberCount <= 1) {
    attention.push({
      text: "You're the only member — invite your team",
      href: '/settings/members',
    });
  }

  const setUp = facts.profileComplete && facts.hasOpportunity;
  const headline = !facts.profileComplete
    ? 'Your workspace is live and secured. Tell me about your business and I get to work.'
    : !facts.hasOpportunity
      ? 'Profile set. Create your first opportunity and I start searching.'
      : setUp && facts.memberCount <= 1
        ? "You're set up — invite your team, or point me at a search."
        : "You're set up. Point me at a search and I bring back buyers and suppliers.";

  return { headline, accomplished, attention };
}
