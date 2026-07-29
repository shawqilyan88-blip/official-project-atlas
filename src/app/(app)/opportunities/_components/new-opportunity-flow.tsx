'use client';

import { useState } from 'react';

import type { UploadedDocument } from '@/modules/trade-profile/actions';
import type {
  TradeObjective,
  TradeOpportunityDraft,
} from '@/modules/trade-opportunity/domain/trade-opportunity';
import { Badge, cn } from '@/shared/ui';
import {
  ArrowRightIcon,
  BuildingIcon,
  CopyIcon,
  Globe2Icon,
  type LucideIcon,
  PencilIcon,
  SparklesIcon,
  UploadCloudIcon,
  UsersIcon,
} from '@/shared/ui/icons';

import { DuplicatePicker, type DuplicableOpportunity } from './duplicate-picker';
import { LoiUpload } from './loi-upload';
import { OpportunityEditor } from './opportunity-editor';

/**
 * The Trade Opportunity creation flow — the product's core workflow entry.
 *
 * It removes the old ambiguity ("find buyers? find suppliers? make an
 * opportunity?") by asking two simple things: the direction of trade, then how
 * you want to start it — from a document, from a blank brief, or from a past
 * opportunity. Buyers and suppliers stop being rival buttons; they become the
 * *result* of the opportunity the user is now creating.
 */
type Phase = 'choose' | 'loi' | 'manual' | 'duplicate';

interface Direction {
  readonly value: TradeObjective;
  readonly label: string;
  readonly hint: string;
  readonly icon: LucideIcon;
}

const DIRECTIONS: readonly Direction[] = [
  {
    value: 'find_buyers',
    label: 'Find Buyers',
    hint: 'Companies to sell your products to',
    icon: UsersIcon,
  },
  {
    value: 'find_suppliers',
    label: 'Find Suppliers',
    hint: 'Companies to source products from',
    icon: BuildingIcon,
  },
  {
    value: 'both',
    label: 'Both',
    hint: 'Buyers and suppliers',
    icon: Globe2Icon,
  },
];

export function NewOpportunityFlow({
  baseDraft,
  inheritedMarkets,
  existing,
}: {
  readonly baseDraft: TradeOpportunityDraft;
  readonly inheritedMarkets: readonly string[];
  readonly existing: readonly DuplicableOpportunity[];
}) {
  const [phase, setPhase] = useState<Phase>('choose');
  const [objective, setObjective] = useState<TradeObjective>(baseDraft.objective);
  const [documents, setDocuments] = useState<readonly UploadedDocument[]>([]);

  if (phase === 'manual') {
    return (
      <OpportunityEditor
        initialDraft={{ ...baseDraft, objective }}
        inheritedMarkets={inheritedMarkets}
      />
    );
  }

  if (phase === 'loi') {
    return (
      <LoiUpload
        documents={documents}
        onUploaded={(document) => setDocuments((current) => [document, ...current])}
        onContinue={() => setPhase('manual')}
        onBack={() => setPhase('choose')}
      />
    );
  }

  if (phase === 'duplicate') {
    return <DuplicatePicker opportunities={existing} onBack={() => setPhase('choose')} />;
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-7 text-center">
        <Badge
          tone="brand"
          className="mb-5 border-primary/25 bg-primary/[0.07] px-3 py-1"
        >
          <SparklesIcon className="size-3.5" aria-hidden="true" />
          New Trade Opportunity
        </Badge>
        <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
          What would you like to accomplish?
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          Set the goal, then choose how Atlas should understand it. Every opportunity
          becomes a live search for buyers or suppliers.
        </p>
      </div>

      {/* Direction */}
      <div
        className="animate-rise grid gap-2.5 sm:grid-cols-3"
        style={{ ['--rise-delay' as string]: '40ms' }}
      >
        {DIRECTIONS.map((direction) => {
          const Icon = direction.icon;
          const selected = objective === direction.value;
          return (
            <button
              key={direction.value}
              type="button"
              onClick={() => setObjective(direction.value)}
              aria-pressed={selected}
              className={cn(
                'flex flex-col items-start gap-1.5 rounded-2xl border p-4 text-left transition-all duration-[--duration-fast]',
                selected
                  ? 'border-primary/60 bg-primary/[0.06] ring-2 ring-primary/20'
                  : 'border-border bg-card hover:border-border/80 hover:bg-muted/40',
              )}
            >
              <span
                className={cn(
                  'flex size-9 items-center justify-center rounded-xl',
                  selected
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-primary/10 text-primary',
                )}
                aria-hidden="true"
              >
                <Icon className="size-[1.125rem]" />
              </span>
              <span className="text-sm font-semibold">{direction.label}</span>
              <span className="text-xs leading-tight text-muted-foreground">
                {direction.hint}
              </span>
            </button>
          );
        })}
      </div>

      {/* Method */}
      <p className="mt-7 mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        How should Atlas understand this opportunity?
      </p>
      <div className="space-y-3">
        <MethodCard
          icon={UploadCloudIcon}
          title="Upload a business document"
          body="Drop an LOI, RFQ, purchase order, product spec, company profile, or catalog. Atlas stores it securely and will pre-fill the opportunity once document analysis is live."
          meta="Recommended · fastest"
          recommended
          delay={100}
          onClick={() => setPhase('loi')}
        />
        <MethodCard
          icon={PencilIcon}
          title="Fill manually"
          body="Complete a short, professional trade brief — product, markets, terms, and requirements. Your company profile is already filled in."
          meta="A couple of minutes"
          delay={160}
          onClick={() => setPhase('manual')}
        />
        <MethodCard
          icon={CopyIcon}
          title="Use a saved opportunity"
          body={
            existing.length > 0
              ? 'Start from a past opportunity and adjust it — reuse a proven search as a template.'
              : 'Once you have opportunities, reuse one as a template here.'
          }
          meta={existing.length > 0 ? `${existing.length} available` : 'None yet'}
          disabled={existing.length === 0}
          delay={220}
          onClick={() => setPhase('duplicate')}
        />
      </div>
    </div>
  );
}

function MethodCard({
  icon: Icon,
  title,
  body,
  meta,
  recommended = false,
  disabled = false,
  delay,
  onClick,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  meta: string;
  recommended?: boolean;
  disabled?: boolean;
  delay: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{ ['--rise-delay' as string]: `${delay}ms` }}
      className={cn(
        'hover-lift animate-rise group relative flex w-full items-start gap-4 rounded-2xl border p-5 text-left',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
        disabled
          ? 'cursor-not-allowed border-border/60 bg-card/50 opacity-60'
          : recommended
            ? 'border-primary/30 bg-primary/[0.04] hover:border-primary/50'
            : 'border-border bg-card hover:border-border/80',
      )}
    >
      <span
        className={cn(
          'flex size-11 shrink-0 items-center justify-center rounded-xl',
          recommended && !disabled
            ? 'bg-primary text-primary-foreground'
            : 'bg-primary/10 text-primary',
        )}
        aria-hidden="true"
      >
        <Icon className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">{title}</h2>
          {recommended && (
            <span className="rounded-full bg-primary px-1.5 py-0 text-[0.5625rem] font-semibold text-primary-foreground">
              Recommended
            </span>
          )}
        </div>
        <p className="mt-1 text-[0.8125rem] leading-relaxed text-muted-foreground">
          {body}
        </p>
        <span className="mt-2 inline-block text-xs font-medium text-muted-foreground">
          {meta}
        </span>
      </div>
      {!disabled && (
        <ArrowRightIcon
          className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground"
          aria-hidden="true"
        />
      )}
    </button>
  );
}
