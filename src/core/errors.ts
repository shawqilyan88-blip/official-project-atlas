/**
 * The domain's error vocabulary.
 *
 * Two rules govern everything here:
 *
 * 1. Errors carry a stable machine-readable `code`. UI and logs branch on the
 *    code, never on a human-readable string, so copy can change freely.
 * 2. `message` is safe to render to an end user. Anything sensitive — a driver
 *    error, a failed query, a stack trace — goes in `cause`, which is logged
 *    server-side and never serialised to the client. This is what keeps an
 *    internal failure from leaking database structure to an attacker.
 */

export const ErrorCode = {
  /** Input failed validation before any work was attempted. */
  Validation: 'VALIDATION_ERROR',
  /** No valid session; the caller must authenticate. */
  Unauthenticated: 'UNAUTHENTICATED',
  /** Authenticated, but not permitted to perform this action. */
  Forbidden: 'FORBIDDEN',
  /** The requested resource does not exist, or is invisible to this tenant. */
  NotFound: 'NOT_FOUND',
  /** The action collides with existing state (duplicate email, taken slug). */
  Conflict: 'CONFLICT',
  /** The caller is being rate limited. */
  RateLimited: 'RATE_LIMITED',
  /** A dependency failed: database, auth provider, third-party API. */
  Infrastructure: 'INFRASTRUCTURE_ERROR',
  /** A case the code did not anticipate. */
  Unexpected: 'UNEXPECTED_ERROR',
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

/** Field-level validation problems, keyed by form field name. */
export type FieldErrors = Readonly<Record<string, readonly string[]>>;

export abstract class AppError extends Error {
  abstract readonly code: ErrorCode;

  /** Suggested HTTP status when this error crosses a transport boundary. */
  abstract readonly httpStatus: number;

  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options as ErrorOptions | undefined);
    this.name = new.target.name;
    // Preserve a useful stack across the transpiled class hierarchy.
    Error.captureStackTrace?.(this, new.target);
  }

  /** The client-safe shape. Deliberately omits `cause` and the stack. */
  toJSON(): { code: ErrorCode; message: string } {
    return { code: this.code, message: this.message };
  }
}

export class ValidationError extends AppError {
  override readonly code = ErrorCode.Validation;
  override readonly httpStatus = 422;
  readonly fieldErrors: FieldErrors;

  constructor(
    message = 'Please check the highlighted fields and try again.',
    fieldErrors: FieldErrors = {},
    options?: { cause?: unknown },
  ) {
    super(message, options);
    this.fieldErrors = fieldErrors;
  }
}

export class UnauthenticatedError extends AppError {
  override readonly code = ErrorCode.Unauthenticated;
  override readonly httpStatus = 401;

  constructor(
    message = 'You need to sign in to continue.',
    options?: { cause?: unknown },
  ) {
    super(message, options);
  }
}

export class ForbiddenError extends AppError {
  override readonly code = ErrorCode.Forbidden;
  override readonly httpStatus = 403;

  constructor(
    message = "You don't have permission to do that.",
    options?: { cause?: unknown },
  ) {
    super(message, options);
  }
}

export class NotFoundError extends AppError {
  override readonly code = ErrorCode.NotFound;
  override readonly httpStatus = 404;

  constructor(
    message = 'We could not find what you were looking for.',
    options?: { cause?: unknown },
  ) {
    super(message, options);
  }
}

export class ConflictError extends AppError {
  override readonly code = ErrorCode.Conflict;
  override readonly httpStatus = 409;

  constructor(
    message = 'That conflicts with something that already exists.',
    options?: { cause?: unknown },
  ) {
    super(message, options);
  }
}

export class RateLimitError extends AppError {
  override readonly code = ErrorCode.RateLimited;
  override readonly httpStatus = 429;

  constructor(
    message = 'Too many attempts. Please wait a moment and try again.',
    options?: { cause?: unknown },
  ) {
    super(message, options);
  }
}

/**
 * A dependency failed. The public message is deliberately vague; the real
 * detail travels in `cause` for server-side logging only.
 */
export class InfrastructureError extends AppError {
  override readonly code = ErrorCode.Infrastructure;
  override readonly httpStatus = 502;

  constructor(
    message = 'Something went wrong on our side. Please try again.',
    options?: { cause?: unknown },
  ) {
    super(message, options);
  }
}

export class UnexpectedError extends AppError {
  override readonly code = ErrorCode.Unexpected;
  override readonly httpStatus = 500;

  constructor(
    message = 'Something went wrong. Please try again.',
    options?: { cause?: unknown },
  ) {
    super(message, options);
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Normalises anything thrown into an `AppError`, so that a `catch` block can
 * never accidentally surface a raw driver error to a user.
 */
export function toAppError(error: unknown): AppError {
  if (isAppError(error)) return error;
  return new UnexpectedError(undefined, { cause: error });
}
