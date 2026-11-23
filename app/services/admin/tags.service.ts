import apiClient, { unwrap } from '@/app/config/api.config';
import type { Tag, TagWithUsage } from '@/app/types/api';

export const getTags = () => unwrap<Tag[]>(apiClient.get('/tags'));

/** Admin only: tags with the number of experiences and projects using them. */
export const getTagsWithUsage = () => unwrap<TagWithUsage[]>(apiClient.get('/tags', { params: { usage: 1 } }));

export const createTag = (name: string) => unwrap<Tag>(apiClient.post('/tags', { name }));

export const updateTag = (id: number, name: string) => unwrap<Tag>(apiClient.patch(`/tags/${id}`, { name }));

export const deleteTag = (id: number) => apiClient.delete(`/tags/${id}`);
