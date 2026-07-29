/**
 * The market universe for the Target Markets selector.
 *
 * Two kinds of option live here: business *regions* (Global, Asia, Europe, …)
 * and every *country*, each with its ISO 3166-1 alpha-2 code so the UI can show
 * an SVG flag via `flag-icons`. Values are the human-readable label (a country
 * name or a region name), which is what persists in `target_markets` — readable
 * in the database and stable across the profile and every opportunity.
 *
 * `Global` is special: it means "everywhere", so the selector never lets it sit
 * alongside specific markets.
 */

export const GLOBAL_VALUE = 'Global';

export const REGION_VALUES = [
  'Global',
  'Asia',
  'Southeast Asia',
  'East Asia',
  'Europe',
  'Middle East',
  'Africa',
  'North America',
  'South America',
  'Oceania',
] as const;

export type RegionValue = (typeof REGION_VALUES)[number];

interface CountryEntry {
  readonly code: string;
  readonly name: string;
  /** Extra search terms — common short names and spellings. */
  readonly keywords?: string;
}

/** Every country, ordered alphabetically. Codes are ISO 3166-1 alpha-2. */
export const COUNTRIES: readonly CountryEntry[] = [
  { code: 'af', name: 'Afghanistan' },
  { code: 'al', name: 'Albania' },
  { code: 'dz', name: 'Algeria' },
  { code: 'ad', name: 'Andorra' },
  { code: 'ao', name: 'Angola' },
  { code: 'ag', name: 'Antigua and Barbuda' },
  { code: 'ar', name: 'Argentina' },
  { code: 'am', name: 'Armenia' },
  { code: 'au', name: 'Australia' },
  { code: 'at', name: 'Austria' },
  { code: 'az', name: 'Azerbaijan' },
  { code: 'bs', name: 'Bahamas' },
  { code: 'bh', name: 'Bahrain' },
  { code: 'bd', name: 'Bangladesh' },
  { code: 'bb', name: 'Barbados' },
  { code: 'by', name: 'Belarus' },
  { code: 'be', name: 'Belgium' },
  { code: 'bz', name: 'Belize' },
  { code: 'bj', name: 'Benin' },
  { code: 'bt', name: 'Bhutan' },
  { code: 'bo', name: 'Bolivia' },
  { code: 'ba', name: 'Bosnia and Herzegovina' },
  { code: 'bw', name: 'Botswana' },
  { code: 'br', name: 'Brazil' },
  { code: 'bn', name: 'Brunei' },
  { code: 'bg', name: 'Bulgaria' },
  { code: 'bf', name: 'Burkina Faso' },
  { code: 'bi', name: 'Burundi' },
  { code: 'kh', name: 'Cambodia' },
  { code: 'cm', name: 'Cameroon' },
  { code: 'ca', name: 'Canada' },
  { code: 'cv', name: 'Cape Verde' },
  { code: 'cf', name: 'Central African Republic' },
  { code: 'td', name: 'Chad' },
  { code: 'cl', name: 'Chile' },
  { code: 'cn', name: 'China', keywords: 'prc mainland' },
  { code: 'co', name: 'Colombia' },
  { code: 'km', name: 'Comoros' },
  { code: 'cg', name: 'Congo - Brazzaville' },
  { code: 'cd', name: 'Congo - Kinshasa', keywords: 'drc democratic republic' },
  { code: 'cr', name: 'Costa Rica' },
  { code: 'ci', name: "Côte d'Ivoire", keywords: 'ivory coast' },
  { code: 'hr', name: 'Croatia' },
  { code: 'cu', name: 'Cuba' },
  { code: 'cy', name: 'Cyprus' },
  { code: 'cz', name: 'Czechia', keywords: 'czech republic' },
  { code: 'dk', name: 'Denmark' },
  { code: 'dj', name: 'Djibouti' },
  { code: 'dm', name: 'Dominica' },
  { code: 'do', name: 'Dominican Republic' },
  { code: 'ec', name: 'Ecuador' },
  { code: 'eg', name: 'Egypt' },
  { code: 'sv', name: 'El Salvador' },
  { code: 'gq', name: 'Equatorial Guinea' },
  { code: 'er', name: 'Eritrea' },
  { code: 'ee', name: 'Estonia' },
  { code: 'sz', name: 'Eswatini', keywords: 'swaziland' },
  { code: 'et', name: 'Ethiopia' },
  { code: 'fj', name: 'Fiji' },
  { code: 'fi', name: 'Finland' },
  { code: 'fr', name: 'France' },
  { code: 'ga', name: 'Gabon' },
  { code: 'gm', name: 'Gambia' },
  { code: 'ge', name: 'Georgia' },
  { code: 'de', name: 'Germany', keywords: 'deutschland' },
  { code: 'gh', name: 'Ghana' },
  { code: 'gr', name: 'Greece' },
  { code: 'gd', name: 'Grenada' },
  { code: 'gt', name: 'Guatemala' },
  { code: 'gn', name: 'Guinea' },
  { code: 'gw', name: 'Guinea-Bissau' },
  { code: 'gy', name: 'Guyana' },
  { code: 'ht', name: 'Haiti' },
  { code: 'hn', name: 'Honduras' },
  { code: 'hk', name: 'Hong Kong SAR' },
  { code: 'hu', name: 'Hungary' },
  { code: 'is', name: 'Iceland' },
  { code: 'in', name: 'India', keywords: 'bharat' },
  { code: 'id', name: 'Indonesia' },
  { code: 'ir', name: 'Iran' },
  { code: 'iq', name: 'Iraq' },
  { code: 'ie', name: 'Ireland' },
  { code: 'il', name: 'Israel' },
  { code: 'it', name: 'Italy' },
  { code: 'jm', name: 'Jamaica' },
  { code: 'jp', name: 'Japan' },
  { code: 'jo', name: 'Jordan' },
  { code: 'kz', name: 'Kazakhstan' },
  { code: 'ke', name: 'Kenya' },
  { code: 'ki', name: 'Kiribati' },
  { code: 'xk', name: 'Kosovo' },
  { code: 'kw', name: 'Kuwait' },
  { code: 'kg', name: 'Kyrgyzstan' },
  { code: 'la', name: 'Laos' },
  { code: 'lv', name: 'Latvia' },
  { code: 'lb', name: 'Lebanon' },
  { code: 'ls', name: 'Lesotho' },
  { code: 'lr', name: 'Liberia' },
  { code: 'ly', name: 'Libya' },
  { code: 'li', name: 'Liechtenstein' },
  { code: 'lt', name: 'Lithuania' },
  { code: 'lu', name: 'Luxembourg' },
  { code: 'mo', name: 'Macao SAR' },
  { code: 'mg', name: 'Madagascar' },
  { code: 'mw', name: 'Malawi' },
  { code: 'my', name: 'Malaysia' },
  { code: 'mv', name: 'Maldives' },
  { code: 'ml', name: 'Mali' },
  { code: 'mt', name: 'Malta' },
  { code: 'mh', name: 'Marshall Islands' },
  { code: 'mr', name: 'Mauritania' },
  { code: 'mu', name: 'Mauritius' },
  { code: 'mx', name: 'Mexico' },
  { code: 'fm', name: 'Micronesia' },
  { code: 'md', name: 'Moldova' },
  { code: 'mc', name: 'Monaco' },
  { code: 'mn', name: 'Mongolia' },
  { code: 'me', name: 'Montenegro' },
  { code: 'ma', name: 'Morocco' },
  { code: 'mz', name: 'Mozambique' },
  { code: 'mm', name: 'Myanmar', keywords: 'burma' },
  { code: 'na', name: 'Namibia' },
  { code: 'nr', name: 'Nauru' },
  { code: 'np', name: 'Nepal' },
  { code: 'nl', name: 'Netherlands', keywords: 'holland' },
  { code: 'nz', name: 'New Zealand' },
  { code: 'ni', name: 'Nicaragua' },
  { code: 'ne', name: 'Niger' },
  { code: 'ng', name: 'Nigeria' },
  { code: 'kp', name: 'North Korea', keywords: 'dprk' },
  { code: 'mk', name: 'North Macedonia', keywords: 'macedonia' },
  { code: 'no', name: 'Norway' },
  { code: 'om', name: 'Oman' },
  { code: 'pk', name: 'Pakistan' },
  { code: 'pw', name: 'Palau' },
  { code: 'ps', name: 'Palestine' },
  { code: 'pa', name: 'Panama' },
  { code: 'pg', name: 'Papua New Guinea' },
  { code: 'py', name: 'Paraguay' },
  { code: 'pe', name: 'Peru' },
  { code: 'ph', name: 'Philippines' },
  { code: 'pl', name: 'Poland' },
  { code: 'pt', name: 'Portugal' },
  { code: 'qa', name: 'Qatar' },
  { code: 'ro', name: 'Romania' },
  { code: 'ru', name: 'Russia', keywords: 'russian federation' },
  { code: 'rw', name: 'Rwanda' },
  { code: 'kn', name: 'Saint Kitts and Nevis' },
  { code: 'lc', name: 'Saint Lucia' },
  { code: 'vc', name: 'Saint Vincent and the Grenadines' },
  { code: 'ws', name: 'Samoa' },
  { code: 'sm', name: 'San Marino' },
  { code: 'st', name: 'São Tomé and Príncipe' },
  { code: 'sa', name: 'Saudi Arabia', keywords: 'ksa' },
  { code: 'sn', name: 'Senegal' },
  { code: 'rs', name: 'Serbia' },
  { code: 'sc', name: 'Seychelles' },
  { code: 'sl', name: 'Sierra Leone' },
  { code: 'sg', name: 'Singapore' },
  { code: 'sk', name: 'Slovakia' },
  { code: 'si', name: 'Slovenia' },
  { code: 'sb', name: 'Solomon Islands' },
  { code: 'so', name: 'Somalia' },
  { code: 'za', name: 'South Africa' },
  { code: 'kr', name: 'South Korea', keywords: 'korea republic rok' },
  { code: 'ss', name: 'South Sudan' },
  { code: 'es', name: 'Spain', keywords: 'españa' },
  { code: 'lk', name: 'Sri Lanka' },
  { code: 'sd', name: 'Sudan' },
  { code: 'sr', name: 'Suriname' },
  { code: 'se', name: 'Sweden' },
  { code: 'ch', name: 'Switzerland' },
  { code: 'sy', name: 'Syria' },
  { code: 'tw', name: 'Taiwan' },
  { code: 'tj', name: 'Tajikistan' },
  { code: 'tz', name: 'Tanzania' },
  { code: 'th', name: 'Thailand' },
  { code: 'tl', name: 'Timor-Leste', keywords: 'east timor' },
  { code: 'tg', name: 'Togo' },
  { code: 'to', name: 'Tonga' },
  { code: 'tt', name: 'Trinidad and Tobago' },
  { code: 'tn', name: 'Tunisia' },
  { code: 'tr', name: 'Türkiye', keywords: 'turkey' },
  { code: 'tm', name: 'Turkmenistan' },
  { code: 'tv', name: 'Tuvalu' },
  { code: 'ug', name: 'Uganda' },
  { code: 'ua', name: 'Ukraine' },
  { code: 'ae', name: 'United Arab Emirates', keywords: 'uae emirates dubai abu dhabi' },
  { code: 'gb', name: 'United Kingdom', keywords: 'uk britain england scotland wales' },
  { code: 'us', name: 'United States', keywords: 'usa america united states of america' },
  { code: 'uy', name: 'Uruguay' },
  { code: 'uz', name: 'Uzbekistan' },
  { code: 'vu', name: 'Vanuatu' },
  { code: 've', name: 'Venezuela' },
  { code: 'vn', name: 'Vietnam', keywords: 'viet nam' },
  { code: 'ye', name: 'Yemen' },
  { code: 'zm', name: 'Zambia' },
  { code: 'zw', name: 'Zimbabwe' },
];

export type MarketKind = 'region' | 'country';

export interface MarketOption {
  readonly kind: MarketKind;
  /** The persisted value: a region name or a country name. */
  readonly value: string;
  readonly label: string;
  /** ISO alpha-2 code, present for countries — drives the flag. */
  readonly code?: string;
  /** Lower-cased haystack for search. */
  readonly search: string;
}

/** Regions first, then every country — the order shown when not searching. */
export const MARKET_OPTIONS: readonly MarketOption[] = [
  ...REGION_VALUES.map((value): MarketOption => ({
    kind: 'region',
    value,
    label: value,
    search: value.toLowerCase(),
  })),
  ...COUNTRIES.map((country): MarketOption => ({
    kind: 'country',
    value: country.name,
    label: country.name,
    code: country.code,
    search: `${country.name} ${country.code} ${country.keywords ?? ''}`.toLowerCase(),
  })),
];

export const MARKET_BY_VALUE: ReadonlyMap<string, MarketOption> = new Map(
  MARKET_OPTIONS.map((option) => [option.value, option]),
);

export function isRegionValue(value: string): boolean {
  return (REGION_VALUES as readonly string[]).includes(value);
}
