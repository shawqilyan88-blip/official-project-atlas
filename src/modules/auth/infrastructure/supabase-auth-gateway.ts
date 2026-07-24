import type { AppError } from '@/core/errors';
import { UnexpectedError } from '@/core/errors';
import { failure, type Result, success } from '@/core/result';
import type { AtlasSupabaseClient } from '@/infrastructure/supabase/browser-client';
import { mapAuthError } from '@/infrastructure/supabase/errors';
import type {
  AuthenticatedUser,
  AuthGateway,
  SignUpResult,
} from '@/modules/auth/application/ports';

/**
 * Supabase adapter for the `AuthGateway` port.
 *
 * All Supabase-specific knowledge in the auth module is confined to this file:
 * response shapes, error codes, and the quirks noted below.
 */
export class SupabaseAuthGateway implements AuthGateway {
  constructor(private readonly client: AtlasSupabaseClient) {}

  async signInWithPassword(
    email: string,
    password: string,
  ): Promise<Result<AuthenticatedUser, AppError>> {
    const { data, error } = await this.client.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return failure(mapAuthError(error));
    if (!data.user?.email) {
      return failure(new UnexpectedError('Sign-in returned an incomplete user.'));
    }

    return success({ id: data.user.id, email: data.user.email });
  }

  async signUpWithPassword({
    email,
    password,
    fullName,
    emailRedirectTo,
  }: {
    email: string;
    password: string;
    fullName: string;
    emailRedirectTo: string;
  }): Promise<Result<SignUpResult, AppError>> {
    const { data, error } = await this.client.auth.signUp({
      email,
      password,
      options: {
        // Read by the handle_new_user() trigger to populate the profile.
        data: { full_name: fullName },
        emailRedirectTo,
      },
    });

    if (error) return failure(mapAuthError(error));

    // When confirmations are on, Supabase returns a user with no session. It
    // deliberately returns an obfuscated user for an address that is already
    // registered rather than an error, so that the endpoint cannot be used to
    // enumerate accounts. We must not "helpfully" distinguish the two cases.
    const requiresEmailConfirmation = data.session === null;

    return success({
      user:
        data.user && data.user.email
          ? { id: data.user.id, email: data.user.email }
          : null,
      requiresEmailConfirmation,
    });
  }

  async signOut(): Promise<Result<void, AppError>> {
    // `local` scope, not the library default of `global`: signing out on a
    // laptop should not also sign the user out on their phone.
    const { error } = await this.client.auth.signOut({ scope: 'local' });

    if (error) return failure(mapAuthError(error));
    return success(undefined);
  }

  async getCurrentUser(): Promise<Result<AuthenticatedUser | null, AppError>> {
    const { data, error } = await this.client.auth.getClaims();

    if (error) return failure(mapAuthError(error));

    const claims = data?.claims;
    if (!claims?.sub) return success(null);

    const email = typeof claims.email === 'string' ? claims.email : '';
    return success({ id: claims.sub, email });
  }

  async exchangeCodeForSession(
    code: string,
  ): Promise<Result<AuthenticatedUser, AppError>> {
    const { data, error } = await this.client.auth.exchangeCodeForSession(code);

    if (error) return failure(mapAuthError(error));
    if (!data.user?.email) {
      return failure(new UnexpectedError('Code exchange returned an incomplete user.'));
    }

    return success({ id: data.user.id, email: data.user.email });
  }
}
