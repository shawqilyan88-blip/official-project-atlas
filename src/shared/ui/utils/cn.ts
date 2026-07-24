import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges class names, resolving Tailwind conflicts by precedence.
 *
 * Plain concatenation leaves both `p-2` and `p-4` in the class list and lets
 * stylesheet order decide, which makes a component's `className` override
 * unreliable. `twMerge` keeps the last conflicting utility, so a caller can
 * always override a default.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
