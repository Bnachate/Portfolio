import apiClient, { unwrap } from '@/app/config/api.config';
import type { Hero } from '@/app/types/api';

export const getHero = () => unwrap<Hero>(apiClient.get('/hero'));

export const saveHero = (hero: Hero) => unwrap<Hero>(apiClient.put('/hero', hero));
