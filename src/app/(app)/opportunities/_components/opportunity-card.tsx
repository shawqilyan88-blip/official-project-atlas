'use client';

import Link from 'next/link';
import { useRef } from 'react';

import {
  deleteOpportunityAction,
  duplicateOpportunityAction,
  setOpportunityStatusAction,
} from '@/modules/trade-opportunity/actions';
import {
  OBJECTIVE_LABEL,
  type OpportunityStatus,
  STATUS_LABEL,
  type TradeObjective,
} from '@/modules/trade-opportunity/domain/trade-opportunity';
import { routes } from '@/shared/config/routes';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  cn,
} from '@/shared/ui';
import {
  ArchiveIcon,
  ArchiveRestoreIcon,
  BuildingIcon,
  CopyIcon,
  Globe2Icon,
  type LucideIcon,
  MoreHorizontalIcon,
  PencilIcon,
  Trash2Icon,
  UsersIcon,
} from '@/shared/ui/icons';

export interface OpportunityCardData {
  readonly id: string;
  readonly name: string;
  readonly objective: TradeObjective;
  readonly product: string | null;
  readonly category: string | null;
  readonly targetMarkets: readonly string[];
  readonly status: OpportunityStatus;
  readonly updatedLabel: string;
}

const OBJECTIVE_ICON: Readonly<Record<TradeObjective, LucideIcon>> = {
  find_buyers: UsersIcon,
  find_suppliers: BuildingIcon,
  both: Globe2Icon,
};

const STATUS_STYLE: Readonly<Record<OpportunityStatus, string>> = {
  draft: 'border-border/70 bg-muted/50 text-muted-foreground',
  active: 'border-success/30 bg-success/10 text-success',
  archived: 'border-border/60 bg-transparent text-muted-foreground/70',
};

export function OpportunityCard({ opportunity }: { opportunity: OpportunityCardData }) {
  const href = `${routes.opportunities}/${opportunity.id}`;
  const Icon = OBJECTIVE_ICON[opportunity.objective];

  const summary = [
    opportunity.product,
    opportunity.targetMarkets.length > 0 ? opportunity.targetMarkets.join(', ') : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <article
      className={cn(
        'hover-lift group relative flex flex-col rounded-2xl border border-border/70 bg-card p-4 hover:border-border',
        opportunity.status === 'archived' && 'opacity-75',
      )}
    >
      {/* Stretched link makes the whole card open the editor; the menu sits above it. */}
      <Link
        href={href}
        aria-label={`Open ${opportunity.name}`}
        className="absolute inset-0 rounded-2xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      />

      <div className="pointer-events-none relative flex items-start gap-3">
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
          aria-hidden="true"
        >
          <Icon className="size-[1.125rem]" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold">{opportunity.name}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {OBJECTIVE_LABEL[opportunity.objective]}
          </p>
        </div>
      </div>

      {summary.length > 0 && (
        <p className="pointer-events-none relative mt-3 line-clamp-2 text-[0.8125rem] leading-relaxed text-muted-foreground">
          {summary}
        </p>
      )}

      <div className="pointer-events-none relative mt-3 flex items-center gap-2 pt-1">
        <span
          className={cn(
            'rounded-full border px-2 py-0.5 text-[0.625rem] font-medium',
            STATUS_STYLE[opportunity.status],
          )}
        >
          {STATUS_LABEL[opportunity.status]}
        </span>
        <span className="text-[0.6875rem] text-muted-foreground/70">
          {opportunity.updatedLabel}
        </span>
      </div>

      <div className="absolute top-3 right-3">
        <OpportunityMenu opportunity={opportunity} href={href} />
      </div>
    </article>
  );
}

function OpportunityMenu({
  opportunity,
  href,
}: {
  opportunity: OpportunityCardData;
  href: string;
}) {
  const duplicateForm = useRef<HTMLFormElement>(null);
  const statusForm = useRef<HTMLFormElement>(null);
  const deleteForm = useRef<HTMLFormElement>(null);

  const isArchived = opportunity.status === 'archived';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground hover:text-foreground"
          aria-label={`Actions for ${opportunity.name}`}
        >
          <MoreHorizontalIcon className="size-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[12rem]">
        <DropdownMenuItem asChild>
          <Link href={`${href}/edit`}>
            <PencilIcon aria-hidden="true" />
            Edit brief
          </Link>
        </DropdownMenuItem>

        {/* Each mutation is a real form post; onSelect keeps the menu mounted long
            enough for requestSubmit to fire (see user-menu for the rationale). */}
        <form ref={duplicateForm} action={duplicateOpportunityAction}>
          <input type="hidden" name="id" value={opportunity.id} />
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              duplicateForm.current?.requestSubmit();
            }}
          >
            <CopyIcon aria-hidden="true" />
            Duplicate
          </DropdownMenuItem>
        </form>

        <form ref={statusForm} action={setOpportunityStatusAction}>
          <input type="hidden" name="id" value={opportunity.id} />
          <input type="hidden" name="status" value={isArchived ? 'draft' : 'archived'} />
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              statusForm.current?.requestSubmit();
            }}
          >
            {isArchived ? (
              <>
                <ArchiveRestoreIcon aria-hidden="true" />
                Restore
              </>
            ) : (
              <>
                <ArchiveIcon aria-hidden="true" />
                Archive
              </>
            )}
          </DropdownMenuItem>
        </form>

        <DropdownMenuSeparator />

        <form ref={deleteForm} action={deleteOpportunityAction}>
          <input type="hidden" name="id" value={opportunity.id} />
          <DropdownMenuItem
            variant="destructive"
            onSelect={(event) => {
              event.preventDefault();
              deleteForm.current?.requestSubmit();
            }}
          >
            <Trash2Icon aria-hidden="true" />
            Delete
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
