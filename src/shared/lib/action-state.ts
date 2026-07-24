import { z } from 'zod';

import { type AppError, ValidationError, isAppError } from '@/core/errors';

/**
 * The contract every Server Action returns, and every form consumes through
 * `useActionState`.
 *
 * One shape for all forms means the error rendering is written once. Field
 * errors and form-level errors are kept apart because they belong in different
 * places on screen: beside the offending input, or above the submit button.
 */
export type ActionState<TData = undefined> =
  | { readonly status: 'idle' }
  | {
      readonly status: 'error';
      readonly message: string;
      readonly fieldErrors?: Readonly<Record<string, readonly string[]>>;
    }
  | { readonly status: 'success'; readonly data: TData };

export const idleState: ActionState<never> = { status: 'idle' };

export function errorState(
  message: string,
  fieldErrors?: Readonly<Record<string, readonly string[]>>,
): ActionState<never> {
  return fieldErrors
    ? { status: 'error', message, fieldErrors }
    : { status: 'error', message };
}

export function successState<TData>(data: TData): ActionState<TData> {
  return { status: 'success', data };
}

/**
 * Converts a Zod failure into field errors the form can render inline.
 */
export function validationErrorState(error: z.ZodError): ActionState<never> {
  const flattened = z.flattenError(error);

  return errorState(
    flattened.formErrors[0] ?? 'Please check the highlighted fields and try again.',
    flattened.fieldErrors as Readonly<Record<string, readonly string[]>>,
  );
}

/**
 * Renders a domain error as an action result.
 *
 * Only `AppError` messages reach the user — they are written to be read. Any
 * other thrown value is logged server-side and replaced with a generic
 * message, because an unexpected exception's text routinely contains stack
 * traces, query fragments, or connection strings.
 */
export function toActionState(error: unknown): ActionState<never> {
  if (isAppError(error)) return fromAppError(error);

  console.error('[action] Unhandled error', error);
  return errorState('Something went wrong. Please try again.');
}

export function fromAppError(error: AppError): ActionState<never> {
  if (error instanceof ValidationError && Object.keys(error.fieldErrors).length > 0) {
    return errorState(error.message, error.fieldErrors);
  }
  return errorState(error.message);
}
