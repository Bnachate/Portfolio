import apiClient, { unwrap } from '@/app/config/api.config';
import type { Company } from '@/app/types/api';
import type { AxiosResponse } from 'axios';

export type CompanyPayload = Partial<Pick<Company, 'name' | 'sector' | 'websiteUrl' | 'context'>>;

/** Every company with its number of positions, sorted by name. */
export const getCompanies = (): Promise<Company[]> => unwrap<Company[]>(apiClient.get('/companies'));

export const updateCompany = (id: number, payload: CompanyPayload): Promise<Omit<Company, "experienceCount">> =>
  unwrap<Omit<Company, 'experienceCount'>>(apiClient.patch(`/companies/${id}`, payload));

/** Refused (409) while a position points to the company. */
export const deleteCompany = (id: number): Promise<AxiosResponse<unknown>> => apiClient.delete(`/companies/${id}`);
