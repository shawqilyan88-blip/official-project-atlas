import type { TradeOpportunityDraft } from './trade-opportunity';

/**
 * The Opportunity extraction model.
 *
 * Whatever the input — an LOI, an RFQ, a purchase order, a manual wizard — the
 * result is one shape: a set of `ExtractionField`s, each with the value found
 * and a confidence in it. This is what lets Atlas "understand" an opportunity
 * identically regardless of source.
 *
 * Honesty is enforced by the type. `status` is never `extracted` unless a model
 * actually returned fields; when extraction is unavailable the result carries a
 * plain reason and zero fabricated fields. Nothing here invents a value.
 */

export type ExtractionStatus = 'extracted' | 'not_configured' | 'unsupported' | 'failed';

/** Draft keys an extracted field can be applied to. `null` = show-only (folds into notes). */
export type ApplyTarget =
  | 'product'
  | 'category'
  | 'targetMarkets'
  | 'minOrderQuantity'
  | 'targetPrice'
  | 'incoterms'
  | 'requiredCertifications'
  | 'paymentTerms'
  | 'currencies'
  | 'keywords'
  | null;

export interface ExtractionField {
  readonly key: string;
  readonly label: string;
  readonly kind: 'text' | 'list';
  readonly value: string | readonly string[];
  /** 0–1. How sure the model is about this specific value. */
  readonly confidence: number;
  readonly appliesTo: ApplyTarget;
}

export interface ExtractionResult {
  readonly status: ExtractionStatus;
  readonly fields: readonly ExtractionField[];
  /** 0–1 average across fields; 0 when nothing was extracted. */
  readonly overallConfidence: number;
  /** Labels of important fields the model did not find. */
  readonly missing: readonly string[];
  /** Honest explanation for any non-`extracted` status; shown to the user. */
  readonly message?: string;
}

/**
 * The fields Atlas tries to fill for a search-ready opportunity, in priority
 * order. `important` ones drive the "missing information" prompt; the rest are
 * captured when present but never nagged about.
 */
export const EXTRACTION_SCHEMA: readonly {
  key: string;
  label: string;
  kind: 'text' | 'list';
  appliesTo: ApplyTarget;
  important: boolean;
}[] = [
  {
    key: 'product',
    label: 'Product or service',
    kind: 'text',
    appliesTo: 'product',
    important: true,
  },
  {
    key: 'category',
    label: 'Product category',
    kind: 'text',
    appliesTo: 'category',
    important: true,
  },
  {
    key: 'targetMarkets',
    label: 'Target countries',
    kind: 'list',
    appliesTo: 'targetMarkets',
    important: true,
  },
  {
    key: 'minOrderQuantity',
    label: 'MOQ / target quantity',
    kind: 'text',
    appliesTo: 'minOrderQuantity',
    important: true,
  },
  {
    key: 'targetPrice',
    label: 'Target price',
    kind: 'text',
    appliesTo: 'targetPrice',
    important: false,
  },
  {
    key: 'incoterms',
    label: 'Incoterms',
    kind: 'list',
    appliesTo: 'incoterms',
    important: true,
  },
  {
    key: 'paymentTerms',
    label: 'Payment terms',
    kind: 'list',
    appliesTo: 'paymentTerms',
    important: true,
  },
  {
    key: 'currencies',
    label: 'Currencies',
    kind: 'list',
    appliesTo: 'currencies',
    important: false,
  },
  {
    key: 'requiredCertifications',
    label: 'Certifications',
    kind: 'list',
    appliesTo: 'requiredCertifications',
    important: true,
  },
  {
    key: 'keywords',
    label: 'Keywords',
    kind: 'list',
    appliesTo: 'keywords',
    important: false,
  },
  // Captured-but-show-only: real trade fields the model should surface even though
  // the current Opportunity schema stores them in notes rather than columns.
  { key: 'hsCodes', label: 'HS codes', kind: 'list', appliesTo: null, important: false },
  {
    key: 'specifications',
    label: 'Specifications',
    kind: 'list',
    appliesTo: null,
    important: false,
  },
  {
    key: 'packaging',
    label: 'Packaging',
    kind: 'text',
    appliesTo: null,
    important: false,
  },
  {
    key: 'leadTime',
    label: 'Lead time',
    kind: 'text',
    appliesTo: null,
    important: false,
  },
  {
    key: 'materials',
    label: 'Materials',
    kind: 'list',
    appliesTo: null,
    important: false,
  },
  {
    key: 'modelNumbers',
    label: 'Brand / model / part numbers',
    kind: 'list',
    appliesTo: null,
    important: false,
  },
  {
    key: 'compliance',
    label: 'Compliance requirements',
    kind: 'list',
    appliesTo: null,
    important: false,
  },
  {
    key: 'delivery',
    label: 'Delivery requirements',
    kind: 'text',
    appliesTo: null,
    important: false,
  },
  {
    key: 'specialNotes',
    label: 'Special notes',
    kind: 'text',
    appliesTo: null,
    important: false,
  },
];

