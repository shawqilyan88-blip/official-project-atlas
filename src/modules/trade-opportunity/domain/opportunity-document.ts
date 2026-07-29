/**
 * Documents and timeline events an opportunity owns.
 *
 * Pure data + display metadata — no persistence, no React. A document is
 * versioned: replacing one keeps the old row (is_current = false) so the trail
 * survives. The timeline records what happened to those documents over time.
 */

export const DOCUMENT_KINDS = [
  'loi',
  'rfq',
  'purchase_order',
  'product_spec',
  'company_profile',
  'product_catalog',
  'other',
] as const;
export type DocumentKind = (typeof DOCUMENT_KINDS)[number];

export const DOCUMENT_KIND_LABEL: Readonly<Record<DocumentKind, string>> = {
  loi: 'Letter of Intent',
  rfq: 'Request for Quotation',
  purchase_order: 'Purchase Order',
  product_spec: 'Product Specification',
  company_profile: 'Company Profile',
  product_catalog: 'Product Catalogue',
  other: 'Document',
};

export type DocumentAnalysisStatus = 'pending' | 'processing' | 'analyzed' | 'failed';

export interface OpportunityDocument {
  readonly id: string;
  readonly opportunityId: string;
  readonly kind: DocumentKind;
  readonly fileName: string;
  readonly storagePath: string;
  readonly mimeType: string | null;
  readonly sizeBytes: number | null;
  readonly status: DocumentAnalysisStatus;
  readonly version: number;
  readonly replacesId: string | null;
  readonly isCurrent: boolean;
  readonly createdAt: string;
}

export interface OpportunityTimelineEvent {
  readonly id: string;
  readonly kind: string;
  readonly title: string;
  readonly detail: string | null;
  readonly createdAt: string;
}

/** PDFs and images can be previewed inline; everything else downloads. */
export function isPreviewable(mimeType: string | null): boolean {
  return mimeType === 'application/pdf' || (mimeType?.startsWith('image/') ?? false);
}

/**
 * Splits a flat, newest-first document list into the current documents and the
 * superseded versions keyed by the id they were replaced by — so the UI can
 * show a version trail under each current document.
 */
export function groupDocumentVersions(documents: readonly OpportunityDocument[]): {
  current: readonly OpportunityDocument[];
  historyOf: (documentId: string) => readonly OpportunityDocument[];
} {
  const byReplaces = new Map<string, OpportunityDocument[]>();
  for (const doc of documents) {
    if (doc.replacesId !== null) {
      const list = byReplaces.get(doc.replacesId) ?? [];
      list.push(doc);
      byReplaces.set(doc.replacesId, list);
    }
  }

  // Walk backwards from a current doc through the replaces_id chain.
  const historyOf = (documentId: string): OpportunityDocument[] => {
    const chain: OpportunityDocument[] = [];
    const byId = new Map(documents.map((d) => [d.id, d]));
    let current = byId.get(documentId);
    while (current?.replacesId) {
      const prev = byId.get(current.replacesId);
      if (!prev) break;
      chain.push(prev);
      current = prev;
    }
    return chain;
  };

  return {
    current: documents.filter((d) => d.isCurrent),
    historyOf,
  };
}
