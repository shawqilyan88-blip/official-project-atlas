/**
 * Illustrative content for the marketing product previews.
 *
 * **Everything in this file is invented.** The companies do not exist, the
 * shipment counts and deal values are made up, and none of it is a claim about
 * real customers or real results. It exists solely to give the interface
 * previews on the landing page something concrete to render, because an empty
 * mockup communicates nothing.
 *
 * It is deliberately isolated in one module so that replacing it with real
 * anonymised data later is a single-file change and never a hunt through JSX.
 * If any of this is ever presented as real, that is a misrepresentation — keep
 * the "sample data" caption on every preview.
 */

export type TrustGrade = 'A' | 'B' | 'C';

export interface DiscoveredCompany {
  readonly id: string;
  readonly company: string;
  readonly countryCode: string;
  readonly city: string;
  /** How well the company fits the seller's profile, 0–100. */
  readonly match: number;
  /** Verification grade derived from registry checks and trade history. */
  readonly trust: TrustGrade;
  /** The observation that caused Atlas to surface this company now. */
  readonly signal: string;
  readonly status: 'New match' | 'Contacted' | 'Replied';
}

export const DISCOVERY_QUERY = {
  product: 'Ceramic tableware',
  market: 'European Union',
  volume: '2 × 40ft / month',
} as const;

/**
 * Three rows, not four. The hero is a fixed single viewport, so every row costs
 * vertical space that the headline and call to action need more.
 */
export const DISCOVERED_COMPANIES: readonly DiscoveredCompany[] = [
  {
    id: 'harbour-point',
    company: 'Harbour Point Retail',
    countryCode: 'GB',
    city: 'Manchester',
    match: 96,
    trust: 'A',
    signal: '14 matching shipments in the last 90 days',
    status: 'New match',
  },
  {
    id: 'cedar-stone',
    company: 'Cedar & Stone Hospitality',
    countryCode: 'NL',
    city: 'Rotterdam',
    match: 92,
    trust: 'A',
    signal: 'Shifted sourcing away from a single origin',
    status: 'Replied',
  },
  {
    id: 'lakeside',
    company: 'Lakeside Hotel Group',
    countryCode: 'DE',
    city: 'Hamburg',
    match: 88,
    trust: 'B',
    signal: 'Refit tender closes in three weeks',
    status: 'Contacted',
  },
];

/** The reasoning Atlas shows for the highlighted company. */
export const MATCH_RATIONALE: readonly { label: string; detail: string }[] = [
  { label: 'Product fit', detail: 'Imports stoneware and porcelain in your grades' },
  { label: 'Volume fit', detail: 'Orders 1–3 containers per month' },
  { label: 'Terms fit', detail: 'Trades on FOB and CIF, same as you' },
];

export interface ConversationMessage {
  readonly id: string;
  readonly author: string;
  readonly initials: string;
  readonly side: 'them' | 'us';
  readonly time: string;
  readonly body: string;
  /** Marks a message Atlas drafted and is holding for approval. */
  readonly drafted?: boolean;
}

export const CONVERSATION = {
  company: 'Cedar & Stone Hospitality',
  channel: 'Email · Procurement',
  messages: [
    {
      id: 'm1',
      author: 'Sarah Whitfield',
      initials: 'SW',
      side: 'them',
      time: '09:14',
      body: 'Thanks for reaching out. Can you confirm the lead time for two containers, CIF Rotterdam?',
    },
    {
      id: 'm2',
      author: 'Atlas',
      initials: 'AT',
      side: 'us',
      time: '09:15',
      drafted: true,
      body: 'Two containers CIF Rotterdam, departing within 18 days, estimated delivery 14 March. Technical sheet and certificate of conformity attached.',
    },
  ] satisfies readonly ConversationMessage[],
} as const;

/**
 * The reasoning shown beneath the drafted reply.
 *
 * Replaced an English translation of a French draft. The translation feature is
 * real, but demonstrating it in the hero forced a visitor to read a language
 * they may not know before they understood what the product does — a
 * distraction sitting exactly where comprehension matters most.
 */
export const CONVERSATION_RATIONALE =
  'Lead time and delivery date pulled from your current stock position. Certificate attached because this buyer requested one on their last enquiry.';

export interface OutreachStep {
  readonly id: string;
  readonly label: string;
  readonly timing: string;
  readonly state: 'sent' | 'scheduled' | 'waiting';
}

export const OUTREACH_SEQUENCE: readonly OutreachStep[] = [
  { id: 's1', label: 'Introduction', timing: 'Sent Tue 09:02 CET', state: 'sent' },
  {
    id: 's2',
    label: 'Product sheet + pricing',
    timing: 'Sent Thu 09:00 CET',
    state: 'sent',
  },
  { id: 's3', label: 'Follow-up', timing: 'Holds until they reply', state: 'waiting' },
  { id: 's4', label: 'Sample offer', timing: 'Mon 08:30 local time', state: 'scheduled' },
];

export const OUTREACH_DRAFT = {
  subject: 'Stoneware tableware — EU stock, 18-day lead time',
  /** Segments marked `field` render as resolved merge fields. */
  body: [
    { text: 'Hello ' },
    { text: 'Ms Palmer', field: true },
    { text: ',\n\nYou import ' },
    { text: 'stoneware tableware', field: true },
    { text: ' through ' },
    { text: 'Rotterdam', field: true },
    {
      text: ' most quarters. We hold EU stock with an 18-day lead time and ship on FOB or CIF terms.',
    },
  ] as readonly { text: string; field?: boolean }[],
  meta: 'Sends 08:30 local time · 3 merge fields resolved',
} as const;

export interface PipelineStage {
  readonly id: string;
  readonly name: string;
  readonly deals: readonly { company: string; value: string; age: string }[];
}

export const PIPELINE: readonly PipelineStage[] = [
  {
    id: 'qualified',
    name: 'Qualified',
    deals: [
      { company: 'Fairfield Supply', value: '€48k', age: '2d' },
      { company: 'Harbour Point Retail', value: '€126k', age: '4d' },
    ],
  },
  {
    id: 'conversation',
    name: 'In conversation',
    deals: [
      { company: 'Cedar & Stone', value: '€92k', age: '6d' },
      { company: 'Lakeside Hotel Group', value: '€61k', age: '9d' },
    ],
  },
  {
    id: 'quoted',
    name: 'Quoted',
    deals: [{ company: 'Ridgeway Hotels', value: '€154k', age: '12d' }],
  },
  {
    id: 'contract',
    name: 'Contract',
    deals: [{ company: 'Meridian Home Supply', value: '€207k', age: '21d' }],
  },
];
