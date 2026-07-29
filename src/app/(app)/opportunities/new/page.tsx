import type { Metadata } from 'next';

import { isSuccess } from '@/core/result';
import type { LookingFor } from '@/modules/trade-profile/domain/trade-profile';
import {
  type InheritedDefaults,
  newOpportunityDraft,
  type TradeObjective,
} from '@/modules/trade-opportunity/domain/trade-opportunity';
import { createServerContainer } from '@/server/container';
import { requireTenantContext } from '@/server/session';

import type { DuplicableOpportunity } from '../_components/duplicate-picker';
import { NewOpportunityFlow } from '../_components/new-opportunity-flow';

export const metadata: Metadata = {
  title: 'New opportunity',
};

export const dynamic = 'force-dynamic';

/** Maps the company profile's trade direction to an opportunity objective. */
function objectiveFrom(lookingFor: LookingFor | null): TradeObjective {
  return lookingFor === 'suppliers'
    ? 'find_suppliers'
    : lookingFor === 'both'
      ? 'both'
      : 'find_buyers';
}

/**
 * Create a new opportunity.
 *
 * The server resolves everything the flow needs — the pre-filled base draft
 * (from the latest opportunity, else the Company Profile) and the list of
 * existing opportunities to duplicate — then hands off to the client flow that
 * asks direction first and method second.
 */
export default async function NewOpportunityPage() {
  const context = await requireTenantContext();
  const { tradeProfile, tradeOpportunities } = await createServerContainer();

  const [profileResult, listResult] = await Promise.all([
    tradeProfile.findByOrganization(context.organization.id),
    tradeOpportunities.list(context.organization.id),
  ]);

  const profile = isSuccess(profileResult) ? profileResult.value : null;
  const all = isSuccess(listResult) ? listResult.value : [];
  const latest = all[0] ?? null;

  const defaults: InheritedDefaults = latest
    ? {
        objective: latest.objective,
        category: latest.category,
        targetMarkets: latest.targetMarkets,
        requiredCertifications: latest.requiredCertifications,
        incoterms: latest.incoterms,
        paymentTerms: latest.paymentTerms,
        currencies: latest.currencies,
      }
    : {
        objective: objectiveFrom(profile?.lookingFor ?? null),
        category: profile?.industry ?? null,
        targetMarkets: profile?.countries ?? [],
        requiredCertifications: profile?.certifications ?? [],
        incoterms: profile?.incoterms ?? [],
        paymentTerms: profile?.paymentTerms ?? [],
        currencies: profile?.currencies ?? [],
      };

  const existing: DuplicableOpportunity[] = all
    .filter((opportunity) => opportunity.status !== 'archived')
    .map((opportunity) => ({
      id: opportunity.id,
      name: opportunity.name,
      objective: opportunity.objective,
      product: opportunity.product,
    }));

  return (
    <NewOpportunityFlow
      baseDraft={newOpportunityDraft(defaults)}
      inheritedMarkets={defaults.targetMarkets ?? []}
      existing={existing}
    />
  );
}
