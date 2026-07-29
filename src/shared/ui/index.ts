/**
 * The design system's public surface. Import primitives from `@/shared/ui`.
 *
 * Feature code should never reach past this barrel into a file path, so that
 * a primitive can be restructured without touching its call sites.
 */

export { Alert, type AlertProps } from './alert';
export { Avatar, AvatarFallback, AvatarImage } from './avatar';
export { Badge, badgeVariants, type BadgeProps } from './badge';
export { Button, buttonVariants, type ButtonProps } from './button';
export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './card';
export { CollapsibleSection } from './collapsible-section';
export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from './dropdown-menu';
export { FormField, FormMessage, type FormFieldProps } from './form-field';
export { InfoTooltip } from './info-tooltip';
export { Input, type InputProps } from './input';
export { Label } from './label';
export { LogoMark, Wordmark, type WordmarkSize } from './logo';
export { MarketSelect } from './market-select';
export { OptionalBadge, type OptionalLevel } from './optional-badge';
export { PageHeader } from './page-header';
export { SearchableSelect } from './searchable-select';
export { Separator } from './separator';
export { Sheet, SheetClose, SheetContent, SheetTrigger } from './sheet';
export { Skeleton } from './skeleton';
export { TagInput } from './tag-input';
export { ThemeProvider } from './theme-provider';
export { ThemeToggle } from './theme-toggle';
export { cn } from './utils/cn';
