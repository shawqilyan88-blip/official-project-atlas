import { z } from 'zod';

import {
  FULL_NAME_MAX_LENGTH,
  ORGANIZATION_NAME_MAX_LENGTH,
  ORGANIZATION_NAME_MIN_LENGTH,
  ORGANIZATION_SLUG_MAX_LENGTH,
  ORGANIZATION_SLUG_MIN_LENGTH,
  ORGANIZATION_SLUG_PATTERN,
  isReservedSlug,
} from '@/core/entities';

/**
 * Validation for tenant-facing input.
 *
 * These constraints intentionally mirror the CHECK constraints in
 * `supabase/migrations/…_initial_schema.sql`. The duplication is deliberate:
 * the database guarantee is what actually protects the data, while this layer
 * exists to turn a violation into a helpful message on the right field instead
 * of a 500. If one changes, change both.
 */

export const organizationNameSchema = z
  .string()
  .trim()
  .min(ORGANIZATION_NAME_MIN_LENGTH, {
    error: `Use at least ${ORGANIZATION_NAME_MIN_LENGTH} characters.`,
  })
  .max(ORGANIZATION_NAME_MAX_LENGTH, {
    error: `Keep it under ${ORGANIZATION_NAME_MAX_LENGTH} characters.`,
  });

export const organizationSlugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(ORGANIZATION_SLUG_MIN_LENGTH, {
    error: `Use at least ${ORGANIZATION_SLUG_MIN_LENGTH} characters.`,
  })
  .max(ORGANIZATION_SLUG_MAX_LENGTH, {
    error: `Keep it under ${ORGANIZATION_SLUG_MAX_LENGTH} characters.`,
  })
  .regex(ORGANIZATION_SLUG_PATTERN, {
    error: 'Use lowercase letters, numbers, and single hyphens only.',
  })
  .refine((slug) => !isReservedSlug(slug), {
    error: 'That workspace address is reserved. Please choose another.',
  });

export const createOrganizationSchema = z.object({
  name: organizationNameSchema,
  slug: organizationSlugSchema,
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;

export const switchOrganizationSchema = z.object({
  organizationId: z.uuid({ error: 'That workspace reference is not valid.' }),
});

export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, { error: 'Enter your name.' })
    // Mirrors the profiles_full_name_length CHECK constraint. Without this the
    // database would reject the write with an opaque error instead of a
    // message attached to the field.
    .max(FULL_NAME_MAX_LENGTH, {
      error: `Keep your name under ${FULL_NAME_MAX_LENGTH} characters.`,
    }),
});
