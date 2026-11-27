import apiClient, { unwrap } from '@/app/config/api.config';
import type { Experience, WithTagIds } from '@/app/types/api';
import type { AxiosResponse } from 'axios';

// The company is sent by name: the server links it to its employer (or creates one)
export type ExperiencePayload = Omit<WithTagIds<Experience>, 'companyId' | 'companySlug'>;

export const getExperiences = (): Promise<Experience[]> => unwrap<Experience[]>(apiClient.get('/experiences'));

export const createExperience = (payload: ExperiencePayload): Promise<Experience> =>
  unwrap<Experience>(apiClient.post('/experiences', payload));

export const updateExperience = (id: number, payload: Partial<ExperiencePayload>): Promise<Experience> =>
  unwrap<Experience>(apiClient.patch(`/experiences/${id}`, payload));

export const deleteExperience = (id: number): Promise<AxiosResponse<unknown>> => apiClient.delete(`/experiences/${id}`);

/** Saves a new display order (every experience id, in order) and returns the reordered list. */
export const reorderExperiences = (ids: number[]): Promise<Experience[]> =>
  unwrap<Experience[]>(apiClient.put('/experiences/order', { ids }));

// Kept here for the existing imports; tag calls live in tags.service
export { getTags, createTag } from './tags.service';
