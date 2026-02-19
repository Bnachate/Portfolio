/**
 * Exemples d'utilisation du client API
 *
 * Les tokens sont stockés dans les cookies après login/signup
 */

import apiClient from '@/app/lib/api';
import { setCookies, deleteCookies } from './cookies';

// ============ EXEMPLES ============

// 1. GET simple
export const getUsers = async () => {
  try {
    const response = await apiClient.get('/users');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    throw error;
  }
};

// 3. POST
export const createUser = async (userData: any) => {
  try {
    const response = await apiClient.post('/users', userData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    throw error;
  }
};

// 4. PUT - Mise à jour
export const updateUser = async (id: string, userData: any) => {
  try {
    const response = await apiClient.put(`/users/${id}`, userData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    throw error;
  }
};

// 5. DELETE
export const deleteUser = async (id: string) => {
  try {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    throw error;
  }
};

// 6. SIGNUP - Inscription d'un nouvel utilisateur
export const signup = async (name: string, email: string, password: string) => {
  try {
    const response = await apiClient.post('/auth/sign-up', { name, email, password });
    // Stocker les tokens dans les cookies en fonction de la réponse (structure: data.accessToken et data.refreshToken)
    if (response.data?.data?.accessToken && response.data?.data?.refreshToken) {
      setCookies(response.data.data.accessToken, response.data.data.refreshToken);
    }
    return response.data;
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    throw error;
  }
};

// 7. LOGIN - Connexion
export const login = async (email: string, password: string) => {
  try {
    const response = await apiClient.post('/auth/sign-in', { email, password });
    // Stocker les tokens dans les cookies en fonction de la réponse (structure: data.accessToken et data.refreshToken)
    if (response.data?.data?.accessToken && response.data?.data?.refreshToken) {
      setCookies(response.data.data.accessToken, response.data.data.refreshToken);
    }
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    throw error;
  }
};

// 8. LOGOUT
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

// ============ UTILISATION DANS UN COMPOSANT ============

/*
import { useEffect, useState } from 'react';
import { getUsers, createUser } from '@/app/api/examples';

export default function MyComponent() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers();
        setUsers(data);
      } catch (error) {
        console.error('Erreur:', error);
      }
    };

    fetchUsers();
  }, []);

  const handleCreateUser = async () => {
    try {
      await createUser({ name: 'John', email: 'john@example.com' });
      // Rafraîchir la liste
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  return (
    // JSX
  );
}
*/
