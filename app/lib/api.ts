import axios, { AxiosInstance, AxiosError } from 'axios';

// Configuration de l'URL de base de l'API
const API_BASE_URL = 'https://portfolioback-end-production.up.railway.app';

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
// Les cookies HttpOnly sont gérés par le backend
const refreshAccessToken = async () => {
  try {
    // Appeler l'endpoint de refresh
    // Le backend va automatiquement mettre le nouveau token dans le cookie HttpOnly
    await axios.post(`${API_BASE_URL}/auth/refresh-tokens`, {}, {
      withCredentials: true,
    });

    return true;
  } catch (error) {
    // Rediriger vers login si le refresh échoue
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw error;
  }
};

// Interceptor pour les requêtes
// Pas besoin d'ajouter le token manuellement, les cookies HttpOnly s'envoient automatiquement
apiClient.interceptors.request.use(
  (config) => {
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
