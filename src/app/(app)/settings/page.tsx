import type { Metadata } from 'next';

import { ROLE_DESCRIPTION, ROLE_LABEL, Permission, can } from '@/core/entities';
import { DisplayNameForm } from '@/modules/tenancy/ui/display-name-form';
import { requireTenantContext } from '@/server/session';
import {
  Alert,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  PageHeader,
} from '@/shared/ui';

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Manage your profile and workspace.',
};

export default async function SettingsPage() {
  const context = await requireTenantContext();
  const canEditWorkspace = can(context.role, Permission.UpdateWorkspace);

  return (
    <>
      <PageHeader
        title="Settings"
        description="Your profile, and the workspace you are currently in."
      />

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Your profile</CardTitle>
            <CardDescription>How you appear to the rest of your team.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-sm">{context.profile.email}</p>
              <p className="text-xs text-muted-foreground">
                Changing your email address is not available yet.
              </p>
            </div>

            <DisplayNameForm initialName={context.profile.fullName ?? ''} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Workspace</CardTitle>
            <CardDescription>Details for {context.organization.name}.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <dl className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <dt className="text-sm font-medium text-muted-foreground">Name</dt>
                <dd className="text-sm">{context.organization.name}</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-sm font-medium text-muted-foreground">Address</dt>
                <dd className="font-mono text-sm">{context.organization.slug}</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-sm font-medium text-muted-foreground">Created</dt>
                <dd className="text-sm">
                  <FormattedDate value={context.organization.createdAt} />
                </dd>
              </div>
              <div className="space-y-1">
                <dt className="text-sm font-medium text-muted-foreground">Your role</dt>
                <dd className="flex items-center gap-2 text-sm">
                  <Badge tone="brand">{ROLE_LABEL[context.role]}</Badge>
                </dd>
              </div>
            </dl>

            {!canEditWorkspace && (
              <Alert tone="info">
                {ROLE_DESCRIPTION[context.role]} Only admins and owners can change
                workspace details.
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

/**
 * Rendered on the server with an explicit locale and time zone.
 *
 * Left to their defaults, `toLocaleDateString` picks up the *server's* locale
 * during SSR and the *browser's* during hydration, which React reports as a
 * mismatch and users see as text flickering on load.
 */
function FormattedDate({ value }: { value: string }) {
  const formatted = new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeZone: 'UTC',
  }).format(new Date(value));

  return <time dateTime={value}>{formatted}</time>;
}
