import apiClient, { unwrap } from '@/app/config/api.config';

export const login = (email: string, password: string) =>
  unwrap<{ id: number; email: string; name: string }>(apiClient.post('/auth/login', { email, password }));

export const logout = () => apiClient.post('/auth/logout');
