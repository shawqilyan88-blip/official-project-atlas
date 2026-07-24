'use client';

import { useActionState } from 'react';

import { type ActionState, idleState } from '@/shared/lib/action-state';
import { Alert, Button, FormField } from '@/shared/ui';

import { updateDisplayNameAction } from '../actions';

export function DisplayNameForm({ initialName }: { initialName: string }) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    updateDisplayNameAction,
    idleState,
  );

  const fieldErrors = state.status === 'error' ? state.fieldErrors : undefined;

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.status === 'error' && !fieldErrors && (
        <Alert tone="error">{state.message}</Alert>
      )}

      {state.status === 'success' && <Alert tone="success">Your name was updated.</Alert>}

      <FormField
        label="Display name"
        name="fullName"
        // Uncontrolled: the server value is the starting point, and the user
        // owns the field from there. A controlled input would fight the reset
        // that follows a successful submit.
        defaultValue={initialName}
        required
        maxLength={80}
        autoComplete="name"
        hint="Shown to everyone in your workspace."
        errors={fieldErrors?.['fullName']}
        disabled={isPending}
      />

      <Button type="submit" loading={isPending} loadingLabel="Saving…">
        Save changes
      </Button>
    </form>
  );
}
