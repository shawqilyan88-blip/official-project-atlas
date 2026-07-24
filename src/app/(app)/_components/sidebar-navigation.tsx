'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { type Role, can } from '@/core/entities';
import { type NavigationItem, navigationGroups } from '@/shared/config/navigation';
import { Badge, cn } from '@/shared/ui';

/**
 * The navigation list, shared by the desktop rail and the mobile sheet.
 *
 * A client component only because the active route has to be read from the
 * URL. Everything else about the shell stays on the server.
 */
export function SidebarNavigation({
  role,
  onNavigate,
}: {
  readonly role: Role;
  /** Lets the mobile sheet close itself once a destination is chosen. */
  readonly onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label="Workspace" className="flex flex-1 flex-col gap-6 px-3 py-4">
      {navigationGroups.map((group) => {
        const visibleItems = group.items.filter(
          (item) => item.requires === undefined || can(role, item.requires),
        );

        // A group whose every item is hidden by permissions should not leave a
        // dangling heading behind.
        if (visibleItems.length === 0) return null;

        return (
          <div key={group.label} className="space-y-1">
            <h2 className="px-2 pb-1 text-[0.6875rem] font-medium tracking-wider text-muted-foreground uppercase">
              {group.label}
            </h2>

            <ul className="space-y-0.5">
              {visibleItems.map((item) => (
                <li key={item.href}>
                  <NavigationLink
                    item={item}
                    pathname={pathname}
                    onNavigate={onNavigate}
                  />
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}

function NavigationLink({
  item,
  pathname,
  onNavigate,
}: {
  item: NavigationItem;
  pathname: string;
  onNavigate?: (() => void) | undefined;
}) {
  const Icon = item.icon;

  const baseClasses = cn(
    'group flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm',
    'transition-colors duration-[--duration-fast]',
  );

  if (!item.available) {
    return (
      <span
        className={cn(baseClasses, 'cursor-default text-muted-foreground/70')}
        // Announced as unavailable rather than silently unclickable.
        aria-disabled="true"
        title={`${item.description} — coming soon`}
      >
        <Icon className="size-4 shrink-0 opacity-60" aria-hidden="true" />
        <span className="flex-1 truncate">{item.label}</span>
        <Badge tone="neutral" className="px-1.5 py-0 text-[0.625rem]">
          Soon
        </Badge>
      </span>
    );
  }

  // Exact match for the workspace root, prefix match elsewhere, so that
  // /settings/members also lights up /settings.
  const isActive =
    pathname === item.href ||
    (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`));

  return (
    <Link
      href={item.href}
      // Spread rather than pass `undefined`: with exactOptionalPropertyTypes,
      // an absent prop and a prop set to undefined are different types.
      {...(onNavigate !== undefined ? { onClick: onNavigate } : {})}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        baseClasses,
        isActive
          ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'
          : 'text-sidebar-foreground/85 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
      )}
    >
      <Icon
        className={cn('size-4 shrink-0', isActive ? 'opacity-100' : 'opacity-70')}
        aria-hidden="true"
      />
      <span className="flex-1 truncate">{item.label}</span>
    </Link>
  );
}
