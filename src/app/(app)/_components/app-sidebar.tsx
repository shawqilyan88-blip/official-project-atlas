import Link from 'next/link';

import type { TenantContext } from '@/core/entities';
import { WorkspaceSwitcher } from '@/modules/tenancy/ui/workspace-switcher';
import { routes } from '@/shared/config/routes';
import { Separator, Wordmark } from '@/shared/ui';

import { SidebarNavigation } from './sidebar-navigation';

/**
 * The desktop navigation rail.
 *
 * A Server Component: the tenant context arrives already resolved, so no
 * workspace data crosses to the client beyond what is rendered.
 */
export function AppSidebar({ context }: { context: TenantContext }) {
  return (
    <aside className="hidden w-[15.5rem] shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      <div className="flex h-14 items-center px-4">
        <Link
          href={routes.dashboard}
          className="rounded-md focus-visible:outline-none"
          aria-label="Atlas home"
        >
          <Wordmark />
        </Link>
      </div>

      <Separator className="bg-sidebar-border" />

      <div className="px-2 py-2">
        <WorkspaceSwitcher
          organization={context.organization}
          role={context.role}
          memberships={context.memberships}
        />
      </div>

      <Separator className="bg-sidebar-border" />

      <div className="flex-1 overflow-y-auto">
        <SidebarNavigation role={context.role} />
      </div>
    </aside>
  );
}
