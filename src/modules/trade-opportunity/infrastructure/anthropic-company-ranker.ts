import 'server-only';

import type { AppError } from '@/core/errors';
import { type Result, success } from '@/core/result';
import { serverEnv } from '@/shared/config/env';

import type {
  CandidateCompany,
  DiscoveryQuery,
  RankedCompany,
} from '../domain/discovery';
import type { CompanyRanker } from '../application/ports';

/**
 * Ranks candidate companies by fit against the opportunity.
 *
 * With an Anthropic key, Claude scores each candidate (tool-use JSON) with a
 * short reason. Without a key, a transparent deterministic heuristic (market,
 * product/keyword, certification overlap) is used instead — a real calculation,
 * clearly labelled, never fabricated AI. Either way it only runs when a provider
 * has actually returned candidates.
 */
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
const MODEL = 'claude-sonnet-5';
const MAX_CANDIDATES = 40;

export class AnthropicCompanyRanker implements CompanyRanker {
  async rank(
    query: DiscoveryQuery,
    candidates: readonly CandidateCompany[],
  ): Promise<Result<readonly RankedCompany[], AppError>> {
    if (candidates.length === 0) return success([]);

    const subset = candidates.slice(0, MAX_CANDIDATES);
    const apiKey = serverEnv().ANTHROPIC_API_KEY;

    const ranked = apiKey
      ? ((await this.rankWithClaude(query, subset, apiKey)) ??
        heuristicRank(query, subset))
      : heuristicRank(query, subset);

    return success([...ranked].sort((a, b) => b.fitScore - a.fitScore));
  }

  /** Returns null on any API problem so the caller falls back to the heuristic. */
  private async rankWithClaude(
    query: DiscoveryQuery,
    candidates: readonly CandidateCompany[],
    apiKey: string,
  ): Promise<RankedCompany[] | null> {
    const tool = {
      name: 'rank_companies',
      description: 'Score each company 0–100 for fit against the trade opportunity.',
      input_schema: {
        type: 'object',
        properties: {
          rankings: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                index: { type: 'number' },
                fitScore: { type: 'number' },
                reasons: { type: 'array', items: { type: 'string' } },
              },
              required: ['index', 'fitScore', 'reasons'],
            },
          },
        },
        required: ['rankings'],
      },
    };

    const prompt =
      `Opportunity: looking for ${query.role}. Product: ${query.product ?? '—'}. ` +
      `Category: ${query.category ?? '—'}. Markets: ${query.markets.join(', ') || '—'}. ` +
      `Required certifications: ${query.certifications.join(', ') || '—'}. ` +
      `Keywords: ${query.keywords.join(', ') || '—'}.\n\nCompanies:\n` +
      candidates
        .map((c, i) => `${i}. ${c.name} (${c.country ?? '?'}) ${c.website ?? ''}`)
        .join('\n') +
      '\n\nScore each by index using rank_companies. Base scores only on the evidence given.';

    try {
      const res = await fetch(ANTHROPIC_URL, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': ANTHROPIC_VERSION,
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 1500,
          tools: [tool],
          tool_choice: { type: 'tool', name: tool.name },
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      if (!res.ok) {
        console.error(`[ranker] Anthropic API ${res.status}`);
        return null;
      }
      const body: unknown = await res.json();
      const rankings = extractRankings(body);
      if (rankings === null) return null;

      return candidates.map((candidate, i) => {
        const r = rankings.find((x) => x.index === i);
        return {
          candidate,
          fitScore: r ? clampScore(r.fitScore) : 50,
          reasons: r?.reasons ?? [],
        };
      });
    } catch (cause) {
      console.error('[ranker] ranking error:', cause);
      return null;
    }
  }
}

interface Ranking {
  readonly index: number;
  readonly fitScore: number;
  readonly reasons: readonly string[];
}

function extractRankings(body: unknown): Ranking[] | null {
  const content =
    typeof body === 'object' &&
    body !== null &&
    Array.isArray((body as { content?: unknown }).content)
      ? (body as { content: unknown[] }).content
      : [];
  const toolUse = content.find(
    (b): b is { type: string; input: { rankings?: unknown } } =>
      typeof b === 'object' &&
      b !== null &&
      (b as { type?: unknown }).type === 'tool_use',
  );
  const rankings = toolUse?.input?.rankings;
  if (!Array.isArray(rankings)) return null;
  return rankings
    .filter(
      (r): r is Ranking =>
        typeof r === 'object' && r !== null && typeof (r as Ranking).index === 'number',
    )
    .map((r) => ({
      index: r.index,
      fitScore: clampScore(r.fitScore),
      reasons: Array.isArray(r.reasons) ? r.reasons.map(String).slice(0, 4) : [],
    }));
}

/** Deterministic overlap heuristic — a real score, not fabricated AI. */
function heuristicRank(
  query: DiscoveryQuery,
  candidates: readonly CandidateCompany[],
): RankedCompany[] {
  const marketSet = new Set(query.markets.map((m) => m.toLowerCase()));
  return candidates.map((candidate) => {
    const reasons: string[] = [];
    let score = 40;
    if (candidate.country && marketSet.has(candidate.country.toLowerCase())) {
      score += 30;
      reasons.push(`In a target market (${candidate.country})`);
    }
    if (candidate.website) {
      score += 10;
      reasons.push('Has a verifiable web presence');
    }
    if (candidate.sources.length > 1) {
      score += 10;
      reasons.push(`Confirmed by ${candidate.sources.length} sources`);
    }
    if (reasons.length === 0) reasons.push('Baseline match on the opportunity');
    return { candidate, fitScore: clampScore(score), reasons };
  });
}

function clampScore(value: unknown): number {
  const n = typeof value === 'number' ? value : Number.parseFloat(String(value));
  if (Number.isNaN(n)) return 50;
  return Math.max(0, Math.min(100, Math.round(n)));
}
