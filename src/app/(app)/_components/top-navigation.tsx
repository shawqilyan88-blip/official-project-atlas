import type { TenantContext } from '@/core/entities';
import { UserMenu } from '@/modules/tenancy/ui/user-menu';
import { ThemeToggle } from '@/shared/ui';

import { MobileNavigation } from './mobile-navigation';

/**
 * The workspace header.
 *
 * Deliberately sparse. The header is persistent chrome — every pixel it takes
 * is taken from the work itself — so it carries only navigation access,
 * appearance, and account.
 */
export function TopNavigation({ context }: { context: TenantContext }) {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/85 px-4 backdrop-blur-md">
      <MobileNavigation
        organization={context.organization}
        role={context.role}
        memberships={context.memberships}
      />

      {/* The page owns its own title; the header stays out of the way. */}
      <div className="flex-1" />

      <ThemeToggle />
      <UserMenu profile={context.profile} />
    </header>
  );
}
