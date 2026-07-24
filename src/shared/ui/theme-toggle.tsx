'use client';

import { useTheme } from 'next-themes';

import { Button } from './button';
import { MonitorIcon, MoonIcon, SunIcon } from './icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { cn } from './utils/cn';

const OPTIONS = [
  { value: 'light', label: 'Light', icon: SunIcon },
  { value: 'dark', label: 'Dark', icon: MoonIcon },
  { value: 'system', label: 'System', icon: MonitorIcon },
] as const;

/**
 * Appearance switcher.
 *
 * The trigger icon is chosen by CSS, not JavaScript. The server cannot know the
 * user's theme, so picking the icon during render would either cause a
 * hydration mismatch or require a mount flag — and a mount flag means calling
 * setState inside an effect, which triggers a second render pass on every page.
 *
 * Since `next-themes` writes `class="dark"` onto <html> before first paint, the
 * stylesheet already knows the answer. Rendering both icons and letting the
 * `dark:` variant reveal the right one is correct before hydration, costs no
 * JavaScript, and cannot flicker.
 *
 * The menu items may read `theme` freely: Radix mounts the content only when
 * the menu opens, which is necessarily after hydration.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className={cn('text-muted-foreground hover:text-foreground', className)}
        >
          <SunIcon className="size-4 dark:hidden" aria-hidden="true" />
          <MoonIcon className="hidden size-4 dark:block" aria-hidden="true" />
          <span className="sr-only">Change theme</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-[8.5rem]">
        {OPTIONS.map(({ value, label, icon: Icon }) => (
          <DropdownMenuItem
            key={value}
            onSelect={() => setTheme(value)}
            aria-current={theme === value ? 'true' : undefined}
            className={cn(theme === value && 'font-medium text-foreground')}
          >
            <Icon aria-hidden="true" />
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
