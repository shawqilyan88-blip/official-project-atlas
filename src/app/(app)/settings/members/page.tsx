import type { Metadata } from 'next';

import { ROLE_LABEL, displayName, initials } from '@/core/entities';
import { isFailure } from '@/core/result';
import { createServerContainer } from '@/server/container';
import { requireTenantContext } from '@/server/session';
import {
  Alert,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Card,
  CardContent,
  PageHeader,
} from '@/shared/ui';

export const metadata: Metadata = {
  title: 'Members',
  description: 'People with access to this workspace.',
};

export default async function MembersPage() {
  const context = await requireTenantContext();

  const { tenancy } = await createServerContainer();
  const result = await tenancy.listMembersOfOrganization(context.organization.id);

  return (
    <>
      <PageHeader
        title="Members"
        description={`People with access to ${context.organization.name}.`}
      />

      {isFailure(result) ? (
        <Alert tone="error" title="Could not load members">
          {result.error.message}
        </Alert>
      ) : (
        <Card>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {result.value.map((membership) => {
                const name = displayName(membership.profile);
                const isYou = membership.userId === context.profile.id;

                return (
                  <li key={membership.id} className="flex items-center gap-3 px-5 py-3.5">
                    <Avatar>
                      {membership.profile.avatarUrl !== null && (
                        <AvatarImage src={membership.profile.avatarUrl} alt="" />
                      )}
                      <AvatarFallback>{initials(name)}</AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 truncate text-sm font-medium">
                        {name}
                        {isYou && (
                          <span className="text-xs font-normal text-muted-foreground">
                            You
                          </span>
                        )}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">
                        {membership.profile.email}
                      </p>
                    </div>

                    <Badge tone={membership.role === 'owner' ? 'brand' : 'neutral'}>
                      {ROLE_LABEL[membership.role]}
                    </Badge>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}

      <Alert tone="info" className="mt-4">
        Inviting teammates and changing roles arrives in Sprint 2. The permission model
        and its database policies are already in place.
      </Alert>
    </>
  );
}
