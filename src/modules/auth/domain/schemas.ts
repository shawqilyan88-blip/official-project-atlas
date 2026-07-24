import { z } from 'zod';

import { FULL_NAME_MAX_LENGTH } from '@/core/entities';

/**
 * Validation for the authentication boundary.
 *
 * These schemas are the *server's* contract. The same schema also drives the
 * client form, which is a usability nicety — but nothing here is trusted from
 * the browser. Every Server Action re-parses the raw payload before touching
 * a dependency.
 */

/** Matches the `min_password_length` in supabase/config.toml. Both must move together. */
export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_LENGTH = 72; // bcrypt truncates beyond this.

export const emailSchema = z
  .email({ error: 'Enter a valid email address.' })
  .max(254, { error: 'That email address is too long.' })
  .transform((value) => value.trim().toLowerCase());

/**
 * Length carries most of the real entropy, so it is weighted over exotic
 * character rules. The composition requirement is kept deliberately mild: rules
 * that are harsh push people toward predictable substitutions (`Password1!`)
 * and password reuse, which is a net loss.
 */
export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, {
    error: `Use at least ${PASSWORD_MIN_LENGTH} characters.`,
  })
  .max(PASSWORD_MAX_LENGTH, {
    error: `Keep it under ${PASSWORD_MAX_LENGTH} characters.`,
  })
  .refine((value) => /[a-z]/.test(value) && /[A-Z]/.test(value), {
    error: 'Include both uppercase and lowercase letters.',
  })
  .refine((value) => /\d/.test(value), {
    error: 'Include at least one number.',
  });

export const fullNameSchema = z
  .string()
  .trim()
  .min(1, { error: 'Enter your name.' })
  .max(FULL_NAME_MAX_LENGTH, {
    error: `Keep your name under ${FULL_NAME_MAX_LENGTH} characters.`,
  });

export const signInSchema = z.object({
  email: emailSchema,
  // Sign-in only checks that something was typed. Applying the full policy here
  // would leak the policy to an attacker probing old accounts, and would lock
  // out users whose password predates a policy change.
  password: z.string().min(1, { error: 'Enter your password.' }),
  redirectTo: z.string().optional(),
});

export const signUpSchema = z.object({
  fullName: fullNameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
