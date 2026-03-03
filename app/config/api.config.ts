import axios, { AxiosInstance, AxiosError } from 'axios';
import { getCookie, deleteCookies } from './cookies.config';

// Configuration de l'URL de base de l'API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://portfolioback-end-production.up.railway.app';

// Créer une instance axios avec withCredentials pour les cookies
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true, // Important : envoie les cookies avec chaque requête
  headers: {
    'Content-Type': 'application/json',
  },
});

// Variables pour gérer le refresh token
let isRefreshing = false;
let failedQueue: Array<{
  onSuccess: () => void;
  onFailed: (error: Error) => void;
}> = [];

const processQueue = (error: Error | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.onFailed(error);
    } else {
      prom.onSuccess();
    }
  });

  failedQueue = [];
};

// Fonction pour rafraîchir le token
// Récupère le refreshToken du cookie et l'utilise pour obtenir un nouveau accessToken
const refreshAccessToken = async () => {
  try {
    const refreshToken = getCookie('refreshToken');

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    // Appeler l'endpoint de refresh avec le refreshToken
    const response = await axios.post(
      `${API_BASE_URL}/auth/refresh-tokens`,
      { refreshToken },
      { withCredentials: true }
    );

    // Stocker le nouveau token dans le cookie
    if (response.data?.data?.accessToken) {
      const oneDay = 24 * 60 * 60 * 1000;
      const expireAccessToken = new Date(new Date().getTime() + oneDay);
      document.cookie = `accessToken=${response.data.data.accessToken}; expires=${expireAccessToken.toUTCString()}; path=/; SameSite=Strict`;
    }

    return true;
  } catch (error) {
    // Token refresh échoué, rediriger vers login
    deleteCookies();
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
    throw error;
  }
};

// Interceptor pour les requêtes
// Ajouter le token Bearer dans l'Authorization header
apiClient.interceptors.request.use(
  (config) => {
    const accessToken = getCookie('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor pour gérer les erreurs et le refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Si erreur 401 et pas déjà tenté un refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Le refresh est déjà en cours, mettre en queue
        return new Promise((resolve, reject) => {
          failedQueue.push({
            onSuccess: () => {
              resolve(apiClient(originalRequest));
            },
            onFailed: (error: Error) => {
              reject(error);
            },
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await refreshAccessToken();
        processQueue(null);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
