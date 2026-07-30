'use client';

import { duplicateOpportunityAction } from '@/modules/trade-opportunity/actions';
import {
  OBJECTIVE_LABEL,
  type TradeObjective,
} from '@/modules/trade-opportunity/domain/trade-opportunity';
import { cn } from '@/shared/ui';
import { Button } from '@/shared/ui';
import {
  ArrowLeftIcon,
  BuildingIcon,
  CopyIcon,
  Globe2Icon,
  type LucideIcon,
  UsersIcon,
} from '@/shared/ui/icons';

/**
 * Pick a past opportunity to start from.
 *
 * Choosing one duplicates it as a fresh draft and drops the user straight into
 * the editor of the copy — the "use as template" path, with no data re-entered.
 */
export interface DuplicableOpportunity {
  readonly id: string;
  readonly name: string;
  readonly objective: TradeObjective;
  readonly product: string | null;
}

const OBJECTIVE_ICON: Readonly<Record<TradeObjective, LucideIcon>> = {
  find_buyers: UsersIcon,
  find_suppliers: BuildingIcon,
  both: Globe2Icon,
};

export function DuplicatePicker({
  opportunities,
  onBack,
}: {
  readonly opportunities: readonly DuplicableOpportunity[];
  readonly onBack: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">Duplicate an opportunity</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Start from one you have already built. Atlas copies it as a new draft for you to
          adjust — nothing is re-entered.
        </p>
      </div>

      <ul className="space-y-2.5">
        {opportunities.map((opportunity, index) => {
          const Icon = OBJECTIVE_ICON[opportunity.objective];
          return (
            <li key={opportunity.id}>
              <form action={duplicateOpportunityAction}>
                <input type="hidden" name="id" value={opportunity.id} />
                <button
                  type="submit"
                  style={{ ['--rise-delay' as string]: `${index * 40}ms` }}
                  className={cn(
                    'hover-lift animate-rise group flex w-full items-center gap-3.5 rounded-2xl border border-border/70 bg-card p-4 text-left',
                    'focus-ring',
                  )}
                >
                  <span
                    className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
                    aria-hidden="true"
                  >
                    <Icon className="size-[1.125rem]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">
                      {opportunity.name}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {[OBJECTIVE_LABEL[opportunity.objective], opportunity.product]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                  </span>
                  <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-muted-foreground group-hover:text-foreground">
                    <CopyIcon className="size-3.5" aria-hidden="true" />
                    Duplicate
                  </span>
                </button>
              </form>
            </li>
          );
        })}
      </ul>

      <div className="mt-8">
        <Button type="button" variant="ghost" onClick={onBack}>
          <ArrowLeftIcon aria-hidden="true" />
          Back
        </Button>
      </div>
    </div>
  );
}
