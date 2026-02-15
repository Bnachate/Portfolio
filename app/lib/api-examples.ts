/**
 * Exemples d'utilisation du client API avec cookies HttpOnly
 *
 * Les tokens sont automatiquement stockés dans les cookies HttpOnly par le backend.
 * Pas besoin de gérer manuellement les tokens en localStorage !
 */

import apiClient from '@/app/lib/api';

// ============ EXEMPLES ============

// 1. GET simple
export const getUsers = async () => {
  try {
    const response = await apiClient.get('/users');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    throw error;
  }
};

// 2. GET avec paramètres
export const getUserById = async (id: string) => {
  try {
    const response = await apiClient.get(`/users/${id}`);
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

// 6. LOGIN - Tokens seront stockés dans les cookies HttpOnly par le backend
export const login = async (email: string, password: string) => {
  try {
    const response = await apiClient.post('/auth/sign-in', { email, password });
    // Le backend met automatiquement les tokens dans les cookies HttpOnly
    // Pas besoin de stocker manuellement !
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    throw error;
  }
};

// 7. LOGOUT
export const logout = async () => {
  try {
    await apiClient.post('/auth/logout');
    // Le backend supprime automatiquement les cookies
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
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
