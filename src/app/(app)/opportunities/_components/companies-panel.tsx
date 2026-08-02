'use client';

import { useRouter } from 'next/navigation';
import { type ReactNode, useState } from 'react';

import { setCompanyStatusAction } from '@/modules/trade-opportunity/discovery-actions';
import {
  COMPANY_STATUS_LABEL,
  type CompanyStatus,
  type OpportunityCompany,
} from '@/modules/trade-opportunity/domain/opportunity-company';
import type { TradeObjective } from '@/modules/trade-opportunity/domain/trade-opportunity';
import { idleState } from '@/shared/lib/action-state';
import { Alert, cn } from '@/shared/ui';
import {
  ArrowUpRightIcon,
  BuildingIcon,
  CheckIcon,
  ClockIcon,
  Loader2Icon,
  TargetIcon,
  UsersIcon,
  XIcon,
} from '@/shared/ui/icons';

/**
 * The Companies tab — where discovered buyers and suppliers will be qualified.
 *
 * Discovery is not live yet, and this surface says so honestly and consistently
 * with every other mention of it (Overview, Timeline, navigation): it activates
 * soon, and when it does, ranked matches appear here automatically — no manual
 * trigger, no re-entry. The card + pipeline below light up the moment real
 * companies exist.
 */
export function CompaniesPanel({
  opportunityId,
  objective,
  companies,
}: {
  readonly opportunityId: string;
  readonly objective: TradeObjective;
  readonly companies: readonly OpportunityCompany[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const who =
    objective === 'find_suppliers'
      ? 'suppliers'
      : objective === 'both'
        ? 'buyers and suppliers'
        : 'buyers';

  const changeStatus = async (id: string, status: CompanyStatus) => {
    setBusy(id);
    setError(null);
    const fd = new FormData();
    fd.set('id', id);
    fd.set('opportunityId', opportunityId);
    fd.set('status', status);
    const res = await setCompanyStatusAction(idleState, fd);
    setBusy(null);
    if (res.status === 'error') setError(res.message);
    else router.refresh();
  };

  return (
    <div className="space-y-4">
      {error !== null && (
        <Alert tone="error" title="That didn’t go through">
          {error}
        </Alert>
      )}

      {companies.length === 0 ? (
        <section className="flex flex-col items-center rounded-2xl border border-dashed border-border/70 bg-card/50 px-6 py-14 text-center">
          <span
            className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"
            aria-hidden="true"
          >
            <UsersIcon className="size-6" />
          </span>
          <h3 className="text-base font-semibold">Discovery activates soon</h3>
          <p className="mt-1.5 max-w-md text-sm leading-relaxed text-balance text-muted-foreground">
            When it’s live, {who} matched to this opportunity appear here automatically —
            ranked by fit and ready to qualify. Your brief is ready, so nothing will need
            re-entering.
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-border/60 px-2.5 py-1 text-[0.6875rem] font-medium text-muted-foreground">
            <ClockIcon className="size-3" aria-hidden="true" />
            Activating soon
          </span>
        </section>
      ) : (
        <ul className="space-y-2.5">
          {companies.map((company) => (
            <CompanyCard
              key={company.id}
              company={company}
              busy={busy === company.id}
              onStatus={(s) => changeStatus(company.id, s)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function CompanyCard({
  company,
  busy,
  onStatus,
}: {
  company: OpportunityCompany;
  busy: boolean;
  onStatus: (status: CompanyStatus) => void;
}) {
  return (
    <li
      className={cn(
        'animate-rise rounded-xl border border-border/70 bg-card p-4',
        company.status === 'rejected' && 'opacity-60',
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/50 text-muted-foreground"
          aria-hidden="true"
        >
          <BuildingIcon className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium">{company.name}</p>
            <span className="rounded-full border border-border/60 px-1.5 text-[0.625rem] font-medium text-muted-foreground capitalize">
              {company.role}
            </span>
            <StatusPill status={company.status} />
          </div>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
            {company.country && <span>{company.country}</span>}
            {company.website && (
              <a
                href={
                  company.website.startsWith('http')
                    ? company.website
                    : `https://${company.website}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 text-primary hover:underline"
              >
                {company.website.replace(/^https?:\/\//, '')}
                <ArrowUpRightIcon className="size-3" aria-hidden="true" />
              </a>
            )}
            {company.source && (
              <span className="text-muted-foreground/70">via {company.source}</span>
            )}
          </p>
        </div>
        {company.fitScore !== null && (
          <div className="shrink-0 text-right">
            <p className="text-sm font-semibold tabular-nums">{company.fitScore}</p>
            <p className="text-[0.625rem] text-muted-foreground">fit</p>
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border/50 pt-3">
        {busy && (
          <Loader2Icon
            className="size-4 animate-spin text-muted-foreground"
            aria-hidden="true"
          />
        )}
        <PipelineButton
          active={company.status === 'shortlisted'}
          disabled={busy}
          onClick={() => onStatus('shortlisted')}
          icon={<CheckIcon className="size-3.5" />}
        >
          Shortlist
        </PipelineButton>
        <PipelineButton
          active={company.status === 'qualified'}
          disabled={busy}
          onClick={() => onStatus('qualified')}
          icon={<TargetIcon className="size-3.5" />}
        >
          Qualify
        </PipelineButton>
        <PipelineButton
          active={company.status === 'rejected'}
          disabled={busy}
          onClick={() => onStatus('rejected')}
          icon={<XIcon className="size-3.5" />}
        >
          Reject
        </PipelineButton>
      </div>
    </li>
  );
}

function PipelineButton({
  active,
  disabled,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  disabled: boolean;
  onClick: () => void;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-40',
        active
          ? 'border-primary/40 bg-primary/10 text-primary'
          : 'border-border/70 text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      {icon}
      {children}
    </button>
  );
}

function StatusPill({ status }: { status: CompanyStatus }) {
  const style =
    status === 'qualified'
      ? 'border-success/30 bg-success/10 text-success'
      : status === 'rejected'
        ? 'border-border/60 text-muted-foreground/70'
        : status === 'shortlisted' || status === 'contacted'
          ? 'border-primary/30 bg-primary/10 text-primary'
          : 'border-border/70 bg-muted/50 text-muted-foreground';
  return (
    <span
      className={cn('rounded-full border px-2 py-0.5 text-[0.625rem] font-medium', style)}
    >
      {COMPANY_STATUS_LABEL[status]}
    </span>
  );
}
