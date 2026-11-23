import apiClient, { unwrap } from '@/app/config/api.config';
import type { Project, WithTagIds } from '@/app/types/api';

export type ProjectPayload = WithTagIds<Project>;

export const getProjects = () => unwrap<Project[]>(apiClient.get('/projects'));

export const createProject = (payload: ProjectPayload) =>
  unwrap<Project>(apiClient.post('/projects', payload));

export const updateProject = (id: number, payload: Partial<ProjectPayload>) =>
  unwrap<Project>(apiClient.patch(`/projects/${id}`, payload));

export const deleteProject = (id: number) => apiClient.delete(`/projects/${id}`);
