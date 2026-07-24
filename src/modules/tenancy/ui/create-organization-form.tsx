'use client';

import { useActionState, useState } from 'react';

import { slugifyOrganizationName } from '@/core/entities';
import { type ActionState, idleState } from '@/shared/lib/action-state';
import { Alert, Button, FormField } from '@/shared/ui';

import { createOrganizationAction } from '../actions';

/**
 * Creates the first (or an additional) workspace.
 *
 * The address field derives itself from the name until the user edits it, at
 * which point it stops following. Silently overwriting something a person
 * deliberately typed is the kind of small betrayal that makes software feel
 * untrustworthy.
 */
export function CreateOrganizationForm() {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    createOrganizationAction,
    idleState,
  );

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);

  const effectiveSlug = slugEdited ? slug : slugifyOrganizationName(name);
  const fieldErrors = state.status === 'error' ? state.fieldErrors : undefined;

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state.status === 'error' && !fieldErrors && (
        <Alert tone="error" title="Could not create the workspace">
          {state.message}
        </Alert>
      )}

      <FormField
        label="Workspace name"
        name="name"
        value={name}
        onChange={(event) => setName(event.target.value)}
        autoFocus
        required
        maxLength={60}
        placeholder="Northwind Trading"
        hint="Usually your company name. You can change this later."
        errors={fieldErrors?.['name']}
        disabled={isPending}
      />

      <FormField
        label="Workspace address"
        name="slug"
        value={effectiveSlug}
        onChange={(event) => {
          setSlugEdited(true);
          setSlug(event.target.value);
        }}
        required
        maxLength={40}
        inputMode="url"
        autoComplete="off"
        spellCheck={false}
        placeholder="northwind-trading"
        hint="Lowercase letters, numbers, and hyphens. This has to be unique."
        errors={fieldErrors?.['slug']}
        disabled={isPending}
      />

      <Button
        type="submit"
        block
        size="lg"
        loading={isPending}
        loadingLabel="Creating your workspace…"
      >
        Create workspace
      </Button>
    </form>
  );
}
