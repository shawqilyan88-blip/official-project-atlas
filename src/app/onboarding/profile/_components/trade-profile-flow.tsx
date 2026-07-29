'use client';

import { useState } from 'react';

import type { UploadedDocument } from '@/modules/trade-profile/actions';

import { DocumentUpload } from './document-upload';
import { OptionChooser } from './option-chooser';
import { ProfileWizard } from './profile-wizard';

/**
 * Orchestrates the Trade Profile onboarding as a small state machine.
 *
 * `choose` → `upload` → `wizard`, or `choose` → `wizard` directly. Documents are
 * held here so their count follows the user into the wizard, letting the manual
 * step acknowledge what was already uploaded. The building sequence and redirect
 * live inside the wizard, which owns the save.
 */
type Phase = 'choose' | 'upload' | 'wizard';

export function TradeProfileFlow({
  initialDocuments,
}: {
  readonly initialDocuments: readonly UploadedDocument[];
}) {
  const [phase, setPhase] = useState<Phase>('choose');
  const [documents, setDocuments] =
    useState<readonly UploadedDocument[]>(initialDocuments);

  if (phase === 'upload') {
    return (
      <DocumentUpload
        documents={documents}
        onUploaded={(document) => setDocuments((current) => [document, ...current])}
        onContinue={() => setPhase('wizard')}
        onBack={() => setPhase('choose')}
      />
    );
  }

  if (phase === 'wizard') {
    return <ProfileWizard />;
  }

  return (
    <OptionChooser
      onUpload={() => setPhase('upload')}
      onManual={() => setPhase('wizard')}
    />
  );
}
