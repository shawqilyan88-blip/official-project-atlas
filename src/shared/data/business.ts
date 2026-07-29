/**
 * Option lists for the enterprise onboarding selectors.
 *
 * These are the closed(-ish) vocabularies a trade platform asks about: business
 * type, size, industry, certifications, Incoterms, payment terms, languages,
 * currencies. Storing the option list here — rather than as free text or a
 * Postgres enum — keeps the UI and validation in sync and lets the set grow
 * without a migration. Values persist as text/text[]; a few selectors also allow
 * a custom entry for the long tail (an "Other…" a fixed list can never cover).
 */

export interface SelectOption {
  readonly value: string;
  readonly label: string;
  /** Extra search terms (abbreviations, alternate spellings). */
  readonly keywords?: string;
}

export const BUSINESS_TYPES: readonly SelectOption[] = [
  { value: 'Manufacturer', label: 'Manufacturer' },
  { value: 'Trading Company', label: 'Trading Company' },
  { value: 'Wholesaler', label: 'Wholesaler' },
  { value: 'Distributor', label: 'Distributor' },
  { value: 'Exporter', label: 'Exporter' },
  { value: 'Importer', label: 'Importer' },
  { value: 'Retailer', label: 'Retailer' },
  { value: 'Service Provider', label: 'Service Provider' },
  { value: 'OEM', label: 'OEM', keywords: 'original equipment manufacturer' },
  { value: 'ODM', label: 'ODM', keywords: 'original design manufacturer' },
];

export const COMPANY_SIZES: readonly SelectOption[] = [
  { value: '1–10', label: '1–10 employees' },
  { value: '11–50', label: '11–50 employees' },
  { value: '51–200', label: '51–200 employees' },
  { value: '201–500', label: '201–500 employees' },
  { value: '500+', label: '500+ employees' },
];

export const INDUSTRIES: readonly SelectOption[] = [
  { value: 'Agriculture', label: 'Agriculture' },
  { value: 'Food & Beverage', label: 'Food & Beverage' },
  { value: 'Seafood', label: 'Seafood' },
  { value: 'Fresh Produce', label: 'Fresh Produce', keywords: 'fruit vegetables' },
  { value: 'Beverages', label: 'Beverages' },
  {
    value: 'Textiles & Apparel',
    label: 'Textiles & Apparel',
    keywords: 'clothing garments',
  },
  { value: 'Footwear', label: 'Footwear' },
  { value: 'Furniture', label: 'Furniture' },
  { value: 'Home & Garden', label: 'Home & Garden' },
  { value: 'Electronics', label: 'Electronics' },
  { value: 'Consumer Electronics', label: 'Consumer Electronics' },
  { value: 'Machinery', label: 'Machinery & Equipment' },
  { value: 'Automotive', label: 'Automotive & Parts' },
  { value: 'Construction & Building', label: 'Construction & Building Materials' },
  { value: 'Chemicals', label: 'Chemicals' },
  { value: 'Plastics & Rubber', label: 'Plastics & Rubber' },
  { value: 'Packaging', label: 'Packaging & Printing' },
  { value: 'Metals & Mining', label: 'Metals & Mining' },
  { value: 'Pharmaceuticals', label: 'Pharmaceuticals' },
  { value: 'Health & Medical', label: 'Health & Medical Devices' },
  {
    value: 'Beauty & Personal Care',
    label: 'Beauty & Personal Care',
    keywords: 'cosmetics',
  },
  { value: 'Toys & Hobbies', label: 'Toys & Hobbies' },
  { value: 'Sports & Outdoors', label: 'Sports & Outdoors' },
  { value: 'Jewelry & Accessories', label: 'Jewelry & Accessories' },
  { value: 'Paper & Wood', label: 'Paper & Wood Products' },
  { value: 'Energy', label: 'Energy & Renewables', keywords: 'solar power' },
  { value: 'Oil & Gas', label: 'Oil & Gas' },
  { value: 'Cosmetics', label: 'Cosmetics' },
  { value: 'Pet Supplies', label: 'Pet Supplies' },
  { value: 'Office Supplies', label: 'Office Supplies & Stationery' },
  { value: 'Tools & Hardware', label: 'Tools & Hardware' },
  { value: 'Lighting', label: 'Lighting' },
  { value: 'Logistics & Freight', label: 'Logistics & Freight' },
  { value: 'Other', label: 'Other' },
];

