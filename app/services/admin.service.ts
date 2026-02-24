import apiClient from '@/app/config/api';

export const getExperiences = async () => {
  try {
    const response = await apiClient.get('/experiences');
    console.log('✅ Expériences récupérées:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des expériences:', error);
    throw error;
  }
};

export const getTags = async () => {
  try {
    const response = await apiClient.get('/tags');
    console.log('✅ Tags récupérés:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des tags:', error);
    throw error;
  }
};


