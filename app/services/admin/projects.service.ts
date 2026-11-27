import apiClient, { unwrap } from '@/app/config/api.config';
import type { Project, WithTagIds } from '@/app/types/api';
import type { AxiosResponse } from 'axios';

export type ProjectPayload = WithTagIds<Project>;

export const getProjects = (): Promise<Project[]> => unwrap<Project[]>(apiClient.get('/projects'));

export const createProject = (payload: ProjectPayload): Promise<Project> =>
  unwrap<Project>(apiClient.post('/projects', payload));

export const updateProject = (id: number, payload: Partial<ProjectPayload>): Promise<Project> =>
  unwrap<Project>(apiClient.patch(`/projects/${id}`, payload));

export const deleteProject = (id: number): Promise<AxiosResponse<unknown>> => apiClient.delete(`/projects/${id}`);

/** Saves a new display order (every project id, in order) and returns the reordered list. */
export const reorderProjects = (ids: number[]): Promise<Project[]> => unwrap<Project[]>(apiClient.put('/projects/order', { ids }));
