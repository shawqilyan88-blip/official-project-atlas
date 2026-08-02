import 'server-only';

import type { InfrastructureError } from '@/core/errors';
import { type Result, success } from '@/core/result';
import { serverEnv } from '@/shared/config/env';

import {
  detectMissing,
  EXTRACTION_SCHEMA,
  type ExtractionField,
  type ExtractionResult,
  extractionFieldMeta,
  overallConfidence,
} from '../domain/extraction';
import type { DocumentExtractionInput, DocumentExtractor } from '../application/ports';

/**
 * Claude-powered document extraction (Anthropic Messages API, tool-use).
 *
 * The honesty guarantees live here:
 *   - No API key  → `not_configured`. Never a fabricated field.
 *   - Unsupported format (Word/Excel, until a converter ships) → `unsupported`.
 *   - The model is instructed to omit anything not present, so absence of a
 *     field means "not in the document", not "zero".
 *
 * PDFs and images go to Claude natively; plain text and CSV are sent as text.
 */
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
const MODEL = 'claude-sonnet-5';
const MAX_TOKENS = 2048;

const IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif']);
const TEXT_TYPES = new Set(['text/plain', 'text/csv']);

const EXTRACTION_TOOL = {
  name: 'record_opportunity',
  description:
    'Record the trade fields found in the document. Include a field ONLY if the ' +
    'document explicitly contains it. Never guess or infer beyond what is written.',
  input_schema: {
    type: 'object',
    properties: {
      fields: {
        type: 'array',
        description: 'One entry per field actually found in the document.',
        items: {
          type: 'object',
          properties: {
            key: { type: 'string', enum: EXTRACTION_SCHEMA.map((f) => f.key) },
            value: {
              type: 'string',
              description:
                'The value as written. For list fields, comma-separate the items.',
            },
            confidence: {
              type: 'number',
              description: 'How explicit the value is in the document, from 0 to 1.',
            },
          },
          required: ['key', 'value', 'confidence'],
        },
      },
    },
    required: ['fields'],
  },
} as const;

const SYSTEM_PROMPT =
  'You are an experienced international trade analyst. Read the attached business ' +
  'document (an LOI, RFQ, purchase order, product specification, catalogue, or ' +
  'company profile) and extract the trade opportunity it describes. Use the ' +
  'record_opportunity tool. Only record a field if the document actually states ' +
  'it — it is correct and expected to leave fields out. Do not infer, estimate, ' +
  'or fabricate. Set confidence to reflect how explicitly each value appears.';

interface RawField {
  readonly key: unknown;
  readonly value: unknown;
  readonly confidence: unknown;
}

