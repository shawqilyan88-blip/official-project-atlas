'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { type Role, can } from '@/core/entities';
import { type NavigationItem, navigationGroups } from '@/shared/config/navigation';
import { cn } from '@/shared/ui';

/**
 * The navigation list, shared by the desktop rail and the mobile sheet.
 *
 * A client component only because the active route has to be read from the URL.
 * The active item carries a small primary accent bar and a tinted surface; the
 * bar scales in rather than snapping, so moving between sections feels
 * continuous. Unbuilt modules render inert with a "Soon" tag rather than as dead
 * links — the shape of the product is shown, not faked.
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
    <nav aria-label="Workspace" className="flex flex-1 flex-col gap-5 px-3 py-4">
      {navigationGroups.map((group) => {
        const visibleItems = group.items.filter(
          (item) => item.requires === undefined || can(role, item.requires),
        );
        if (visibleItems.length === 0) return null;

        return (
          <div key={group.label} className="space-y-1">
            <h2 className="px-3 pb-1 text-micro font-semibold tracking-[0.08em] text-muted-foreground/70 uppercase">
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

  const base = cn(
    'group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm',
    'transition-colors duration-[--duration-fast]',
  );

  if (!item.available) {
    return (
      <span
        className={cn(base, 'cursor-default text-sidebar-foreground/45')}
        aria-disabled="true"
        title={`${item.description} — coming soon`}
      >
        <Icon className="size-[1.125rem] shrink-0 opacity-70" aria-hidden="true" />
        <span className="flex-1 truncate">{item.label}</span>
        <span className="rounded-full border border-sidebar-border px-1.5 py-0 text-micro font-medium text-sidebar-foreground/50">
          Soon
        </span>
      </span>
    );
  }

  const isActive =
    pathname === item.href ||
    (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`));

  return (
    <Link
      href={item.href}
      {...(onNavigate !== undefined ? { onClick: onNavigate } : {})}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        base,
        'focus-ring',
        isActive
          ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'
          : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
      )}
    >
      {/* Active accent bar — scales in from the vertical centre. */}
      <span
        aria-hidden="true"
        className={cn(
          'absolute top-1/2 left-0 h-5 w-[3px] -translate-y-1/2 rounded-full bg-primary transition-transform duration-[--duration-base] ease-[--ease-spring]',
          isActive ? 'scale-y-100' : 'scale-y-0',
        )}
      />
      <Icon
        className={cn(
          'size-[1.125rem] shrink-0 transition-opacity',
          isActive ? 'text-primary opacity-100' : 'opacity-70',
        )}
        aria-hidden="true"
      />
      <span className="flex-1 truncate">{item.label}</span>
    </Link>
  );
}
