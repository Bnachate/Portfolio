import axios, { AxiosError } from 'axios';
import type { AxiosResponse } from 'axios';

/**
 * Axios client for our own Next.js API (same origin, so the HttpOnly
 * session cookie is sent automatically).
 * Every route answers `{ data }` on success and `{ message }` on error.
 */
const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Session expired while using the admin: send the user back to the login page.
// Auth routes are excluded so a wrong password shows its error instead of reloading the page.
apiClient.interceptors.response.use(
  (response: AxiosResponse<unknown>) => response,
  (error: AxiosError) => {
    const isAuthRoute = error.config?.url?.startsWith('/auth/');
    if (error.response?.status === 401 && !isAuthRoute && typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  },
);

/** Extracts the API error message, with a fallback. */
export function getErrorMessage(error: unknown, fallback: string = 'Une erreur est survenue'): string {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? fallback;
  }
  return fallback;
}

/** Unwraps the `{ data }` envelope. */
export async function unwrap<T>(request: Promise<{ data: { data: T } }>): Promise<T> {
  const response = await request;
  return response.data.data;
}

export default apiClient;
