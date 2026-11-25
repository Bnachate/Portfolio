import apiClient, { unwrap } from '@/app/config/api.config';
import type { Experience, WithTagIds } from '@/app/types/api';

export type ExperiencePayload = WithTagIds<Experience>;

export const getExperiences = () => unwrap<Experience[]>(apiClient.get('/experiences'));

export const createExperience = (payload: ExperiencePayload) =>
  unwrap<Experience>(apiClient.post('/experiences', payload));

export const updateExperience = (id: number, payload: Partial<ExperiencePayload>) =>
  unwrap<Experience>(apiClient.patch(`/experiences/${id}`, payload));

export const deleteExperience = (id: number) => apiClient.delete(`/experiences/${id}`);

/** Saves a new display order (every experience id, in order) and returns the reordered list. */
export const reorderExperiences = (ids: number[]) =>
  unwrap<Experience[]>(apiClient.put('/experiences/order', { ids }));

// Kept here for the existing imports; tag calls live in tags.service
export { getTags, createTag } from './tags.service';
