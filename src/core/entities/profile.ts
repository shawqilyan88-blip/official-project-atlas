import type { UserId } from './identifiers';

/**
 * A profile holds the application-owned facts about a person.
 *
 * Credentials live in Supabase's `auth.users` and are never mirrored here; this
 * record exists so the app can join user-facing data (name, avatar) without
 * reaching into the auth schema, and so a user can be referenced by other
 * tenants' rows without exposing their email.
 */
export interface Profile {
  readonly id: UserId;
  readonly email: string;
  readonly fullName: string | null;
  readonly avatarUrl: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export const FULL_NAME_MAX_LENGTH = 80;

/**
 * The best human label available, degrading gracefully: real name, then the
 * local part of the email, then a neutral fallback. Never renders a raw id.
 */
export function displayName(profile: Pick<Profile, 'fullName' | 'email'>): string {
  const trimmed = profile.fullName?.trim();
  if (trimmed) return trimmed;

  const localPart = profile.email.split('@')[0];
  return localPart && localPart.length > 0 ? localPart : 'Member';
}

/**
 * Up to two initials for avatar fallbacks. Uses `Intl.Segmenter` so that
 * non-Latin scripts and emoji produce one visible character rather than half of
 * a surrogate pair.
 */
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';

  const firstCharacter = (word: string): string => {
    const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
    const [segment] = segmenter.segment(word);
    return (segment?.segment ?? word.charAt(0)).toUpperCase();
  };

  const first = words[0];
  const last = words[words.length - 1];
  if (!first) return '?';
  if (words.length === 1 || !last) return firstCharacter(first);

  return `${firstCharacter(first)}${firstCharacter(last)}`;
}
