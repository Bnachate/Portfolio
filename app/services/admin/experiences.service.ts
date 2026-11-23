import apiClient, { unwrap } from '@/app/config/api.config';
import type { Experience, Tag, WithTagIds } from '@/app/types/api';

export type ExperiencePayload = WithTagIds<Experience>;

export const getExperiences = () => unwrap<Experience[]>(apiClient.get('/experiences'));

export const createExperience = (payload: ExperiencePayload) =>
  unwrap<Experience>(apiClient.post('/experiences', payload));

export const updateExperience = (id: number, payload: Partial<ExperiencePayload>) =>
  unwrap<Experience>(apiClient.patch(`/experiences/${id}`, payload));

export const deleteExperience = (id: number) => apiClient.delete(`/experiences/${id}`);

export const getTags = () => unwrap<Tag[]>(apiClient.get('/tags'));

export const createTag = (name: string) => unwrap<Tag>(apiClient.post('/tags', { name }));
