import { OrganizationId } from '@/core/entities';
import type {
  TradeProfileDocumentRow,
  TradeProfileRow,
} from '@/infrastructure/supabase/database.types';

import type { TradeProfile, TradeProfileDocument } from '../domain/trade-profile';

/**
 * Row-to-entity mappers for the Trade Profile module.
 *
 * The database uses snake_case and Postgres arrays; the domain uses camelCase
 * and readonly types. The row's enum columns are already the exact string
 * unions the domain declares, so the casts here are documentation, not coercion.
 */

export function toTradeProfile(row: TradeProfileRow): TradeProfile {
  return {
    organizationId: OrganizationId(row.organization_id),
    products: row.products,
    industry: row.industry,
    roles: row.roles,
    businessTypes: row.business_types,
    companySize: row.company_size,
    lookingFor: row.looking_for,
    countries: row.countries,
    productionCapacity: row.production_capacity,
    moq: row.moq,
    certifications: row.certifications,
    languages: row.languages,
    incoterms: row.incoterms,
    paymentTerms: row.payment_terms,
    currencies: row.currencies,
    website: row.website,
    description: row.description,
    completedAt: row.completed_at,
    skippedAt: row.skipped_at,
  };
}

export function toTradeProfileDocument(
  row: TradeProfileDocumentRow,
): TradeProfileDocument {
  return {
    id: row.id,
    fileName: row.file_name,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes,
    status: row.status,
    createdAt: row.created_at,
  };
}