export function extractionFieldMeta(key: string) {
  return EXTRACTION_SCHEMA.find((f) => f.key === key);
}

/** Average confidence across the extracted fields, 0 when there are none. */
export function overallConfidence(fields: readonly ExtractionField[]): number {
  if (fields.length === 0) return 0;
  const sum = fields.reduce((total, f) => total + f.confidence, 0);
  return Math.round((sum / fields.length) * 100) / 100;
}

/** Important schema fields with no extracted value — the "missing information" list. */
export function detectMissing(fields: readonly ExtractionField[]): string[] {
  const found = new Set(fields.map((f) => f.key));
  return EXTRACTION_SCHEMA.filter((f) => f.important && !found.has(f.key)).map(
    (f) => f.label,
  );
}

const asText = (v: ExtractionField['value']): string =>
  Array.isArray(v) ? v.join(', ') : String(v);
const asList = (v: ExtractionField['value']): string[] =>
  Array.isArray(v) ? [...v] : [String(v)];

/**
 * Merges the accepted extraction fields into a draft. List fields union with
 * what's already there (never clobber user input); text fields fill only when
 * empty. Show-only findings are appended to notes so nothing extracted is lost.
 */
export function mergeExtractionIntoDraft(
  draft: TradeOpportunityDraft,
  fields: readonly ExtractionField[],
): TradeOpportunityDraft {
  const next = { ...draft };
  const findings: string[] = [];

  for (const field of fields) {
    switch (field.appliesTo) {
      case 'product':
        if (!next.product?.trim()) next.product = asText(field.value);
        break;
      case 'category':
        if (!next.category?.trim()) next.category = asText(field.value);
        break;
      case 'minOrderQuantity':
        if (!next.minOrderQuantity?.trim()) next.minOrderQuantity = asText(field.value);
        break;
      case 'targetPrice':
        if (!next.targetPrice?.trim()) next.targetPrice = asText(field.value);
        break;
      case 'targetMarkets':
        next.targetMarkets = union(next.targetMarkets, asList(field.value));
        break;
      case 'incoterms':
        next.incoterms = union(next.incoterms, asList(field.value));
        break;
      case 'requiredCertifications':
        next.requiredCertifications = union(
          next.requiredCertifications,
          asList(field.value),
        );
        break;
      case 'paymentTerms':
        next.paymentTerms = union(next.paymentTerms, asList(field.value));
        break;
      case 'currencies':
        next.currencies = union(next.currencies, asList(field.value));
        break;
      case 'keywords':
        next.keywords = union(next.keywords, asList(field.value));
        break;
      case null:
        findings.push(`${field.label}: ${asText(field.value)}`);
        break;
    }
  }

  if (findings.length > 0) {
    const prefix = next.notes?.trim() ? `${next.notes.trim()}\n\n` : '';
    next.notes =
      `${prefix}From document:\n${findings.map((f) => `• ${f}`).join('\n')}`.slice(
        0,
        4000,
      );
  }

  return next;
}

function union(existing: readonly string[], incoming: readonly string[]): string[] {
  const seen = new Set(existing.map((v) => v.toLowerCase()));
  const merged = [...existing];
  for (const value of incoming) {
    if (value.trim() && !seen.has(value.toLowerCase())) {
      seen.add(value.toLowerCase());
      merged.push(value);
    }
  }
  return merged;
}
