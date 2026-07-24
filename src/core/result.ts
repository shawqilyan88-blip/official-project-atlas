/**
 * A `Result` makes failure an ordinary, typed return value rather than a
 * control-flow exception.
 *
 * Use-cases in the application layer return `Result` so that callers are forced
 * by the compiler to consider the failure branch. Exceptions remain reserved for
 * genuinely exceptional conditions — a broken invariant, a lost connection —
 * not for expected outcomes such as "that email is already registered".
 *
 * @example
 * const result = await signIn(input);
 * if (isFailure(result)) return { error: result.error.message };
 * redirect(routes.dashboard);
 */

export type Success<T> = { readonly ok: true; readonly value: T };
export type Failure<E> = { readonly ok: false; readonly error: E };

export type Result<T, E> = Success<T> | Failure<E>;

/** Wraps a value as a successful result. */
export function success<T>(value: T): Success<T> {
  return { ok: true, value };
}

/** Wraps an error as a failed result. */
export function failure<E>(error: E): Failure<E> {
  return { ok: false, error };
}

/** Narrows a result to its success branch. */
export function isSuccess<T, E>(result: Result<T, E>): result is Success<T> {
  return result.ok;
}

/** Narrows a result to its failure branch. */
export function isFailure<T, E>(result: Result<T, E>): result is Failure<E> {
  return !result.ok;
}

/** Transforms the value of a successful result, leaving a failure untouched. */
export function mapResult<T, U, E>(
  result: Result<T, E>,
  transform: (value: T) => U,
): Result<U, E> {
  return result.ok ? success(transform(result.value)) : result;
}

/**
 * Unwraps a successful value or throws. Reserved for call sites that have
 * already proven success — never use it to skip handling a failure branch.
 */
export function unwrapOrThrow<T, E>(result: Result<T, E>): T {
  if (result.ok) return result.value;
  throw result.error instanceof Error ? result.error : new Error(String(result.error));
}
