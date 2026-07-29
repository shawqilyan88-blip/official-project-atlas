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
 *
 * The rail closes with a live presence line — a breathing dot and "Atlas is
 * online" — so the product reads as a colleague who is around, not a set of
 * links. It is the same promise the command centre makes, kept in the corner of
 * the eye.
 */
export function AppSidebar({ context }: { context: TenantContext }) {
  return (
    <aside className="hidden w-[15.5rem] shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      <div className="flex h-14 items-center px-4">
        <Link
          href={routes.dashboard}
          className="rounded-md focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-none"
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

      <Separator className="bg-sidebar-border" />

      <div className="flex items-center gap-2.5 px-4 py-3.5">
        <span className="relative flex size-2 shrink-0" aria-hidden="true">
          <span className="animate-breathe absolute inline-flex h-full w-full rounded-full bg-emerald-500/70" />
          <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
        </span>
        <div className="min-w-0 leading-tight">
          <p className="truncate text-xs font-medium text-sidebar-foreground">
            Atlas is online
          </p>
          <p className="truncate text-[0.6875rem] text-sidebar-foreground/55">
            Ready when you are
          </p>
        </div>
      </div>
    </aside>
  );
}
