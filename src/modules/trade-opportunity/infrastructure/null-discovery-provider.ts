import { type Result, success } from '@/core/result';

import type { DiscoveryProviderResult, DiscoveryQuery } from '../domain/discovery';
import type { DiscoveryProvider } from '../application/ports';

/**
 * The placeholder provider used until a real data source is connected.
 *
 * It is deliberately honest: it returns `not_configured` with **zero**
 * candidates. It never invents companies. Wiring a production provider is a
 * matter of writing another `DiscoveryProvider` and adding it to the container's
 * provider array — this one can stay or be removed with no other change.
 */
export class NullDiscoveryProvider implements DiscoveryProvider {
  readonly name = 'none';

  async discover(
    _query: DiscoveryQuery,
  ): Promise<Result<DiscoveryProviderResult, never>> {
    const result: DiscoveryProviderResult = {
      provider: this.name,
      status: 'not_configured',
      candidates: [],
      message: 'No discovery data provider is connected.',
    };
    return success(result);
  }
}
