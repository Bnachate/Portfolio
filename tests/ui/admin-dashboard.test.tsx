// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { routerMock } from './setup-ui';
import { AdminDashboard } from '@/app/admin/AdminDashboard';
import * as experiencesService from '@/app/services/admin/experiences.service';
import * as contactsService from '@/app/services/admin/contacts.service';
import { logout } from '@/app/services/auth.service';

vi.mock('@/app/services/admin/experiences.service', () => ({
  getExperiences: vi.fn(),
  createExperience: vi.fn(),
  updateExperience: vi.fn(),
  deleteExperience: vi.fn(),
  getTags: vi.fn(),
  createTag: vi.fn(),
}));
vi.mock('@/app/services/admin/contacts.service', () => ({
  getContacts: vi.fn(),
  updateContactStatus: vi.fn(),
  deleteContact: vi.fn(),
  sendContactMessage: vi.fn(),
}));
vi.mock('@/app/services/auth.service', () => ({ login: vi.fn(), logout: vi.fn() }));

beforeEach(() => {
  vi.mocked(experiencesService.getExperiences).mockResolvedValue([]);
  vi.mocked(experiencesService.getTags).mockResolvedValue([]);
  vi.mocked(contactsService.getContacts).mockResolvedValue([]);
});

describe('AdminDashboard (read-only visitor)', () => {
  it('shows the read-only banner, a login link and no Messages tab', async () => {
    render(<AdminDashboard readOnly />);
    expect(screen.getByText(/Mode lecture seule/)).toBeInTheDocument();
    expect(screen.getByText('Consultation en lecture seule')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Connexion' })).toHaveAttribute('href', '/auth/login');
    expect(screen.queryByRole('button', { name: /déconnexion/i })).not.toBeInTheDocument();

    const tabs = screen.getAllByRole('tab').map((tab) => tab.textContent);
    expect(tabs).toEqual(['Expériences', 'Projets', 'Tags', 'Hero']);
    // Contact messages are never even requested
    await screen.findByText('Gestion des Expériences');
    expect(contactsService.getContacts).not.toHaveBeenCalled();
  });
});

describe('AdminDashboard (admin)', () => {
  it('shows every tab including Messages, and no read-only banner', async () => {
    const user = userEvent.setup();
    render(<AdminDashboard readOnly={false} />);

    expect(screen.queryByText(/Mode lecture seule/)).not.toBeInTheDocument();
    expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual(['Expériences', 'Messages', 'Projets', 'Tags', 'Hero']);

    await user.click(screen.getByRole('tab', { name: 'Messages' }));
    expect(await screen.findByText('Messages de Contact')).toBeInTheDocument();
    expect(contactsService.getContacts).toHaveBeenCalled();
  });

  it('logs out and returns to the site', async () => {
    vi.mocked(logout).mockResolvedValue({} as never);
    const user = userEvent.setup();
    render(<AdminDashboard readOnly={false} />);

    await user.click(screen.getByRole('button', { name: /déconnexion/i }));
    expect(logout).toHaveBeenCalled();
    expect(routerMock.push).toHaveBeenCalledWith('/');
  });
});
