import {
  BriefcaseIcon,
  BuildingIcon,
  LayoutDashboardIcon,
  type LucideIcon,
  MessagesSquareIcon,
  SendIcon,
  SettingsIcon,
  UsersIcon,
} from '@/shared/ui/icons';

import { Permission } from '@/core/entities';
import { routes } from './routes';

/**
 * The workspace navigation, as data.
 *
 * Declaring it here rather than as markup in the sidebar means the same
 * definition drives the desktop rail, the mobile sheet, and any future command
 * palette — one edit, three surfaces.
 *
 * `available: false` marks a module that is planned but not yet built. It
 * renders visibly inert rather than linking to an empty page: showing the shape
 * of the product is useful, pretending a feature exists is not.
 */
export interface NavigationItem {
  readonly label: string;
  readonly href: string;
  readonly icon: LucideIcon;
  readonly description: string;
  readonly available: boolean;
  /** When set, the item is hidden from members who lack this permission. */
  readonly requires?: Permission;
}

export interface NavigationGroup {
  readonly label: string;
  readonly items: readonly NavigationItem[];
}

export const navigationGroups: readonly NavigationGroup[] = [
  {
    label: 'Workspace',
    items: [
      {
        label: 'Overview',
        href: routes.dashboard,
        icon: LayoutDashboardIcon,
        description: 'Your workspace at a glance',
        available: true,
      },
    ],
  },
  {
    label: 'Trade network',
    items: [
      {
        label: 'Buyers',
        href: routes.buyers,
        icon: UsersIcon,
        description: 'Discover and qualify buyers',
        available: false,
      },
      {
        label: 'Suppliers',
        href: routes.suppliers,
        icon: BuildingIcon,
        description: 'Source and vet suppliers',
        available: false,
      },
    ],
  },
  {
    label: 'Pipeline',
    items: [
      {
        label: 'Conversations',
        href: routes.conversations,
        icon: MessagesSquareIcon,
        description: 'Every thread, in one place',
        available: false,
      },
      {
        label: 'Outreach',
        href: routes.outreach,
        icon: SendIcon,
        description: 'Automated, personalised sequences',
        available: false,
      },
      {
        label: 'Deals',
        href: routes.deals,
        icon: BriefcaseIcon,
        description: 'Negotiate and close',
        available: false,
      },
    ],
  },
  {
    label: 'Administration',
    items: [
      {
        label: 'Settings',
        href: routes.settings,
        icon: SettingsIcon,
        description: 'Workspace and profile',
        available: true,
      },
      {
        label: 'Members',
        href: routes.settingsMembers,
        icon: UsersIcon,
        description: 'People and roles',
        available: true,
        requires: Permission.ViewWorkspace,
      },
    ],
  },
] as const;
