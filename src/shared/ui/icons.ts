'use client';

/**
 * The icon boundary.
 *
 * Every lucide icon in the application is imported from here, never from
 * `lucide-react` directly. The `'use client'` directive above must stay on the
 * first line.
 *
 * Why this module exists: `lucide-react`'s package entry re-exports its
 * `LucideProvider` from a module that calls `React.createContext` at import
 * time, and the entry itself carries no `'use client'` directive. React's
 * server build does not implement `createContext`, so a Server Component that
 * imports an icon from the package barrel pulls that call into the React Server
 * Components graph and the build fails while collecting page data:
 *
 *     TypeError: az.createContext is not a function
 *
 * Re-exporting through a module that *is* marked as client code means the
 * bundler emits client references and never evaluates `lucide-react` on the
 * server. Icons are inert SVG, so nothing is lost by rendering them this way.
 *
 * Adding an icon: add it to this list rather than importing it at the call
 * site, so a future Server Component cannot reintroduce the same break.
 */

export {
  AlertTriangleIcon,
  ArchiveIcon,
  ArchiveRestoreIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  BriefcaseIcon,
  BuildingIcon,
  CheckCircle2Icon,
  CheckIcon,
  ChevronDownIcon,
  ChevronsUpDownIcon,
  ClockIcon,
  CompassIcon,
  CopyIcon,
  CornerDownLeftIcon,
  DownloadIcon,
  EyeIcon,
  FactoryIcon,
  FileTextIcon,
  Globe2Icon,
  InfoIcon,
  LayoutDashboardIcon,
  Loader2Icon,
  LogOutIcon,
  MailCheckIcon,
  MapPinIcon,
  MenuIcon,
  MessagesSquareIcon,
  MonitorIcon,
  MoonIcon,
  MoreHorizontalIcon,
  PackageIcon,
  PencilIcon,
  PlusIcon,
  RefreshCwIcon,
  SearchIcon,
  SendIcon,
  SettingsIcon,
  ShieldCheckIcon,
  SparklesIcon,
  StarIcon,
  SunIcon,
  TargetIcon,
  Trash2Icon,
  TrendingUpIcon,
  UploadCloudIcon,
  UserIcon,
  UsersIcon,
  XCircleIcon,
  XIcon,
  ZapIcon,
} from 'lucide-react';

export type { LucideIcon } from 'lucide-react';
