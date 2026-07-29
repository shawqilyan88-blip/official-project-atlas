import type {
  OpportunityDocumentRow,
  OpportunityTimelineEventRow,
} from '@/infrastructure/supabase/database.types';

import type {
  OpportunityDocument,
  OpportunityTimelineEvent,
} from '../domain/opportunity-document';

export function toOpportunityDocument(row: OpportunityDocumentRow): OpportunityDocument {
  return {
    id: row.id,
    opportunityId: row.opportunity_id,
    kind: row.kind,
    fileName: row.file_name,
    storagePath: row.storage_path,
    mimeType: row.mime_type,
    sizeBytes: row.size_bytes,
    status: row.status,
    version: row.version,
    replacesId: row.replaces_id,
    isCurrent: row.is_current,
    createdAt: row.created_at,
  };
}

export function toOpportunityTimelineEvent(
  row: OpportunityTimelineEventRow,
): OpportunityTimelineEvent {
  return {
    id: row.id,
    kind: row.kind,
    title: row.title,
    detail: row.detail,
    createdAt: row.created_at,
  };
}
