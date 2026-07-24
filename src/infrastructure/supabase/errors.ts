import type { AuthError, PostgrestError } from '@supabase/supabase-js';

import {
  type AppError,
  ConflictError,
  ForbiddenError,
  InfrastructureError,
  NotFoundError,
  RateLimitError,
  UnauthenticatedError,
  ValidationError,
} from '@/core/errors';

/**
 * Translates vendor errors into the domain's error vocabulary.
 *
 * This is the boundary where Supabase stops existing as far as the rest of the
 * application is concerned. It also serves a security purpose: raw driver
 * messages name tables, columns, and constraints, which is free reconnaissance
 * for an attacker. Nothing here forwards a database string to the user — the
 * original travels in `cause` for server-side logs only.
 */

/** PostgreSQL error codes, per the standard SQLSTATE catalogue. */
const PgError = {
  UniqueViolation: '23505',
  ForeignKeyViolation: '23503',
  CheckViolation: '23514',
  NotNullViolation: '23502',
  InsufficientPrivilege: '42501',
  /** PostgREST: a filter matched no rows where exactly one was required. */
  NoRowsReturned: 'PGRST116',
  /** PostgREST: RLS rejected the write. */
  RlsViolation: '42501',
} as const;

export function mapPostgrestError(error: PostgrestError): AppError {
  switch (error.code) {
    case PgError.UniqueViolation:
      return new ConflictError('That already exists. Please choose a different value.', {
        cause: error,
      });

    case PgError.ForeignKeyViolation:
      return new ValidationError(
        'That referenced record no longer exists.',
        {},
        { cause: error },
      );

    case PgError.CheckViolation:
      return new ValidationError(
        'Some of those details are not valid. Please review and try again.',
        {},
        { cause: error },
      );

    case PgError.NotNullViolation:
      return new ValidationError('A required field was missing.', {}, { cause: error });

    case PgError.InsufficientPrivilege:
      // Also covers an RLS policy rejecting the statement.
      return new ForbiddenError(undefined, { cause: error });

    case PgError.NoRowsReturned:
      return new NotFoundError(undefined, { cause: error });

    default:
      return new InfrastructureError(undefined, { cause: error });
  }
}

/**
 * Maps Supabase auth failures.
 *
 * Sign-in failures deliberately collapse to one generic message. Telling a
 * visitor whether an address is registered turns the login form into a free
 * account-enumeration oracle.
 */
export function mapAuthError(error: AuthError): AppError {
  const status = error.status ?? 0;
  const code = error.code ?? '';

  if (code === 'invalid_credentials' || status === 400) {
    return new ValidationError(
      'That email and password combination is not correct.',
      {},
      { cause: error },
    );
  }

  if (code === 'email_not_confirmed') {
    return new ValidationError(
      'Please confirm your email address before signing in. Check your inbox for the link.',
      {},
      { cause: error },
    );
  }

  if (code === 'user_already_exists' || code === 'email_exists') {
    return new ConflictError('An account with that email already exists.', {
      cause: error,
    });
  }

  if (code === 'weak_password') {
    return new ValidationError(
      'That password is too weak. Use a longer mix of letters and numbers.',
      {},
      { cause: error },
    );
  }

  if (code === 'over_request_rate_limit' || status === 429) {
    return new RateLimitError(undefined, { cause: error });
  }

  if (status === 401 || status === 403) {
    return new UnauthenticatedError(undefined, { cause: error });
  }

  return new InfrastructureError(
    'We could not complete that request. Please try again.',
    { cause: error },
  );
}

/**
 * Structural checks rather than `instanceof`: these objects arrive as plain
 * JSON across the network boundary and are not real class instances.
 */
export function isPostgrestError(error: unknown): error is PostgrestError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    'details' in error
  );
}

export function isAuthError(error: unknown): error is AuthError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    typeof (error as { name: unknown }).name === 'string' &&
    (error as { name: string }).name.startsWith('Auth')
  );
}