export const CERTIFICATIONS: readonly SelectOption[] = [
  { value: 'ISO 9001', label: 'ISO 9001', keywords: 'quality' },
  { value: 'ISO 14001', label: 'ISO 14001', keywords: 'environment' },
  { value: 'ISO 22000', label: 'ISO 22000', keywords: 'food safety' },
  { value: 'HACCP', label: 'HACCP', keywords: 'food safety hazard' },
  { value: 'FDA', label: 'FDA' },
  { value: 'CE', label: 'CE' },
  { value: 'Halal', label: 'Halal' },
  { value: 'Kosher', label: 'Kosher' },
  { value: 'GMP', label: 'GMP', keywords: 'good manufacturing practice' },
  { value: 'BRCGS', label: 'BRCGS', keywords: 'brc' },
  { value: 'Organic', label: 'Organic', keywords: 'usda eu organic' },
  { value: 'FSC', label: 'FSC', keywords: 'forest' },
  { value: 'RoHS', label: 'RoHS' },
  { value: 'REACH', label: 'REACH' },
  { value: 'Global GAP', label: 'Global GAP', keywords: 'gap' },
  { value: 'SEDEX', label: 'SEDEX', keywords: 'smeta' },
];

export const INCOTERMS: readonly SelectOption[] = [
  { value: 'EXW', label: 'EXW — Ex Works' },
  { value: 'FCA', label: 'FCA — Free Carrier' },
  { value: 'FAS', label: 'FAS — Free Alongside Ship' },
  { value: 'FOB', label: 'FOB — Free on Board' },
  { value: 'CFR', label: 'CFR — Cost and Freight' },
  { value: 'CIF', label: 'CIF — Cost, Insurance & Freight' },
  { value: 'CPT', label: 'CPT — Carriage Paid To' },
  { value: 'CIP', label: 'CIP — Carriage & Insurance Paid To' },
  { value: 'DAP', label: 'DAP — Delivered at Place' },
  { value: 'DPU', label: 'DPU — Delivered at Place Unloaded' },
  { value: 'DDP', label: 'DDP — Delivered Duty Paid' },
];

export const PAYMENT_TERMS: readonly SelectOption[] = [
  { value: 'LC', label: 'LC — Letter of Credit' },
  { value: 'TT', label: 'TT — Telegraphic Transfer', keywords: 'wire' },
  { value: 'CAD', label: 'CAD — Cash Against Documents' },
  { value: 'OA', label: 'OA — Open Account' },
  { value: 'DP', label: 'DP — Documents Against Payment' },
  { value: 'DA', label: 'DA — Documents Against Acceptance' },
  { value: 'Advance Payment', label: 'Advance Payment', keywords: 'prepayment deposit' },
  { value: 'Escrow', label: 'Escrow' },
  { value: 'Negotiable', label: 'Negotiable' },
];

export const LANGUAGES: readonly SelectOption[] = [
  'Arabic',
  'Bengali',
  'Chinese (Mandarin)',
  'Chinese (Cantonese)',
  'Dutch',
  'English',
  'French',
  'German',
  'Greek',
  'Gujarati',
  'Hebrew',
  'Hindi',
  'Indonesian',
  'Italian',
  'Japanese',
  'Khmer',
  'Korean',
  'Malay',
  'Persian',
  'Polish',
  'Portuguese',
  'Punjabi',
  'Russian',
  'Spanish',
  'Swahili',
  'Tagalog',
  'Tamil',
  'Thai',
  'Turkish',
  'Ukrainian',
  'Urdu',
  'Vietnamese',
].map((name) => ({ value: name, label: name }));

export const CURRENCIES: readonly SelectOption[] = [
  { value: 'USD', label: 'USD — US Dollar', keywords: 'dollar' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'GBP', label: 'GBP — British Pound', keywords: 'sterling' },
  { value: 'CNY', label: 'CNY — Chinese Yuan', keywords: 'rmb renminbi' },
  { value: 'JPY', label: 'JPY — Japanese Yen' },
  { value: 'INR', label: 'INR — Indian Rupee' },
  { value: 'AUD', label: 'AUD — Australian Dollar' },
  { value: 'CAD', label: 'CAD — Canadian Dollar' },
  { value: 'CHF', label: 'CHF — Swiss Franc' },
  { value: 'HKD', label: 'HKD — Hong Kong Dollar' },
  { value: 'SGD', label: 'SGD — Singapore Dollar' },
  { value: 'AED', label: 'AED — UAE Dirham', keywords: 'dirham emirates' },
  { value: 'SAR', label: 'SAR — Saudi Riyal' },
  { value: 'KRW', label: 'KRW — South Korean Won' },
  { value: 'VND', label: 'VND — Vietnamese Dong' },
  { value: 'THB', label: 'THB — Thai Baht' },
  { value: 'MYR', label: 'MYR — Malaysian Ringgit' },
  { value: 'IDR', label: 'IDR — Indonesian Rupiah' },
  { value: 'PHP', label: 'PHP — Philippine Peso' },
  { value: 'BRL', label: 'BRL — Brazilian Real' },
  { value: 'MXN', label: 'MXN — Mexican Peso' },
  { value: 'ZAR', label: 'ZAR — South African Rand' },
  { value: 'TRY', label: 'TRY — Turkish Lira' },
  { value: 'RUB', label: 'RUB — Russian Ruble' },
  { value: 'NGN', label: 'NGN — Nigerian Naira' },
  { value: 'EGP', label: 'EGP — Egyptian Pound' },
];
