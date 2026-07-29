'use client';

import Link from 'next/link';
import { startTransition, useActionState, useState } from 'react';

import { saveOpportunityAction } from '@/modules/trade-opportunity/actions';
import {
  OBJECTIVE_OPTIONS,
  OPPORTUNITY_LIMITS,
  suggestOpportunityName,
  type TradeObjective,
  type TradeOpportunityDraft,
} from '@/modules/trade-opportunity/domain/trade-opportunity';
import {
  CERTIFICATIONS,
  CURRENCIES,
  INCOTERMS,
  INDUSTRIES,
  PAYMENT_TERMS,
} from '@/shared/data/business';
import { routes } from '@/shared/config/routes';
import { type ActionState, idleState } from '@/shared/lib/action-state';
import {
  Alert,
  Button,
  CollapsibleSection,
  FormField,
  MarketSelect,
  OptionalBadge,
  SearchableSelect,
  TagInput,
  cn,
} from '@/shared/ui';
import {
  BriefcaseIcon,
  BuildingIcon,
  FileTextIcon,
  Globe2Icon,
  type LucideIcon,
  MessagesSquareIcon,
  SparklesIcon,
  TargetIcon,
  UsersIcon,
} from '@/shared/ui/icons';

/**
 * The Trade Opportunity editor.
 *
 * Only the essentials — who you are looking for, what you trade, and where —
 * are visible. Everything that merely sharpens the search folds into labelled
 * sections, every optional field says so, and closed vocabularies (category,
 * Incoterms, payment terms, currencies, certifications) are pickers, not free
 * text. Company-profile values arrive pre-filled, so nothing is re-entered.
 */
const OBJECTIVE_ICON: Readonly<Record<TradeObjective, LucideIcon>> = {
  find_buyers: UsersIcon,
  find_suppliers: BuildingIcon,
  both: Globe2Icon,
};

const FUTURE_COLLECTIONS: readonly { label: string; icon: LucideIcon }[] = [
  { label: 'Documents', icon: FileTextIcon },
  { label: 'AI research', icon: SparklesIcon },
  { label: 'Buyer list', icon: UsersIcon },
  { label: 'Supplier list', icon: BuildingIcon },
  { label: 'Conversations', icon: MessagesSquareIcon },
  { label: 'Deals', icon: BriefcaseIcon },
];

