import { z } from 'zod';

import { LOOKING_FOR, TRADE_PROFILE_LIMITS, TRADE_ROLES } from './trade-profile';

/**
 * Validation for Trade Profile input.
 *
 * The wizard serialises its state to one JSON field and posts it; this schema is
 * what turns that untrusted blob into a typed, bounded draft. The bounds mirror
 * the CHECK constraints in the 0003 migration so a violation becomes a message,
 * not a 500 — the database remains the real guarantee.
 */

const tag = z.string().trim().min(1).max(TRADE_PROFILE_LIMITS.tagMax);
const tagList = z.array(tag).max(TRADE_PROFILE_LIMITS.maxTags);

const optionalText = (max: number) => z.string().trim().max(max).optional();

export const tradeProfileInputSchema = z.object({
  products: tagList.default([]),
  industry: optionalText(TRADE_PROFILE_LIMITS.industryMax),
  roles: z.array(z.enum(TRADE_ROLES)).max(TRADE_ROLES.length).default([]),
  businessTypes: tagList.default([]),
  companySize: optionalText(TRADE_PROFILE_LIMITS.shortTextMax),
  lookingFor: z.enum(LOOKING_FOR).optional(),
  countries: tagList.default([]),
  productionCapacity: optionalText(TRADE_PROFILE_LIMITS.shortTextMax),
  moq: optionalText(TRADE_PROFILE_LIMITS.shortTextMax),
  certifications: tagList.default([]),
  languages: tagList.default([]),
  incoterms: tagList.default([]),
  paymentTerms: tagList.default([]),
  currencies: tagList.default([]),
  website: optionalText(TRADE_PROFILE_LIMITS.websiteMax),
  description: optionalText(TRADE_PROFILE_LIMITS.descriptionMax),
});

export type TradeProfileInput = z.infer<typeof tradeProfileInputSchema>;

// ---------------------------------------------------------------------------
// Document upload constraints
// ---------------------------------------------------------------------------

export const ACCEPTED_DOCUMENT_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/png',
  'image/jpeg',
  'text/plain',
] as const;

/** For the file input's `accept` attribute — friendlier than a MIME list. */
export const ACCEPTED_DOCUMENT_EXTENSIONS =
  '.pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt';

export const MAX_DOCUMENT_SIZE_BYTES = 15 * 1024 * 1024;
export const MAX_DOCUMENT_SIZE_LABEL = '15 MB';

export interface DocumentRejection {
  readonly reason: 'type' | 'size' | 'empty';
  readonly message: string;
}

/** Guards a file before it is uploaded. Returns null when the file is allowed. */
export function rejectDocument(file: {
  type: string;
  size: number;
}): DocumentRejection | null {
  if (file.size === 0) {
    return { reason: 'empty', message: 'That file looks empty.' };
  }
  if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
    return {
      reason: 'size',
      message: `Keep files under ${MAX_DOCUMENT_SIZE_LABEL}.`,
    };
  }
  if (!ACCEPTED_DOCUMENT_MIME_TYPES.includes(file.type as never)) {
    return {
      reason: 'type',
      message: 'Upload a PDF, Word, Excel, image, or text document.',
    };
  }
  return null;
}
