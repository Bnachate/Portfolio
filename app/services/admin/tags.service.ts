import apiClient, { unwrap } from '@/app/config/api.config';
import type { TagWithDomain, TagWithUsage } from '@/app/types/api';
import type { AxiosResponse } from 'axios';

export const getTags = (): Promise<TagWithDomain[]> => unwrap<TagWithDomain[]>(apiClient.get('/tags'));

/** Tags with the number of experiences and projects using them. */
export const getTagsWithUsage = (): Promise<TagWithUsage[]> => unwrap<TagWithUsage[]>(apiClient.get('/tags', { params: { usage: 1 } }));

export const createTag = (name: string, domainId: number | null = null): Promise<TagWithDomain> =>
  unwrap<TagWithDomain>(apiClient.post('/tags', { name, domainId }));

/** Renames a tag and / or changes its domain. */
export const updateTag = (id: number, changes: { name?: string; domainId?: number | null }): Promise<TagWithDomain> =>
  unwrap<TagWithDomain>(apiClient.patch(`/tags/${id}`, changes));

export const deleteTag = (id: number): Promise<AxiosResponse<unknown>> => apiClient.delete(`/tags/${id}`);
