import apiClient from '@/app/config/api.config';

export const getTags = async () => {
  try {
    const response = await apiClient.get('/tags');
    return response.data;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des tags:', error);
    throw error;
  }
};
