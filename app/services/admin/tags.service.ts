import apiClient, { unwrap } from '@/app/config/api.config';
import type { TagWithDomain, TagWithUsage } from '@/app/types/api';

export const getTags = () => unwrap<TagWithDomain[]>(apiClient.get('/tags'));

/** Tags with the number of experiences and projects using them. */
export const getTagsWithUsage = () => unwrap<TagWithUsage[]>(apiClient.get('/tags', { params: { usage: 1 } }));

export const createTag = (name: string, domainId: number | null = null) =>
  unwrap<TagWithDomain>(apiClient.post('/tags', { name, domainId }));

/** Renames a tag and / or changes its domain. */
export const updateTag = (id: number, changes: { name?: string; domainId?: number | null }) =>
  unwrap<TagWithDomain>(apiClient.patch(`/tags/${id}`, changes));

export const deleteTag = (id: number) => apiClient.delete(`/tags/${id}`);
