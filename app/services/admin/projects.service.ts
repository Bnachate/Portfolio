import apiClient from '@/app/config/api.config';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  githubUrl: string;
  job: string;
  linkedinUrl: string;
  password: string;
  email: string;
  admin: number;
  title: string;
  description: string;
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

interface CreateProjectPayload {
  id: number;
  title: string;
  description: string;
  projectImageUrl: string;
  githubUrl: string;
  owner: User;
  tags: Partial<Tag>[];
  position: number;
}

type UpdateProjectPayload = Partial<CreateProjectPayload> & { id: number };

export const getProjects = async () => {
  try {
    const response = await apiClient.get('/projects');
    return response.data;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des projets:', error);
    throw error;
  }
};

export const createProject = async (payload: Partial<CreateProjectPayload>) => {
  try {
    const response = await apiClient.post('/projects', payload);
    return response;
  } catch (error) {
    console.error('❌ Erreur lors de la création du projet:', error);
    throw error;
  }
};

export const updateProject = async (payload: UpdateProjectPayload) => {
  try {
    const response = await apiClient.patch('/projects/', payload);
    return response;
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour du projet:', error);
    throw error;
  }
};

export const deleteProject = async (payload: UpdateProjectPayload) => {
  try {
    const response = await apiClient.delete(`/projects/${payload.id}`);
    return response;
  } catch (error) {
    console.error('❌ Erreur lors de la suppression du projet:', error);
    throw error;
  }
};


