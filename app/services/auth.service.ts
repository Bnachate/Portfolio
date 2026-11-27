import apiClient, { unwrap } from '@/app/config/api.config';
import type { AxiosResponse } from 'axios';

export const login = (email: string, password: string): Promise<{ id: number; email: string; name: string }> =>
  unwrap<{ id: number; email: string; name: string }>(apiClient.post('/auth/login', { email, password }));

export const logout = (): Promise<AxiosResponse<unknown>> => apiClient.post('/auth/logout');
