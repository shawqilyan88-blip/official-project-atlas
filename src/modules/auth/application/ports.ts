import type { AppError } from '@/core/errors';
import type { Result } from '@/core/result';

/**
 * The authentication port.
 *
 * The application layer depends on this interface, never on Supabase. That
 * indirection buys two concrete things: use-cases become testable with a plain
 * in-memory fake, and replacing the auth provider becomes one new adapter
 * rather than a search across the codebase.
 */

export interface AuthenticatedUser {
  readonly id: string;
  readonly email: string;
}

export interface SignUpResult {
  readonly user: AuthenticatedUser | null;
  /**
   * True when the provider requires the address to be confirmed before the
   * account becomes usable. Drives the "check your email" step.
   */
  readonly requiresEmailConfirmation: boolean;
}

export interface AuthGateway {
  signInWithPassword(
    email: string,
    password: string,
  ): Promise<Result<AuthenticatedUser, AppError>>;

  signUpWithPassword(input: {
    email: string;
    password: string;
    fullName: string;
    emailRedirectTo: string;
  }): Promise<Result<SignUpResult, AppError>>;

  signOut(): Promise<Result<void, AppError>>;

  /**
   * The current user, verified against the auth server rather than read from a
   * cookie. Returns `null` when there is no valid session.
   */
  getCurrentUser(): Promise<Result<AuthenticatedUser | null, AppError>>;

  /** Completes the PKCE flow after an email confirmation or OAuth redirect. */
  exchangeCodeForSession(code: string): Promise<Result<AuthenticatedUser, AppError>>;
}
