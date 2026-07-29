'use client';

import { startTransition, useActionState, useMemo, useState } from 'react';

import { saveTradeProfileAction } from '@/modules/trade-profile/actions';
import { assessProfileStrength } from '@/modules/trade-profile/domain/match-quality';
import {
  LOOKING_FOR_OPTIONS,
  type LookingFor,
  TRADE_PROFILE_LIMITS,
} from '@/modules/trade-profile/domain/trade-profile';
import {
  BUSINESS_TYPES,
  CERTIFICATIONS,
  COMPANY_SIZES,
  CURRENCIES,
  INCOTERMS,
  INDUSTRIES,
  LANGUAGES,
  PAYMENT_TERMS,
} from '@/shared/data/business';
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
} from '@/shared/ui';
import { SparklesIcon } from '@/shared/ui/icons';

import { BuildingProfile } from './building-profile';
import { MatchQuality } from './match-quality';

/**
 * The Company Profile form.
 *
 * The workspace's permanent identity, captured once so every opportunity can
 * inherit it. Only three essentials show by default; everything else lives in
 * calm, labelled sections. Optional fields say so and explain why they help, and
 * every closed list — business type, industry, certifications, Incoterms,
 * payment terms, currencies, languages — is a picker, not free text.
 */
export function ProfileWizard() {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    saveTradeProfileAction,
    idleState,
  );

  const [businessTypes, setBusinessTypes] = useState<readonly string[]>([]);
  const [industry, setIndustry] = useState('');
  const [products, setProducts] = useState<readonly string[]>([]);
  const [productsDraft, setProductsDraft] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [languages, setLanguages] = useState<readonly string[]>([]);
  const [lookingFor, setLookingFor] = useState<LookingFor | null>(null);
  const [markets, setMarkets] = useState<readonly string[]>([]);
  const [incoterms, setIncoterms] = useState<readonly string[]>([]);
  const [paymentTerms, setPaymentTerms] = useState<readonly string[]>([]);
  const [currencies, setCurrencies] = useState<readonly string[]>([]);
  const [capacity, setCapacity] = useState('');
  const [moq, setMoq] = useState('');
  const [certifications, setCertifications] = useState<readonly string[]>([]);

  // Live profile strength — counts the in-progress product draft too, so the
  // meter reacts as the user types rather than only after they press Enter.
  // Declared before any early return so the hook order stays stable.
  const strength = useMemo(
    () =>
      assessProfileStrength({
        products: productsDraft.trim() ? [...products, productsDraft.trim()] : products,
        businessTypes,
        industry,
        markets,
        certifications,
        lookingFor,
        website,
        description,
        incoterms,
        paymentTerms,
        currencies,
        companySize,
        languages,
      }),
    [
      products,
      productsDraft,
      businessTypes,
      industry,
      markets,
      certifications,
      lookingFor,
      website,
      description,
      incoterms,
      paymentTerms,
      currencies,
      companySize,
      languages,
    ],
  );

  if (state.status === 'success') return <BuildingProfile />;

  const foldProducts = (): string[] => {
    const value = productsDraft.trim();
    if (value.length === 0) return [...products];
    if (products.some((item) => item.toLowerCase() === value.toLowerCase())) {
      return [...products];
    }
    return [...products, value];
  };

  const build = () => {
    const payload = {
      businessTypes,
      products: foldProducts(),
      languages,
      countries: [...markets],
      incoterms,
      paymentTerms,
      currencies,
      certifications,
      ...(industry.trim() ? { industry: industry.trim() } : {}),
      ...(companySize ? { companySize } : {}),
      ...(lookingFor ? { lookingFor } : {}),
      ...(capacity.trim() ? { productionCapacity: capacity.trim() } : {}),
      ...(moq.trim() ? { moq: moq.trim() } : {}),
      ...(website.trim() ? { website: website.trim() } : {}),
      ...(description.trim() ? { description: description.trim() } : {}),
    };

    const formData = new FormData();
    formData.set('payload', JSON.stringify(payload));
    // Programmatic dispatch of a useActionState action must run in a transition.
    startTransition(() => formAction(formData));
  };

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">
          Tell Atlas about your business
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          This is your company&rsquo;s identity — captured once, and reused across every
          search. Only the essentials are required; the rest sharpens matching.
        </p>
      </div>

      {state.status === 'error' && (
        <Alert tone="error" title="Could not save your profile" className="mb-5">
          {state.message}
        </Alert>
      )}

      {/* Live match-quality read, pinned so it stays visible while filling. */}
      <div className="sticky top-4 z-10 mb-5">
        <MatchQuality strength={strength} />
      </div>

      <div className="space-y-5">
        {/* Essentials — always visible. */}
        <div className="space-y-5 rounded-2xl border border-border/70 bg-card p-5">
          <SearchableSelect
            label="Business type"
            optional="recommended"
            hint="What best describes your company. Pick all that apply."
            options={BUSINESS_TYPES}
            values={businessTypes}
            onChange={setBusinessTypes}
            placeholder="Search business types…"
          />
          <SearchableSelect
            label="Industry"
            optional="recommended"
            hint="Your primary industry — sharpens who Atlas looks for."
            options={INDUSTRIES}
            multiple={false}
            allowCustom
            values={industry ? [industry] : []}
            onChange={(next) => setIndustry(next[next.length - 1] ?? '')}
            placeholder="Search industries…"
          />
          <TagInput
            label="What you trade"
            placeholder="e.g. Green Edamame, Frozen Mango, LED lighting"
            hint="A few of your main products. Press Enter after each."
            values={products}
            draft={productsDraft}
            onDraftChange={setProductsDraft}
            onChange={setProducts}
          />
        </div>

        <CollapsibleSection
          title="Business information"
          description="Company size, web presence, and languages."
        >
          <SearchableSelect
            label="Company size"
            optional="optional"
            options={COMPANY_SIZES}
            multiple={false}
            values={companySize ? [companySize] : []}
            onChange={(next) => setCompanySize(next[next.length - 1] ?? '')}
            placeholder="Select company size…"
          />
          <FormField
            label="Website"
            name="website"
            optional="recommended"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
            placeholder="https://your-company.com"
            hint="Helps Atlas understand your company automatically and improve matching."
            maxLength={TRADE_PROFILE_LIMITS.websiteMax}
          />
          <div className="space-y-1.5">
            <label htmlFor="cp-description" className="block text-sm font-medium">
              Company description
              <OptionalBadge level="recommended" />
            </label>
            <textarea
              id="cp-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              maxLength={TRADE_PROFILE_LIMITS.descriptionMax}
              placeholder="A sentence or two on what your company does and what makes it a good partner."
              className="w-full resize-none rounded-xl border border-input bg-background/80 px-3 py-2.5 text-sm leading-relaxed transition outline-none placeholder:text-muted-foreground/70 focus:border-primary/50 focus:ring-4 focus:ring-primary/15"
            />
            <p className="text-xs text-muted-foreground">
              Gives Atlas context it uses to match you with the right partners.
            </p>
          </div>
          <SearchableSelect
            label="Languages"
            optional="optional"
            hint="Languages your team works in — Atlas drafts outreach accordingly."
            options={LANGUAGES}
            values={languages}
            onChange={setLanguages}
            placeholder="Search languages…"
          />
        </CollapsibleSection>

        <CollapsibleSection
          title="Trade preferences"
          description="Direction, markets, and the terms you work with."
        >
          <SearchableSelect
            label="Primary trade focus"
            optional="optional"
            hint="Whether you mostly look for buyers, suppliers, or both."
            options={LOOKING_FOR_OPTIONS}
            multiple={false}
            values={lookingFor ? [lookingFor] : []}
            onChange={(next) =>
              setLookingFor((next[next.length - 1] as LookingFor | undefined) ?? null)
            }
            placeholder="Select trade focus…"
          />
          <MarketSelect
            label="Target Markets"
            optional="recommended"
            hint="Default markets Atlas searches. New opportunities inherit these."
            values={markets}
            onChange={setMarkets}
          />
          <SearchableSelect
            label="Preferred Incoterms"
            optional="optional"
            info="Incoterms define who pays for and controls shipping, insurance, and customs at each leg — e.g. FOB, CIF, DAP. Atlas uses them to pre-qualify partners on terms."
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
            info="Currencies you invoice or settle in. Streamlines quoting with partners who trade in the same currency."
            options={CURRENCIES}
            values={currencies}
            onChange={setCurrencies}
            placeholder="Search currencies…"
          />
        </CollapsibleSection>

        <CollapsibleSection
          title="Business capabilities"
          description="Capacity, order sizes, and certifications."
        >
          <FormField
            label="Production capacity"
            name="capacity"
            optional="optional"
            info="Your output over a set period — e.g. 50,000 units / month. Atlas uses it to judge whether you can fulfil large orders before matching them."
            value={capacity}
            onChange={(event) => setCapacity(event.target.value)}
            placeholder="e.g. 50,000 units / month"
            hint="Helps Atlas estimate whether your company can fulfil large orders."
            maxLength={TRADE_PROFILE_LIMITS.shortTextMax}
          />
          <FormField
            label="Minimum order quantity (MOQ)"
            name="moq"
            optional="optional"
            info="The smallest order you’ll accept — e.g. 500 units. Atlas won’t surface buyers who purchase below it."
            value={moq}
            onChange={(event) => setMoq(event.target.value)}
            placeholder="e.g. 500 units"
            hint="Avoids matching with buyers below your minimum order quantity."
            maxLength={TRADE_PROFILE_LIMITS.shortTextMax}
          />
          <SearchableSelect
            label="Certifications"
            optional="recommended"
            info="Quality and compliance credentials — e.g. ISO 9001, HACCP, FDA, Halal. Many buyers require specific ones, so listing yours widens and sharpens matches."
            hint="Improves trust and lets Atlas match buyers that require specific certifications."
            options={CERTIFICATIONS}
            allowCustom
            values={certifications}
            onChange={setCertifications}
            placeholder="Search certifications…"
          />
        </CollapsibleSection>
      </div>

      <div className="mt-8 flex justify-end">
        <Button type="button" onClick={build} loading={isPending} loadingLabel="Saving…">
          <SparklesIcon aria-hidden="true" />
          Build my Company Profile
        </Button>
      </div>
    </div>
  );
}
