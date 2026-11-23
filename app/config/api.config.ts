import axios, { AxiosInstance, AxiosError } from 'axios';
import { getCookie, deleteCookies } from './cookies.config';
import { withBasePath } from './basePath';

// API base URL configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://portfolioback-end-production.up.railway.app';

// Create an axios instance with withCredentials for cookies
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: true, // Important: sends cookies with every request
  headers: {
    'Content-Type': 'application/json',
  },
});

// State used to handle token refresh
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

// Refreshes the access token
// Reads the refreshToken cookie and uses it to get a new accessToken
const refreshAccessToken = async () => {
  try {
    const refreshToken = getCookie('refreshToken');

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    // Call the refresh endpoint with the refreshToken
    const response = await axios.post(
      `${API_BASE_URL}/auth/refresh-tokens`,
      { refreshToken },
      { withCredentials: true }
    );

    // Store the new token in the cookie
    if (response.data?.data?.accessToken) {
      const oneDay = 24 * 60 * 60 * 1000;
      const expireAccessToken = new Date(new Date().getTime() + oneDay);
      document.cookie = `accessToken=${response.data.data.accessToken}; expires=${expireAccessToken.toUTCString()}; path=/; SameSite=Strict`;
    }

    return true;
  } catch (error) {
    // Token refresh failed, redirect to login
    deleteCookies();
    if (typeof window !== 'undefined') {
      window.location.href = withBasePath('/auth/login/');
    }
    throw error;
  }
};

// Request interceptor
// Adds the Bearer token to the Authorization header
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

// Response interceptor handling errors and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // On 401, if a refresh has not been attempted yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // A refresh is already in progress, queue the request
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
