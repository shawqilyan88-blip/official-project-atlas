'use client';

import Link from 'next/link';
import { useActionState, useEffect, useRef } from 'react';

import { MailCheckIcon } from '@/shared/ui/icons';
import { routes } from '@/shared/config/routes';
import { type ActionState, idleState } from '@/shared/lib/action-state';
import { Alert, Button, FormField } from '@/shared/ui';

import { signUpAction } from '../actions';
import { PASSWORD_MIN_LENGTH } from '../domain/schemas';

type SignUpState = ActionState<{ email: string }>;

export function SignUpForm() {
  const [state, formAction, isPending] = useActionState<SignUpState, FormData>(
    signUpAction,
    idleState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  // On a rejected submit, move focus to the first field the server flagged.
  useEffect(() => {
    if (state.status !== 'error') return;
    formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [state]);

  // Confirmation is a distinct step, not a toast: the user must leave for their
  // inbox, so the screen should stop asking them to do anything else.
  if (state.status === 'success') {
    return <ConfirmationNotice email={state.data.email} />;
  }

  const fieldErrors = state.status === 'error' ? state.fieldErrors : undefined;

  return (
    <form ref={formRef} action={formAction} className="space-y-5" noValidate>
      {state.status === 'error' && !fieldErrors && (
        <Alert tone="error" title="Could not create your account">
          {state.message}
        </Alert>
      )}

      <FormField
        label="Full name"
        name="fullName"
        autoComplete="name"
        autoFocus
        required
        placeholder="Ada Lovelace"
        errors={fieldErrors?.['fullName']}
        disabled={isPending}
      />

      <FormField
        label="Work email"
        name="email"
        type="email"
        autoComplete="email"
        required
        placeholder="you@company.com"
        errors={fieldErrors?.['email']}
        disabled={isPending}
      />

      <FormField
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        placeholder="••••••••••••"
        hint={`At least ${PASSWORD_MIN_LENGTH} characters, with upper and lower case letters and a number.`}
        errors={fieldErrors?.['password']}
        disabled={isPending}
      />

      <Button
        type="submit"
        block
        size="lg"
        loading={isPending}
        loadingLabel="Creating your account…"
      >
        Create account
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link
          href={routes.signIn}
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}

function ConfirmationNotice({ email }: { email: string }) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Success replaces the form entirely, so move focus to the new heading — a
  // screen reader announces "Confirm your email" instead of stranding focus on
  // the now-removed submit button.
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div className="space-y-5 text-center">
      <div
        className="mx-auto flex size-12 items-center justify-center rounded-full bg-accent text-accent-foreground"
        aria-hidden="true"
      >
        <MailCheckIcon className="size-6" />
      </div>

      <div className="space-y-2">
        <h2 ref={headingRef} tabIndex={-1} className="text-lg font-semibold outline-none">
          Confirm your email
        </h2>
        <p className="text-sm leading-relaxed text-balance text-muted-foreground">
          We sent a confirmation link to{' '}
          <span className="font-medium break-all text-foreground">{email}</span>. Open it
          to activate your account and set up your workspace.
        </p>
      </div>

      <Alert tone="info">
        The link expires in 24 hours. If it does not arrive within a few minutes, check
        your spam folder.
      </Alert>

      <Button variant="outline" block asChild>
        <Link href={routes.signIn}>Back to sign in</Link>
      </Button>
    </div>
  );
}
