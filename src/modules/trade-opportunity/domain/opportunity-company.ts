/**
 * A company attached to an opportunity — a buyer or supplier Atlas surfaced,
 * moving through a qualification pipeline. Pure data + display metadata.
 */

export const COMPANY_ROLES = ['buyer', 'supplier'] as const;
export type CompanyRole = (typeof COMPANY_ROLES)[number];

export const COMPANY_STATUSES = [
  'suggested',
  'shortlisted',
  'contacted',
  'qualified',
  'rejected',
] as const;
export type CompanyStatus = (typeof COMPANY_STATUSES)[number];

export const COMPANY_STATUS_LABEL: Readonly<Record<CompanyStatus, string>> = {
  suggested: 'Suggested',
  shortlisted: 'Shortlisted',
  contacted: 'Contacted',
  qualified: 'Qualified',
  rejected: 'Rejected',
};

export interface OpportunityCompany {
  readonly id: string;
  readonly opportunityId: string;
  readonly role: CompanyRole;
  readonly name: string;
  readonly country: string | null;
  readonly website: string | null;
  readonly fitScore: number | null;
  readonly status: CompanyStatus;
  readonly source: string | null;
  readonly createdAt: string;
}
