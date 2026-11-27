import apiClient, { unwrap } from '@/app/config/api.config';
import type { Company } from '@/app/types/api';

export type CompanyPayload = Partial<Pick<Company, 'name' | 'sector' | 'websiteUrl' | 'context'>>;

/** Every company with its number of positions, sorted by name. */
export const getCompanies = () => unwrap<Company[]>(apiClient.get('/companies'));

export const updateCompany = (id: number, payload: CompanyPayload) =>
  unwrap<Omit<Company, 'experienceCount'>>(apiClient.patch(`/companies/${id}`, payload));

/** Refused (409) while a position points to the company. */
export const deleteCompany = (id: number) => apiClient.delete(`/companies/${id}`);
