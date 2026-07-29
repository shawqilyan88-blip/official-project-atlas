import 'server-only';

import { createServerSupabaseClient } from '@/infrastructure/supabase/server-client';
import type { AuthGateway } from '@/modules/auth/application/ports';
import { SupabaseAuthGateway } from '@/modules/auth/infrastructure/supabase-auth-gateway';
import type {
  ActiveOrganizationStore,
  TenancyRepository,
} from '@/modules/tenancy/application/ports';
import { CookieActiveOrganizationStore } from '@/modules/tenancy/infrastructure/active-organization-cookie';
import { SupabaseTenancyRepository } from '@/modules/tenancy/infrastructure/supabase-tenancy-repository';
import type { PersonalizationStore } from '@/modules/personalization/application/ports';
import { CookiePersonalizationStore } from '@/modules/personalization/infrastructure/cookie-personalization-store';
import type {
  TradeDocumentStorage,
  TradeProfileRepository,
} from '@/modules/trade-profile/application/ports';
import { SupabaseTradeDocumentStorage } from '@/modules/trade-profile/infrastructure/supabase-trade-document-storage';
import { SupabaseTradeProfileRepository } from '@/modules/trade-profile/infrastructure/supabase-trade-profile-repository';
import type {
  CompanyRanker,
  DiscoveryProvider,
  DocumentExtractor,
  MessageDrafter,
  OpportunityCompanyRepository,
  OpportunityDocumentRepository,
  OpportunityDocumentStorage,
  OpportunityMessageRepository,
  OpportunityTimelineRepository,
  OutreachAuditLog,
  OutreachChannel,
  TradeOpportunityRepository,
} from '@/modules/trade-opportunity/application/ports';
import { AnthropicCompanyRanker } from '@/modules/trade-opportunity/infrastructure/anthropic-company-ranker';
import { AnthropicDocumentExtractor } from '@/modules/trade-opportunity/infrastructure/anthropic-document-extractor';
import { AnthropicMessageDrafter } from '@/modules/trade-opportunity/infrastructure/anthropic-message-drafter';
import { NullDiscoveryProvider } from '@/modules/trade-opportunity/infrastructure/null-discovery-provider';
import { NullOutreachChannel } from '@/modules/trade-opportunity/infrastructure/null-outreach-channel';
import { SupabaseOpportunityCompanyRepository } from '@/modules/trade-opportunity/infrastructure/supabase-opportunity-company-repository';
import { SupabaseOpportunityMessageRepository } from '@/modules/trade-opportunity/infrastructure/supabase-opportunity-message-repository';
import { SupabaseOutreachAuditLog } from '@/modules/trade-opportunity/infrastructure/supabase-outreach-audit-log';
import { SupabaseOpportunityDocumentRepository } from '@/modules/trade-opportunity/infrastructure/supabase-opportunity-document-repository';
import { SupabaseOpportunityDocumentStorage } from '@/modules/trade-opportunity/infrastructure/supabase-opportunity-document-storage';
import { SupabaseOpportunityTimelineRepository } from '@/modules/trade-opportunity/infrastructure/supabase-opportunity-timeline-repository';
import { SupabaseTradeOpportunityRepository } from '@/modules/trade-opportunity/infrastructure/supabase-trade-opportunity-repository';

/**
 * The composition root.
 *
 * This is the only module that knows both the ports and their Supabase
 * implementations. Everything else depends on interfaces, which is what keeps
 * the dependency arrows pointing inward — and what makes a use-case testable
 * by handing it a fake instead of standing up a database.
 *
 * Built per request, never cached: the underlying Supabase client carries the
 * caller's session cookies, so a shared container would leak one user's
 * identity into another user's request.
 */
export interface ServerContainer {
  readonly auth: AuthGateway;
  readonly tenancy: TenancyRepository;
  readonly activeOrganization: ActiveOrganizationStore;
  readonly personalization: PersonalizationStore;
  readonly tradeProfile: TradeProfileRepository;
  readonly tradeDocuments: TradeDocumentStorage;
  readonly tradeOpportunities: TradeOpportunityRepository;
  readonly documentExtractor: DocumentExtractor;
  readonly opportunityDocuments: OpportunityDocumentRepository;
  readonly opportunityDocumentStorage: OpportunityDocumentStorage;
  readonly opportunityTimeline: OpportunityTimelineRepository;
  /**
   * Discovery providers, queried together. One today (the honest placeholder);
   * adding a production data source is a new adapter pushed into this array — no
   * other code changes.
   */
  readonly discoveryProviders: readonly DiscoveryProvider[];
  readonly companyRanker: CompanyRanker;
  readonly opportunityCompanies: OpportunityCompanyRepository;
  readonly messageDrafter: MessageDrafter;
  /** Messaging channels — one today (the placeholder); add adapters here. */
  readonly outreachChannels: readonly OutreachChannel[];
  readonly opportunityMessages: OpportunityMessageRepository;
  readonly outreachAuditLog: OutreachAuditLog;
}

export async function createServerContainer(): Promise<ServerContainer> {
  const client = await createServerSupabaseClient();

  return {
    auth: new SupabaseAuthGateway(client),
    tenancy: new SupabaseTenancyRepository(client),
    activeOrganization: new CookieActiveOrganizationStore(),
    personalization: new CookiePersonalizationStore(),
    tradeProfile: new SupabaseTradeProfileRepository(client),
    tradeDocuments: new SupabaseTradeDocumentStorage(client),
    tradeOpportunities: new SupabaseTradeOpportunityRepository(client),
    documentExtractor: new AnthropicDocumentExtractor(),
    opportunityDocuments: new SupabaseOpportunityDocumentRepository(client),
    opportunityDocumentStorage: new SupabaseOpportunityDocumentStorage(client),
    opportunityTimeline: new SupabaseOpportunityTimelineRepository(client),
    // The provider array is the multi-provider seam: add adapters here.
    discoveryProviders: [new NullDiscoveryProvider()],
    companyRanker: new AnthropicCompanyRanker(),
    opportunityCompanies: new SupabaseOpportunityCompanyRepository(client),
    messageDrafter: new AnthropicMessageDrafter(),
    // The channel array is the multi-channel seam: add adapters here.
    outreachChannels: [new NullOutreachChannel()],
    opportunityMessages: new SupabaseOpportunityMessageRepository(client),
    outreachAuditLog: new SupabaseOutreachAuditLog(client),
  };
}
