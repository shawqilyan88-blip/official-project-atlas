import { type AppError, InfrastructureError } from '@/core/errors';
import { failure, type Result, success } from '@/core/result';
import type { AtlasSupabaseClient } from '@/infrastructure/supabase/browser-client';

import type { TradeDocumentStorage } from '../application/ports';

const BUCKET = 'trade-documents';

/**
 * Supabase Storage adapter for uploaded business documents.
 *
 * The bucket is private and governed by the same `is_org_member` RLS as the
 * tables (see the 0003 migration). The upload is future-proof by design: when
 * the AI extraction pipeline lands, it reads these same objects — only the
 * processing is added, the storage contract here does not change.
 */
export class SupabaseTradeDocumentStorage implements TradeDocumentStorage {
  constructor(private readonly client: AtlasSupabaseClient) {}

  async upload(input: {
    path: string;
    body: ArrayBuffer;
    contentType: string;
  }): Promise<Result<void, AppError>> {
    const { error } = await this.client.storage
      .from(BUCKET)
      .upload(input.path, input.body, {
        contentType: input.contentType,
        // Paths embed a fresh UUID, so a collision would be a genuine fault, not a
        // reason to overwrite someone else's file.
        upsert: false,
      });

    if (error) {
      return failure(
        new InfrastructureError('The document could not be uploaded.', { cause: error }),
      );
    }
    return success(undefined);
  }

  async remove(path: string): Promise<Result<void, AppError>> {
    const { error } = await this.client.storage.from(BUCKET).remove([path]);

    if (error) {
      return failure(
        new InfrastructureError('The document could not be removed.', { cause: error }),
      );
    }
    return success(undefined);
  }
}
