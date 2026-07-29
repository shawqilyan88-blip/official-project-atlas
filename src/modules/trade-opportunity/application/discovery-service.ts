import { isSuccess } from '@/core/result';

import {
  aggregateStatus,
  type DiscoveryOutcome,
  type DiscoveryProviderResult,
  type DiscoveryQuery,
  mergeCandidates,
} from '../domain/discovery';
import type { DiscoveryProvider } from './ports';

/**
 * Runs discovery across one or many providers.
 *
 * This is the multi-provider seam. Providers are queried **in parallel**
 * (`Promise.all`), their normalised candidates are **merged and de-duplicated**
 * into a single list, and their statuses are aggregated. It works identically
 * whether the array holds one provider or ten — adding a source is just another
 * element in `providers`, no change here.
 *
 * A provider that errors is downgraded to a `failed` result for that provider
 * only; it never takes down the others.
 */
export async function runDiscoveryProviders(
  providers: readonly DiscoveryProvider[],
  query: DiscoveryQuery,
): Promise<DiscoveryOutcome> {
  const results: DiscoveryProviderResult[] = await Promise.all(
    providers.map(async (provider) => {
      const result = await provider.discover(query);
      if (isSuccess(result)) return result.value;
      return {
        provider: provider.name,
        status: 'failed' as const,
        candidates: [],
        message: result.error.message,
      };
    }),
  );

  const status = aggregateStatus(results);
  const message =
    status === 'not_configured'
      ? 'No discovery provider is connected yet. The engine is ready — connect a provider to surface real buyers and suppliers.'
      : status === 'failed'
        ? (results.find((r) => r.status === 'failed')?.message ??
          'Discovery could not run.')
        : undefined;

  return {
    status,
    candidates: mergeCandidates(results),
    providerResults: results,
    message,
  };
}
