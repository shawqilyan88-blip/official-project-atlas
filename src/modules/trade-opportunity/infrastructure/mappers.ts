import { OrganizationId } from '@/core/entities';
import type { TradeOpportunityRow } from '@/infrastructure/supabase/database.types';

import type { TradeOpportunity } from '../domain/trade-opportunity';

/** Row-to-entity mapper: snake_case + Postgres arrays to the domain's shape. */
export function toTradeOpportunity(row: TradeOpportunityRow): TradeOpportunity {
  return {
    id: row.id,
    organizationId: OrganizationId(row.organization_id),
    name: row.name,
    objective: row.objective,
    product: row.product,
    category: row.category,
    targetMarkets: row.target_markets,
    minOrderQuantity: row.min_order_quantity,
    targetPrice: row.target_price,
    incoterms: row.incoterms,
    requiredCertifications: row.required_certifications,
    paymentTerms: row.payment_terms,
    currencies: row.currencies,
    keywords: row.keywords,
    excludeKeywords: row.exclude_keywords,
    criteria: row.criteria,
    notes: row.notes,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    archivedAt: row.archived_at,
    lastOpenedAt: row.last_opened_at,
  };
}
