import apiClient from '@/app/config/api.config';
import { setCookies, deleteCookies } from '../config/cookies.config';


export const signup = async (name: string, email: string, password: string) => {
  try {
    const response = await apiClient.post('/auth/sign-up', { name, email, password });

    if (response.data?.data?.accessToken && response.data?.data?.refreshToken) {
      setCookies(response.data.data.accessToken, response.data.data.refreshToken);
    }
    return response.data;
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    throw error;
  }
};


export const login = async (email: string, password: string) => {
  try {
    const response = await apiClient.post('/auth/sign-in', { email, password });

    if (response.data?.data?.accessToken && response.data?.data?.refreshToken) {
      setCookies(response.data.data.accessToken, response.data.data.refreshToken);
    }
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    try {
      await apiClient.post('/auth/logout');
    } catch (apiError) {
      console.warn('⚠️ Erreur API logout (non bloquant):', apiError);
    }
    deleteCookies();
  } catch (error) {
    console.error('❌ Erreur lors de la déconnexion:', error);
    deleteCookies();
    throw error;
  }
};
