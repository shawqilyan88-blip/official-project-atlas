'use client';

import { Button } from './button';
import { Dialog, DialogContent } from './dialog';

/**
 * A confirm-or-cancel dialog for irreversible actions — the project's
 * replacement for `window.confirm`. Built on the Radix {@link Dialog}, so it
 * traps focus, closes on Escape, and restores focus to the trigger, none of
 * which the native prompt offered. Cancel comes first in the DOM, so focus
 * lands on the safe choice rather than the destructive one.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'default',
  loading = false,
  onConfirm,
}: {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly title: string;
  readonly description?: string;
  readonly confirmLabel?: string;
  readonly cancelLabel?: string;
  readonly tone?: 'default' | 'destructive';
  readonly loading?: boolean;
  readonly onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title={title}
        titleClassName="text-base font-semibold"
        {...(description !== undefined ? { description } : {})}
        descriptionClassName="mt-1.5 text-sm leading-relaxed text-muted-foreground"
        showClose={false}
        className="max-w-sm p-5"
      >
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={tone === 'destructive' ? 'destructive' : 'primary'}
            onClick={onConfirm}
            loading={loading}
            loadingLabel="Working…"
          >
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
