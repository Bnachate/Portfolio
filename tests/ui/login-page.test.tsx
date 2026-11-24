// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosError, type AxiosResponse } from 'axios';
import { routerMock } from './setup-ui';
import LoginPage from '@/app/auth/login/page';
import { login } from '@/app/services/auth.service';

vi.mock('@/app/services/auth.service', () => ({ login: vi.fn(), logout: vi.fn() }));
const loginMock = vi.mocked(login);

const apiError = (status: number, message: string) =>
  new AxiosError('Request failed', String(status), undefined, undefined, { status, data: { message } } as AxiosResponse);

async function submit(email = 'admin@example.com', password = 'secret-password') {
  const user = userEvent.setup();
  render(<LoginPage />);
  await user.type(screen.getByLabelText('Email'), email);
  await user.type(screen.getByLabelText('Mot de passe'), password);
  await user.click(screen.getByRole('button', { name: 'Se connecter' }));
  return user;
}

describe('Login page', () => {
  it('logs in and goes to the admin panel', async () => {
    loginMock.mockResolvedValue({} as never);
    await submit();

    expect(loginMock).toHaveBeenCalledWith('admin@example.com', 'secret-password');
    expect(routerMock.push).toHaveBeenCalledWith('/admin');
    expect(routerMock.refresh).toHaveBeenCalled();
  });

  it('shows the error for wrong credentials and stays on the page', async () => {
    loginMock.mockRejectedValue(apiError(401, 'Email ou mot de passe incorrect'));
    await submit();

    expect(await screen.findByText('Email ou mot de passe incorrect')).toBeInTheDocument();
    expect(routerMock.push).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Se connecter' })).toBeEnabled();
  });

  it('shows the brute-force protection message', async () => {
    loginMock.mockRejectedValue(apiError(429, 'Trop de tentatives. Merci de réessayer un peu plus tard.'));
    await submit();
    expect(await screen.findByText('Trop de tentatives. Merci de réessayer un peu plus tard.')).toBeInTheDocument();
  });

  it('shows and hides the password', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);
    const password = screen.getByLabelText('Mot de passe');
    expect(password).toHaveAttribute('type', 'password');

    const toggle = screen.getByRole('button', { name: 'Afficher le mot de passe' });
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await user.click(toggle);
    expect(password).toHaveAttribute('type', 'text');
    // The button now offers the opposite action
    expect(screen.getByRole('button', { name: 'Masquer le mot de passe' })).toHaveAttribute('aria-pressed', 'true');
  });
});
