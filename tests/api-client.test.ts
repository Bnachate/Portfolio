import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import apiClient, { getErrorMessage, unwrap } from '@/app/config/api.config';

// A plain object stands in for the browser window: jsdom cannot observe navigations
const fakeWindow = { location: { href: 'http://localhost/admin' } };

beforeEach(() => {
  (globalThis as { window?: unknown }).window = fakeWindow;
  fakeWindow.location.href = 'http://localhost/admin';
});

afterEach(() => {
  delete (globalThis as { window?: unknown }).window;
});

type Rejected = (error: AxiosError) => Promise<never>;
const onError = (apiClient.interceptors.response as unknown as { handlers: { rejected: Rejected }[] }).handlers[0]!.rejected;

const errorFor = (url: string, status: number, message = 'Non authentifié') =>
  new AxiosError('Request failed', String(status), { url } as InternalAxiosRequestConfig, undefined, {
    status,
    data: { message },
  } as AxiosResponse);

describe('API client', () => {
  it('sends the admin back to the login page when the session expired', async () => {
    await expect(onError(errorFor('/tags', 401))).rejects.toBeInstanceOf(AxiosError);
    expect(fakeWindow.location.href).toBe('/auth/login');
  });

  it('does not redirect on a failed login, so the error can be shown', async () => {
    await expect(onError(errorFor('/auth/login', 401))).rejects.toBeInstanceOf(AxiosError);
    expect(fakeWindow.location.href).toBe('http://localhost/admin');
  });

  it('does not redirect on other errors', async () => {
    await expect(onError(errorFor('/tags', 409, 'Ce tag existe déjà'))).rejects.toBeInstanceOf(AxiosError);
    expect(fakeWindow.location.href).toBe('http://localhost/admin');
  });

  it('reads the API error message, with a fallback', () => {
    expect(getErrorMessage(errorFor('/tags', 409, 'Ce tag existe déjà'))).toBe('Ce tag existe déjà');
    expect(getErrorMessage(new Error('boom'), 'Oups')).toBe('Oups');
  });

  it('unwraps the { data } envelope', async () => {
    expect(await unwrap(Promise.resolve({ data: { data: [1, 2] } }))).toEqual([1, 2]);
  });
});
