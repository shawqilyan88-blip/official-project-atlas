'use client';

import { useState } from 'react';

import type { MembershipWithOrganization, Organization, Role } from '@/core/entities';
import { MenuIcon } from '@/shared/ui/icons';
import { WorkspaceSwitcher } from '@/modules/tenancy/ui/workspace-switcher';
import {
  Button,
  Separator,
  Sheet,
  SheetContent,
  SheetTrigger,
  Wordmark,
} from '@/shared/ui';

import { SidebarNavigation } from './sidebar-navigation';

/**
 * The small-screen equivalent of the sidebar.
 *
 * Below `lg` the rail would consume most of the viewport, so navigation moves
 * behind a trigger. Closing on selection is deliberate: leaving the sheet open
 * over the page the user just asked for is a common and irritating oversight.
 */
export function MobileNavigation({
  organization,
  role,
  memberships,
}: {
  readonly organization: Organization;
  readonly role: Role;
  readonly memberships: readonly MembershipWithOrganization[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <MenuIcon className="size-5" aria-hidden="true" />
          <span className="sr-only">Open navigation</span>
        </Button>
      </SheetTrigger>

      <SheetContent
        side="left"
        title="Workspace navigation"
        description="Switch workspace and move between sections."
        className="p-0"
      >
        <div className="flex h-14 items-center px-4">
          <Wordmark />
        </div>

        <Separator className="bg-sidebar-border" />

        <div className="px-2 py-2">
          <WorkspaceSwitcher
            organization={organization}
            role={role}
            memberships={memberships}
          />
        </div>

        <Separator className="bg-sidebar-border" />

        <div className="flex-1 overflow-y-auto">
          <SidebarNavigation role={role} onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