export function OpportunityEditor({
  opportunityId,
  initialDraft,
  inheritedMarkets,
}: {
  readonly opportunityId?: string;
  readonly initialDraft: TradeOpportunityDraft;
  readonly inheritedMarkets: readonly string[];
}) {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    saveOpportunityAction,
    idleState,
  );

  const [name, setName] = useState(initialDraft.name);
  const [objective, setObjective] = useState<TradeObjective>(initialDraft.objective);
  const [product, setProduct] = useState(initialDraft.product ?? '');
  const [markets, setMarkets] = useState<readonly string[]>(initialDraft.targetMarkets);
  const [category, setCategory] = useState(initialDraft.category ?? '');
  const [moq, setMoq] = useState(initialDraft.minOrderQuantity ?? '');
  const [targetPrice, setTargetPrice] = useState(initialDraft.targetPrice ?? '');
  const [incoterms, setIncoterms] = useState<readonly string[]>(initialDraft.incoterms);
  const [paymentTerms, setPaymentTerms] = useState<readonly string[]>(
    initialDraft.paymentTerms,
  );
  const [currencies, setCurrencies] = useState<readonly string[]>(
    initialDraft.currencies,
  );
  const [certifications, setCertifications] = useState<readonly string[]>(
    initialDraft.requiredCertifications,
  );
  const [keywords, setKeywords] = useState<readonly string[]>(initialDraft.keywords);
  const [keywordsDraft, setKeywordsDraft] = useState('');
  const [excludeKeywords, setExcludeKeywords] = useState<readonly string[]>(
    initialDraft.excludeKeywords,
  );
  const [excludeDraft, setExcludeDraft] = useState('');
  const [criteria, setCriteria] = useState(initialDraft.criteria ?? '');
  const [notes, setNotes] = useState(initialDraft.notes ?? '');

  const suggestedName = suggestOpportunityName({ product, objective, markets });
  const backHref = opportunityId
    ? `${routes.opportunities}/${opportunityId}`
    : routes.opportunities;

  const fold = (list: readonly string[], draft: string): string[] => {
    const value = draft.trim();
    if (value.length === 0) return [...list];
    if (list.some((item) => item.toLowerCase() === value.toLowerCase())) return [...list];
    return [...list, value];
  };

  const submit = (status: 'draft' | 'active') => {
    const payload = {
      name: name.trim() || suggestedName,
      objective,
      targetMarkets: [...markets],
      incoterms: [...incoterms],
      requiredCertifications: [...certifications],
      paymentTerms: [...paymentTerms],
      currencies: [...currencies],
      keywords: fold(keywords, keywordsDraft),
      excludeKeywords: fold(excludeKeywords, excludeDraft),
      ...(product.trim() ? { product: product.trim() } : {}),
      ...(category.trim() ? { category: category.trim() } : {}),
      ...(moq.trim() ? { minOrderQuantity: moq.trim() } : {}),
      ...(targetPrice.trim() ? { targetPrice: targetPrice.trim() } : {}),
      ...(criteria.trim() ? { criteria: criteria.trim() } : {}),
      ...(notes.trim() ? { notes: notes.trim() } : {}),
    };

    const formData = new FormData();
    formData.set('payload', JSON.stringify(payload));
    formData.set('status', status);
    if (opportunityId) formData.set('id', opportunityId);
    // Programmatic dispatch of a useActionState action must run in a transition.
    startTransition(() => formAction(formData));
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-6">
        <Link
          href={backHref}
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {opportunityId ? '← Back to opportunity' : '← Opportunities'}
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          {opportunityId ? 'Edit opportunity' : 'New Trade Opportunity'}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Tell Atlas what to pursue. It inherits your company profile — add only what is
          specific to this search.
        </p>
      </div>

      {state.status === 'error' && (
        <Alert tone="error" title="Could not save" className="mb-5">
          {state.message}
        </Alert>
      )}

      <div className="space-y-5">
        {/* Essentials — always visible. */}
        <div className="space-y-5 rounded-2xl border border-border/70 bg-card p-5">
          <div className="space-y-2">
            <span className="block text-sm font-medium">Who are you looking for?</span>
            <div className="grid gap-2.5 sm:grid-cols-3">
              {OBJECTIVE_OPTIONS.map((option) => {
                const Icon = OBJECTIVE_ICON[option.value];
                const selected = objective === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setObjective(option.value)}
                    aria-pressed={selected}
                    className={cn(
                      'flex flex-col items-start gap-1.5 rounded-xl border p-3 text-left transition-all duration-[--duration-fast]',
                      selected
                        ? 'border-primary/60 bg-primary/[0.06] ring-2 ring-primary/20'
                        : 'border-border bg-card hover:border-border/80 hover:bg-muted/40',
                    )}
                  >
                    <span
                      className={cn(
                        'flex size-8 items-center justify-center rounded-lg',
                        selected
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-primary/10 text-primary',
                      )}
                      aria-hidden="true"
                    >
                      <Icon className="size-4" />
                    </span>
                    <span className="text-sm font-medium">{option.label}</span>
                    <span className="text-[0.6875rem] leading-tight text-muted-foreground">
                      {option.hint}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <FormField
            label="Product or service"
            name="product"
            value={product}
            onChange={(event) => setProduct(event.target.value)}
            placeholder="e.g. Green Edamame, Frozen Mango, Corrugated packaging"
            hint="What this opportunity is about. Needed before Atlas can search."
            maxLength={OPPORTUNITY_LIMITS.productMax}
          />

          <FormField
            label="Name"
            name="name"
            optional="optional"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={suggestedName}
            hint="Leave blank to use the suggested name."
            maxLength={OPPORTUNITY_LIMITS.nameMax}
          />

          <MarketSelect
            label="Target Markets"
            optional="recommended"
            hint="Select the countries or regions where Atlas should search for buyers or suppliers."
            values={markets}
            onChange={setMarkets}
          />
          {inheritedMarkets.length > 0 && (
            <p className="-mt-2 text-xs text-muted-foreground">
              Pre-filled from your company profile — adjust for this search.
            </p>
          )}
        </div>

        <CollapsibleSection
          title="Trade preferences"
          description="Category, terms, and requirements that sharpen matching."
        >
          <SearchableSelect
            label="Product category"
            optional="recommended"
            hint="Helps Atlas place your search in the right market segment."
            options={INDUSTRIES}
            multiple={false}
            allowCustom
            values={category ? [category] : []}
            onChange={(next) => setCategory(next[next.length - 1] ?? '')}
            placeholder="Search categories…"
          />

          <SearchableSelect
            label="Required certifications"
            optional="recommended"
            info="Credentials a partner must hold for this deal — e.g. ISO 9001, HACCP, FDA, Halal. Atlas only surfaces counterparties that qualify."
            hint="Improves trust and lets Atlas match buyers that require specific certifications."
            options={CERTIFICATIONS}
            allowCustom
            values={certifications}
            onChange={setCertifications}
            placeholder="Search certifications…"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Minimum order (MOQ)"
              name="moq"
              optional="optional"
              info="The smallest order worth pursuing for this opportunity — e.g. 500 cartons. Atlas won’t surface buyers below it."
              value={moq}
              onChange={(event) => setMoq(event.target.value)}
              placeholder="e.g. 500 cartons"
              hint="Avoids matching with buyers below your minimum order quantity."
              maxLength={OPPORTUNITY_LIMITS.shortTextMax}
            />
            <FormField
              label="Target price"
              name="targetPrice"
              optional="optional"
              value={targetPrice}
              onChange={(event) => setTargetPrice(event.target.value)}
              placeholder="e.g. $2.10 / kg FOB"
              maxLength={OPPORTUNITY_LIMITS.shortTextMax}
            />
          </div>

          <SearchableSelect
            label="Preferred Incoterms"
            optional="optional"
            info="Incoterms define who pays for and controls shipping, insurance, and customs at each leg — e.g. FOB, CIF, DAP. Atlas pre-qualifies partners on the terms you set."
            options={INCOTERMS}
            values={incoterms}
            onChange={setIncoterms}
            placeholder="Search Incoterms…"
          />
          <SearchableSelect
            label="Payment terms"
            optional="optional"
            info="How and when payment is settled — e.g. T/T in advance, L/C at sight, 30% deposit. Atlas filters out partners who can’t meet them."
            options={PAYMENT_TERMS}
            values={paymentTerms}
            onChange={setPaymentTerms}
            placeholder="Search payment terms…"
          />
          <SearchableSelect
            label="Currencies"
            optional="optional"
            info="Currencies you’ll quote or settle in for this opportunity. Streamlines matching with partners who trade in the same currency."
            options={CURRENCIES}
            values={currencies}
            onChange={setCurrencies}
            placeholder="Search currencies…"
          />
        </CollapsibleSection>

        <CollapsibleSection
          title="Advanced preferences"
          description="Fine-tune exactly who Atlas surfaces."
        >
          <TagInput
            label="Keywords to include"
            placeholder="e.g. organic, private label, retail-ready"
            values={keywords}
            draft={keywordsDraft}
            onDraftChange={setKeywordsDraft}
            onChange={setKeywords}
          />
          <TagInput
            label="Keywords to exclude"
            placeholder="e.g. used, refurbished"
            values={excludeKeywords}
            draft={excludeDraft}
            onDraftChange={setExcludeDraft}
            onChange={setExcludeKeywords}
          />
          <div className="space-y-1.5">
            <label htmlFor="opp-criteria" className="block text-sm font-medium">
              Ideal buyer / supplier criteria
              <OptionalBadge level="optional" />
            </label>
            <textarea
              id="opp-criteria"
              value={criteria}
              onChange={(event) => setCriteria(event.target.value)}
              rows={3}
              maxLength={OPPORTUNITY_LIMITS.criteriaMax}
              placeholder="Describe the counterparties you want — size, region, buying signals, anything Atlas should weigh."
              className="w-full resize-none rounded-xl border border-input bg-background/80 px-3 py-2.5 text-sm leading-relaxed transition outline-none placeholder:text-muted-foreground/70 focus:border-primary/50 focus:ring-4 focus:ring-primary/15"
            />
          </div>
        </CollapsibleSection>

        <div className="space-y-1.5">
          <label htmlFor="opp-notes" className="block text-sm font-medium">
            Notes
            <OptionalBadge level="optional" />
          </label>
          <textarea
            id="opp-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={3}
            maxLength={OPPORTUNITY_LIMITS.notesMax}
            placeholder="Anything you want to remember about this opportunity."
            className="w-full resize-none rounded-xl border border-input bg-background/80 px-3 py-2.5 text-sm leading-relaxed transition outline-none placeholder:text-muted-foreground/70 focus:border-primary/50 focus:ring-4 focus:ring-primary/15"
          />
        </div>

        <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-4">
          <p className="mb-3 text-xs font-medium text-muted-foreground">
            Coming to each opportunity
          </p>
          <ul className="flex flex-wrap gap-2">
            {FUTURE_COLLECTIONS.map(({ label, icon: Icon }) => (
              <li
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/50 px-2.5 py-1 text-xs text-muted-foreground/80"
              >
                <Icon className="size-3.5" aria-hidden="true" />
                {label}
                <span className="rounded-full bg-muted px-1 text-[0.5625rem] font-medium text-muted-foreground">
                  Soon
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button asChild variant="ghost">
          <Link href={backHref}>Cancel</Link>
        </Button>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={() => submit('draft')}
            loading={isPending}
            loadingLabel="Saving…"
          >
            Save as draft
          </Button>
          <Button type="button" onClick={() => submit('active')} disabled={isPending}>
            <TargetIcon aria-hidden="true" />
            {opportunityId ? 'Save & activate' : 'Create opportunity'}
          </Button>
        </div>
      </div>
    </div>
  );
}
