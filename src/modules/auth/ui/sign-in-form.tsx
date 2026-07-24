'use client';

import Link from 'next/link';
import { useActionState } from 'react';

import { Alert, Button, FormField } from '@/shared/ui';
import { routes } from '@/shared/config/routes';
import { type ActionState, idleState } from '@/shared/lib/action-state';

import { signInAction } from '../actions';

export function SignInForm({ redirectTo }: { redirectTo?: string }) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    signInAction,
    idleState,
  );

  const fieldErrors = state.status === 'error' ? state.fieldErrors : undefined;

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {/* Carried through the round trip so the user lands where they intended.
          The server re-sanitises it; this is only transport. */}
      {redirectTo !== undefined && (
        <input type="hidden" name="redirectTo" value={redirectTo} />
      )}

      {state.status === 'error' && !fieldErrors && (
        <Alert tone="error" title="Could not sign in">
          {state.message}
        </Alert>
      )}

      <FormField
        label="Work email"
        name="email"
        type="email"
        autoComplete="email"
        // The first field on a dedicated sign-in page is the expected focus target.
        autoFocus
        required
        placeholder="you@company.com"
        errors={fieldErrors?.['email']}
        disabled={isPending}
      />

      <div className="space-y-1.5">
        <FormField
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••••••"
          errors={fieldErrors?.['password']}
          disabled={isPending}
        />
      </div>

      <Button
        type="submit"
        block
        size="lg"
        loading={isPending}
        loadingLabel="Signing in…"
      >
        Sign in
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        New to Atlas?{' '}
        <Link
          href={routes.signUp}
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}
