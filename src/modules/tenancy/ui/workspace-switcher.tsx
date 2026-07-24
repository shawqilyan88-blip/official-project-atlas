'use client';

import type { MembershipWithOrganization, Organization, Role } from '@/core/entities';
import { CheckIcon, ChevronsUpDownIcon } from '@/shared/ui/icons';
import { ROLE_LABEL } from '@/core/entities';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  cn,
} from '@/shared/ui';

import { switchOrganizationAction } from '../actions';

interface WorkspaceSwitcherProps {
  readonly organization: Organization;
  readonly role: Role;
  readonly memberships: readonly MembershipWithOrganization[];
}

/**
 * Switches the active workspace.
 *
 * Each option is its own `<form>` posting to a Server Action rather than a
 * client-side state change. That keeps the switch server-authoritative — the
 * cookie is written and validated in one place — and it means the control still
 * works before hydration, or with JavaScript disabled entirely.
 */
export function WorkspaceSwitcher({
  organization,
  role,
  memberships,
}: WorkspaceSwitcherProps) {
  const isOnlyWorkspace = memberships.length <= 1;

  if (isOnlyWorkspace) {
    return (
      <div className="flex min-w-0 items-center gap-2.5 px-2 py-1.5">
        <WorkspaceGlyph name={organization.name} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm leading-tight font-medium">
            {organization.name}
          </p>
          <p className="truncate text-xs text-muted-foreground">{ROLE_LABEL[role]}</p>
        </div>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-auto w-full justify-start gap-2.5 px-2 py-1.5 font-normal"
        >
          <WorkspaceGlyph name={organization.name} />
          <span className="min-w-0 flex-1 text-left">
            <span className="block truncate text-sm leading-tight font-medium">
              {organization.name}
            </span>
            <span className="block truncate text-xs text-muted-foreground">
              {ROLE_LABEL[role]}
            </span>
          </span>
          <ChevronsUpDownIcon
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <span className="sr-only">Switch workspace</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-[15rem]">
        <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {memberships.map((membership) => {
          const isActive = membership.organizationId === organization.id;

          return (
            <form key={membership.id} action={switchOrganizationAction}>
              <input
                type="hidden"
                name="organizationId"
                value={membership.organizationId}
              />
              <DropdownMenuItem asChild>
                <button
                  type="submit"
                  className="w-full"
                  // The active workspace is not a navigation target.
                  disabled={isActive}
                  aria-current={isActive ? 'true' : undefined}
                >
                  <WorkspaceGlyph name={membership.organization.name} />
                  <span className="min-w-0 flex-1 truncate text-left">
                    {membership.organization.name}
                  </span>
                  {isActive && (
                    <CheckIcon
                      className="size-4 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                  )}
                </button>
              </DropdownMenuItem>
            </form>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** A deterministic monogram, so a workspace looks the same on every visit. */
function WorkspaceGlyph({ name, className }: { name: string; className?: string }) {
  const glyph = name.trim().charAt(0).toUpperCase() || 'W';

  return (
    <span
      className={cn(
        'flex size-7 shrink-0 items-center justify-center bg-primary/10 text-primary',
        'rounded-md text-xs font-semibold select-none',
        className,
      )}
      aria-hidden="true"
    >
      {glyph}
    </span>
  );
}
