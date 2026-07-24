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

export const DISCOVERED_COMPANIES: readonly DiscoveredCompany[] = [
  {
    id: 'nordwind',
    company: 'Nordwind Keramik GmbH',
    countryCode: 'DE',
    city: 'Hamburg',
    match: 96,
    trust: 'A',
    signal: '14 matching shipments in the last 90 days',
    status: 'New match',
  },
  {
    id: 'vaillant',
    company: 'Maison Vaillant SAS',
    countryCode: 'FR',
    city: 'Lyon',
    match: 92,
    trust: 'A',
    signal: 'Shifted sourcing away from a single origin',
    status: 'Replied',
  },
  {
    id: 'kestrel',
    company: 'Kestrel Hospitality Group',
    countryCode: 'GB',
    city: 'Leeds',
    match: 88,
    trust: 'B',
    signal: 'Refit tender closes in three weeks',
    status: 'Contacted',
  },
  {
    id: 'terrazza',
    company: 'Terrazza Forniture SRL',
    countryCode: 'IT',
    city: 'Bologna',
    match: 84,
    trust: 'B',
    signal: 'Warehouse capacity expanded last quarter',
    status: 'New match',
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
  company: 'Maison Vaillant SAS',
  channel: 'Email · French',
  messages: [
    {
      id: 'm1',
      author: 'Camille Vaillant',
      initials: 'CV',
      side: 'them',
      time: '09:14',
      body: 'Merci pour votre message. Pouvez-vous confirmer le délai pour 2 conteneurs en CIF Marseille ?',
    },
    {
      id: 'm2',
      author: 'Atlas',
      initials: 'AT',
      side: 'us',
      time: '09:15',
      drafted: true,
      body: 'Bonjour Camille — 2 conteneurs en CIF Marseille, départ sous 18 jours, livraison estimée au 14 mars. Je joins la fiche technique et le certificat de conformité.',
    },
  ] satisfies readonly ConversationMessage[],
} as const;

/** Translation of the drafted reply, shown beside it. */
export const CONVERSATION_TRANSLATION =
  'Hello Camille — 2 containers CIF Marseille, departing within 18 days, estimated delivery 14 March. Technical sheet and certificate of conformity attached.';

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
    { text: 'Hallo ' },
    { text: 'Frau Brandt', field: true },
    { text: ',\n\nSie importieren regelmäßig ' },
    { text: 'Steinzeug-Geschirr', field: true },
    { text: ' über ' },
    { text: 'Hamburg', field: true },
    {
      text: '. Wir halten EU-Lagerbestand mit 18 Tagen Vorlauf und liefern auf FOB oder CIF.',
    },
  ] as readonly { text: string; field?: boolean }[],
  meta: 'German · sends 08:30 Hamburg time · 3 merge fields resolved',
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
      { company: 'Terrazza Forniture', value: '€48k', age: '2d' },
      { company: 'Nordwind Keramik', value: '€126k', age: '4d' },
    ],
  },
  {
    id: 'conversation',
    name: 'In conversation',
    deals: [
      { company: 'Maison Vaillant', value: '€92k', age: '6d' },
      { company: 'Kestrel Hospitality', value: '€61k', age: '9d' },
    ],
  },
  {
    id: 'quoted',
    name: 'Quoted',
    deals: [{ company: 'Aalborg Bord A/S', value: '€154k', age: '12d' }],
  },
  {
    id: 'contract',
    name: 'Contract',
    deals: [{ company: 'Setúbal Mesa Lda', value: '€207k', age: '21d' }],
  },
];
