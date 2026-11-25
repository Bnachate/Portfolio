import apiClient, { unwrap } from '@/app/config/api.config';
import type { SkillDomain } from '@/app/types/api';

/** Skill domains in display order. */
export const getSkillDomains = () => unwrap<SkillDomain[]>(apiClient.get('/skill-domains'));

export const createSkillDomain = (name: string) => unwrap<SkillDomain>(apiClient.post('/skill-domains', { name }));

export const renameSkillDomain = (id: number, name: string) =>
  unwrap<SkillDomain>(apiClient.patch(`/skill-domains/${id}`, { name }));

/** Its tags move to "Autres". */
export const deleteSkillDomain = (id: number) => apiClient.delete(`/skill-domains/${id}`);

/** Saves a new display order (every domain id, in order) and returns the reordered list. */
export const reorderSkillDomains = (ids: number[]) =>
  unwrap<SkillDomain[]>(apiClient.put('/skill-domains/order', { ids }));
