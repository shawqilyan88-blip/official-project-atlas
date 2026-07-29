import 'server-only';

import type { AppError } from '@/core/errors';
import { type Result, success } from '@/core/result';
import { serverEnv } from '@/shared/config/env';

import type { DraftContext, MessageDraft } from '../domain/outreach';
import type { MessageDrafter } from '../application/ports';

/**
 * Drafts outreach with Claude, tailored to the opportunity and the target
 * company. With no key, it returns an honest, clearly-templated draft the user
 * completes — never a fabricated "AI-written" message, and never invented facts
 * about the counterparty.
 *
 * `context.priorMessages` is accepted for future conversation memory; it is not
 * used in this release.
 */
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
const MODEL = 'claude-sonnet-5';

export class AnthropicMessageDrafter implements MessageDrafter {
  async draft(context: DraftContext): Promise<Result<MessageDraft, AppError>> {
    const apiKey = serverEnv().ANTHROPIC_API_KEY;
    if (!apiKey) return success(templateDraft(context));

    const claude = await this.draftWithClaude(context, apiKey);
    return success(claude ?? templateDraft(context));
  }

  private async draftWithClaude(
    context: DraftContext,
    apiKey: string,
  ): Promise<MessageDraft | null> {
    const tool = {
      name: 'write_message',
      description: 'Write a concise, professional first-contact outreach email.',
      input_schema: {
        type: 'object',
        properties: {
          subject: { type: 'string' },
          body: { type: 'string' },
        },
        required: ['subject', 'body'],
      },
    };

    const system =
      'You are an experienced international trade manager writing a first-contact ' +
      'email on behalf of the sender. Be concise, credible, and specific to the ' +
      'opportunity. Do NOT invent facts about the recipient or the sender beyond ' +
      'what you are given. Where a specific detail would help but is unknown, leave ' +
      'a clearly bracketed placeholder like [your MOQ] for the sender to fill.';

    const prompt =
      `Sender: ${context.sender.companyName}` +
      `${context.sender.industry ? ` (${context.sender.industry})` : ''}. ` +
      `Sender products: ${context.sender.products.join(', ') || '—'}. ` +
      `${context.sender.description ? `About sender: ${context.sender.description}. ` : ''}` +
      `\nOpportunity: ${context.opportunity.objective}. Product: ${context.opportunity.product ?? '—'}. ` +
      `Markets: ${context.opportunity.markets.join(', ') || '—'}.` +
      `\nRecipient: ${context.company.name}` +
      `${context.company.country ? `, ${context.company.country}` : ''} ` +
      `(a potential ${context.company.role}).` +
      '\n\nWrite the email with write_message.';

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
          max_tokens: 1024,
          system,
          tools: [tool],
          tool_choice: { type: 'tool', name: tool.name },
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      if (!res.ok) {
        console.error(`[drafter] Anthropic API ${res.status}`);
        return null;
      }
      const body: unknown = await res.json();
      return extractDraft(body);
    } catch (cause) {
      console.error('[drafter] drafting error:', cause);
      return null;
    }
  }
}

function extractDraft(body: unknown): MessageDraft | null {
  const content =
    typeof body === 'object' &&
    body !== null &&
    Array.isArray((body as { content?: unknown }).content)
      ? (body as { content: unknown[] }).content
      : [];
  const toolUse = content.find(
    (b): b is { type: string; input: { subject?: unknown; body?: unknown } } =>
      typeof b === 'object' &&
      b !== null &&
      (b as { type?: unknown }).type === 'tool_use',
  );
  const subject = toolUse?.input?.subject;
  const text = toolUse?.input?.body;
  if (typeof subject !== 'string' || typeof text !== 'string') return null;
  return { subject: subject.trim(), body: text.trim() };
}

/** An honest, obviously-templated draft — used when AI drafting is unavailable. */
function templateDraft(context: DraftContext): MessageDraft {
  const product = context.opportunity.product ?? 'our products';
  const verb = context.company.role === 'supplier' ? 'source' : 'supply';
  return {
    subject: `Introduction — ${context.sender.companyName} × ${context.company.name}`,
    body:
      `Dear ${context.company.name} team,\n\n` +
      `I'm reaching out from ${context.sender.companyName}. We are looking to ${verb} ` +
      `${product} and believe there may be a strong fit with your business` +
      `${context.company.country ? ` in ${context.company.country}` : ''}.\n\n` +
      `[Add one or two specifics: volumes, terms, timelines.]\n\n` +
      `Would you be open to a short conversation?\n\n` +
      `Best regards,\n${context.sender.companyName}`,
  };
}