export class AnthropicDocumentExtractor implements DocumentExtractor {
  async extract(
    input: DocumentExtractionInput,
  ): Promise<Result<ExtractionResult, InfrastructureError>> {
    const apiKey = serverEnv().ANTHROPIC_API_KEY;
    if (!apiKey) {
      return success({
        status: 'not_configured',
        fields: [],
        overallConfidence: 0,
        missing: [],
        message:
          "Reading documents automatically isn't available on this workspace yet. " +
          'You can complete the brief manually — every field is editable.',
      });
    }

    const content = this.buildContent(input);
    if (content === null) {
      return success({
        status: 'unsupported',
        fields: [],
        overallConfidence: 0,
        missing: [],
        message:
          'That format is not read automatically yet (Word and Excel extraction is ' +
          'coming). Upload a PDF, image, or text file, or fill the brief manually.',
      });
    }

    let response: Response;
    try {
      response = await fetch(ANTHROPIC_URL, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': ANTHROPIC_VERSION,
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: MAX_TOKENS,
          system: SYSTEM_PROMPT,
          tools: [EXTRACTION_TOOL],
          tool_choice: { type: 'tool', name: EXTRACTION_TOOL.name },
          messages: [{ role: 'user', content }],
        }),
      });
    } catch (cause) {
      return this.failed(
        "Atlas couldn't read the document just now. Try again, or complete the brief manually.",
        cause,
      );
    }

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      console.error(`[extractor] Anthropic API ${response.status}: ${detail}`);
      return this.failed(
        response.status === 401
          ? "Reading documents automatically isn't available right now. Complete the brief manually and you're set."
          : "Atlas couldn't read the document just now. Try again, or complete the brief manually.",
      );
    }

    let body: unknown;
    try {
      body = await response.json();
    } catch (cause) {
      return this.failed(
        "Atlas couldn't read the document just now. Try again, or complete the brief manually.",
        cause,
      );
    }

    const fields = this.parseFields(body);
    return success({
      status: 'extracted',
      fields,
      overallConfidence: overallConfidence(fields),
      missing: detectMissing(fields),
    });
  }

  /** Builds the message content blocks, or null for an unsupported format. */
  private buildContent(input: DocumentExtractionInput): unknown[] | null {
    const instruction = {
      type: 'text',
      text: 'Extract the trade opportunity from this document using the tool.',
    };

    if (input.mimeType === 'application/pdf') {
      return [
        {
          type: 'document',
          source: {
            type: 'base64',
            media_type: 'application/pdf',
            data: this.base64(input.bytes),
          },
        },
        instruction,
      ];
    }
    if (IMAGE_TYPES.has(input.mimeType)) {
      return [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: input.mimeType,
            data: this.base64(input.bytes),
          },
        },
        instruction,
      ];
    }
    if (TEXT_TYPES.has(input.mimeType)) {
      const text = new TextDecoder().decode(input.bytes).slice(0, 100_000);
      return [
        { type: 'text', text: `Document (${input.fileName}):\n\n${text}` },
        instruction,
      ];
    }
    return null;
  }

  private parseFields(body: unknown): ExtractionField[] {
    const blocks =
      typeof body === 'object' &&
      body !== null &&
      Array.isArray((body as { content?: unknown }).content)
        ? (body as { content: unknown[] }).content
        : [];

    const toolUse = blocks.find(
      (b): b is { type: string; name: string; input: { fields?: RawField[] } } =>
        typeof b === 'object' &&
        b !== null &&
        (b as { type?: unknown }).type === 'tool_use' &&
        (b as { name?: unknown }).name === EXTRACTION_TOOL.name,
    );

    const raw = toolUse?.input?.fields ?? [];
    const fields: ExtractionField[] = [];
    const seen = new Set<string>();

    for (const entry of raw) {
      const key = typeof entry.key === 'string' ? entry.key : '';
      const meta = extractionFieldMeta(key);
      if (!meta || seen.has(key)) continue;
      const rawValue = typeof entry.value === 'string' ? entry.value.trim() : '';
      if (rawValue.length === 0) continue;

      seen.add(key);
      const confidence = clampConfidence(entry.confidence);
      const value =
        meta.kind === 'list'
          ? rawValue
              .split(/[,;\n]/)
              .map((part) => part.trim())
              .filter((part) => part.length > 0)
          : rawValue;

      if (Array.isArray(value) && value.length === 0) continue;

      fields.push({
        key: meta.key,
        label: meta.label,
        kind: meta.kind,
        value,
        confidence,
        appliesTo: meta.appliesTo,
      });
    }
    return fields;
  }

  private base64(bytes: ArrayBuffer): string {
    return Buffer.from(bytes).toString('base64');
  }

  private failed(
    message: string,
    cause?: unknown,
  ): Result<ExtractionResult, InfrastructureError> {
    if (cause !== undefined) console.error('[extractor] extraction error:', cause);
    return success({
      status: 'failed',
      fields: [],
      overallConfidence: 0,
      missing: [],
      message,
    });
  }
}

function clampConfidence(value: unknown): number {
  const n = typeof value === 'number' ? value : Number.parseFloat(String(value));
  if (Number.isNaN(n)) return 0.5;
  return Math.max(0, Math.min(1, n));
}
