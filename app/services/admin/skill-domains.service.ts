import apiClient, { unwrap } from '@/app/config/api.config';
import type { SkillDomain } from '@/app/types/api';
import type { AxiosResponse } from 'axios';

/** Skill domains in display order. */
export const getSkillDomains = (): Promise<SkillDomain[]> => unwrap<SkillDomain[]>(apiClient.get('/skill-domains'));

export const createSkillDomain = (name: string): Promise<SkillDomain> => unwrap<SkillDomain>(apiClient.post('/skill-domains', { name }));

export const renameSkillDomain = (id: number, name: string): Promise<SkillDomain> =>
  unwrap<SkillDomain>(apiClient.patch(`/skill-domains/${id}`, { name }));

/** Its tags move to "Autres". */
export const deleteSkillDomain = (id: number): Promise<AxiosResponse<unknown>> => apiClient.delete(`/skill-domains/${id}`);

/** Saves a new display order (every domain id, in order) and returns the reordered list. */
export const reorderSkillDomains = (ids: number[]): Promise<SkillDomain[]> =>
  unwrap<SkillDomain[]>(apiClient.put('/skill-domains/order', { ids }));
