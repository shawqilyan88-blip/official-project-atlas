import {
  type BusinessMetric,
  composeBusinessPulse,
  EMPTY_TRADE_SNAPSHOT,
} from '../domain/business-pulse';

/**
 * Resolves the Business Pulse metrics for the current workspace.
 *
 * The trade modules — buyer discovery, supplier sourcing, conversations, and
 * deals — are not live yet, so there is no repository to read. We pass the empty
 * snapshot deliberately: the cards render their pre-activation state rather than
 * inventing numbers, which is the same honesty the rest of the dashboard keeps.
 *
 * When those repositories land, this function gains their reads and builds a
 * populated `TradeSnapshot` here; the domain composer and the UI do not change.
 */
export function resolveBusinessPulse(): readonly BusinessMetric[] {
  return composeBusinessPulse(EMPTY_TRADE_SNAPSHOT);
}
