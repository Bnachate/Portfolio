import apiClient from '@/app/config/api.config';

interface CreateExperiencePayload {
  job: string;
  company: string;
  position: number;
  description: string;
  startDate: string;
  endDate: string | null;
  tags: Partial<Tag>[];
}

interface Tag {
  id: number;
  name: string;
  createDate: string;
  deletedDate: string | null;
  description: string | null;
  featuredImageUrl: string | null;
  schema: string | null;
  updateDate: string | null;
}

type UpdateExperiencePayload = Partial<CreateExperiencePayload> & { id: number };

export const getExperiences = async () => {
  try {
    const response = await apiClient.get('/experiences');
    return response.data;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des expériences:', error);
    throw error;
  }
};

export const getTags = async () => {
  try {
    const response = await apiClient.get('/tags');
    return response.data;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des tags:', error);
    throw error;
  }
};

export const createExperience = async (payload: CreateExperiencePayload) => {
  try {
    const response = await apiClient.post('/experiences', payload);
    return response;
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'expérience:', error);
    throw error;
  }
};

export const updateExperience = async (payload: UpdateExperiencePayload) => {
  try {
    const response = await apiClient.patch('/experiences/', payload);
    return response;
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour de l\'expérience:', error);
    throw error;
  }
};

export const deleteExperience = async (payload: UpdateExperiencePayload) => {
  try {
    const response = await apiClient.delete(`/experiences/${payload.id}`);
    return response;
  } catch (error) {
    console.error('❌ Erreur lors de la suppression de l\'expérience:', error);
    throw error;
  }
};


