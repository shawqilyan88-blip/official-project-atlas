import { type AppError, InfrastructureError } from '@/core/errors';
import { failure, type Result, success } from '@/core/result';
import type { AtlasSupabaseClient } from '@/infrastructure/supabase/browser-client';

import type { OpportunityDocumentStorage } from '../application/ports';

const BUCKET = 'opportunity-documents';

/**
 * Supabase Storage adapter for opportunity documents. The bucket is private and
 * governed by the same is_org_member RLS as the tables (object paths start with
 * the organization id), so a signed URL is required to read a file back.
 */
export class SupabaseOpportunityDocumentStorage implements OpportunityDocumentStorage {
  constructor(private readonly client: AtlasSupabaseClient) {}

  async upload(input: {
    path: string;
    body: ArrayBuffer;
    contentType: string;
  }): Promise<Result<void, AppError>> {
    const { error } = await this.client.storage
      .from(BUCKET)
      .upload(input.path, input.body, { contentType: input.contentType, upsert: false });

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

  async createSignedUrl(
    path: string,
    expiresInSeconds: number,
  ): Promise<Result<string, AppError>> {
    const { data, error } = await this.client.storage
      .from(BUCKET)
      .createSignedUrl(path, expiresInSeconds);

    if (error || !data) {
      return failure(
        new InfrastructureError('The document link could not be created.', {
          cause: error ?? undefined,
        }),
      );
    }
    return success(data.signedUrl);
  }
}
