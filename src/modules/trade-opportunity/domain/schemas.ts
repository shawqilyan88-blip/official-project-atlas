import { z } from 'zod';

import { OPPORTUNITY_LIMITS, TRADE_OBJECTIVES } from './trade-opportunity';

/**
 * Validation for opportunity input.
 *
 * The editor serialises its state to one JSON field and posts it. Only the
 * objective is truly structural; everything else is bounded but optional here,
 * because "save as draft" must accept a half-finished opportunity. The stronger
 * "ready to activate" rule (a product is needed to search) lives in the action,
 * where the target status is known.
 */
const tag = z.string().trim().min(1).max(OPPORTUNITY_LIMITS.tagMax);
const tagList = z.array(tag).max(OPPORTUNITY_LIMITS.maxTags);
const optionalText = (max: number) => z.string().trim().max(max).optional();

export const opportunityInputSchema = z.object({
  name: optionalText(OPPORTUNITY_LIMITS.nameMax),
  objective: z.enum(TRADE_OBJECTIVES).default('find_buyers'),
  product: optionalText(OPPORTUNITY_LIMITS.productMax),
  category: optionalText(OPPORTUNITY_LIMITS.categoryMax),
  targetMarkets: tagList.default([]),
  minOrderQuantity: optionalText(OPPORTUNITY_LIMITS.shortTextMax),
  targetPrice: optionalText(OPPORTUNITY_LIMITS.shortTextMax),
  incoterms: tagList.default([]),
  requiredCertifications: tagList.default([]),
  paymentTerms: tagList.default([]),
  currencies: tagList.default([]),
  keywords: tagList.default([]),
  excludeKeywords: tagList.default([]),
  criteria: optionalText(OPPORTUNITY_LIMITS.criteriaMax),
  notes: optionalText(OPPORTUNITY_LIMITS.notesMax),
});

export type OpportunityInput = z.infer<typeof opportunityInputSchema>;
