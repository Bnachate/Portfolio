// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosError, type AxiosResponse } from 'axios';
import { SkillDomainsTab } from '@/app/components/admin/SkillDomainsTab';
import { ReadOnlyProvider } from '@/app/admin/ReadOnlyContext';
import * as domainsService from '@/app/services/admin/skill-domains.service';
import type { SkillDomain } from '@/app/types/api';

vi.mock('@/app/services/admin/skill-domains.service', () => ({
  getSkillDomains: vi.fn(),
  createSkillDomain: vi.fn(),
  renameSkillDomain: vi.fn(),
  deleteSkillDomain: vi.fn(),
  reorderSkillDomains: vi.fn(),
}));
const service = vi.mocked(domainsService);

const DOMAINS: SkillDomain[] = [
  { id: 1, name: 'Front-end', position: 0 },
  { id: 2, name: 'API et données', position: 1 },
];

function renderTab(readOnly = false) {
  render(
    <ReadOnlyProvider value={readOnly}>
      <SkillDomainsTab />
    </ReadOnlyProvider>,
  );
  return screen.findByText('Front-end');
}

const names = () => screen.getAllByRole('row').slice(1).map((r) => within(r).getAllByRole('cell')[1].textContent);

beforeEach(() => {
  service.getSkillDomains.mockResolvedValue(DOMAINS.map((d) => ({ ...d })));
});

describe('SkillDomainsTab (admin)', () => {
  it('lists the domains in display order', async () => {
    await renderTab();
    expect(names()).toEqual(['Front-end', 'API et données']);
    expect(screen.getByText(/2 domaines sur la page Compétences/)).toBeInTheDocument();
  });

  it('creates a domain (trimmed) at the end of the list, never with a blank name', async () => {
    service.createSkillDomain.mockResolvedValue({ id: 3, name: 'Mobile', position: 2 });
    const user = userEvent.setup();
    await renderTab();

    await user.type(screen.getByLabelText('Nom du nouveau domaine'), '   ');
    expect(screen.getByRole('button', { name: 'Ajouter' })).toBeDisabled();
    await user.type(screen.getByLabelText('Nom du nouveau domaine'), ' Mobile ');
    await user.click(screen.getByRole('button', { name: 'Ajouter' }));

    expect(service.createSkillDomain).toHaveBeenCalledWith('Mobile');
    expect(await screen.findByText('Mobile')).toBeInTheDocument();
    expect(names()).toEqual(['Front-end', 'API et données', 'Mobile']);
    expect(screen.getByLabelText('Nom du nouveau domaine')).toHaveValue('');
  });

  it('shows the server error for a duplicate name', async () => {
    service.createSkillDomain.mockRejectedValue(
      new AxiosError('409', '409', undefined, undefined, { status: 409, data: { message: 'Ce domaine existe déjà' } } as AxiosResponse),
    );
    const user = userEvent.setup();
    await renderTab();
    await user.type(screen.getByLabelText('Nom du nouveau domaine'), 'front-end');
    await user.click(screen.getByRole('button', { name: 'Ajouter' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Ce domaine existe déjà');
  });

  it('renames a domain with Enter and cancels with Escape', async () => {
    service.renameSkillDomain.mockResolvedValue({ id: 2, name: 'Back-end', position: 1 });
    const user = userEvent.setup();
    await renderTab();

    await user.click(screen.getByRole('button', { name: 'Renommer Front-end' }));
    await user.type(screen.getByLabelText('Nouveau nom pour Front-end'), ' X{Escape}');
    expect(screen.getByText('Front-end')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Renommer API et données' }));
    const input = screen.getByLabelText('Nouveau nom pour API et données');
    await user.clear(input);
    await user.type(input, 'Back-end{Enter}');
    expect(service.renameSkillDomain).toHaveBeenCalledWith(2, 'Back-end');
    expect(await screen.findByText('Back-end')).toBeInTheDocument();
    expect(service.renameSkillDomain).toHaveBeenCalledTimes(1);
  });

  it('asks in the row before deleting, saying where its tags go', async () => {
    service.deleteSkillDomain.mockResolvedValue({} as AxiosResponse);
    const user = userEvent.setup();
    await renderTab();

    await user.click(screen.getByRole('button', { name: 'Supprimer Front-end' }));
    expect(screen.getByText('Supprimer « Front-end » ? Ses tags iront dans « Autres ».')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Oui' }));
    expect(service.deleteSkillDomain).toHaveBeenCalledWith(1);
    await waitFor(() => expect(names()).toEqual(['API et données']));
    expect(screen.queryByText(/Ses tags iront/)).not.toBeInTheDocument();
  });

  it('moves a domain down and shows the saved order', async () => {
    service.reorderSkillDomains.mockResolvedValue([
      { id: 2, name: 'API et données', position: 0 },
      { id: 1, name: 'Front-end', position: 1 },
    ]);
    const user = userEvent.setup();
    await renderTab();

    expect(screen.getByRole('button', { name: 'Monter Front-end' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Descendre Front-end' }));
    expect(service.reorderSkillDomains).toHaveBeenCalledWith([2, 1]);
    expect(await screen.findByRole('button', { name: 'Monter Front-end' })).toBeEnabled();
    expect(names()).toEqual(['API et données', 'Front-end']);
  });
});

describe('SkillDomainsTab (read-only visitor)', () => {
  it('shows the domains but no way to change them', async () => {
    await renderTab(true);
    expect(names()).toEqual(['Front-end', 'API et données']);
    expect(screen.queryByLabelText('Nom du nouveau domaine')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^(Ajouter|Renommer|Supprimer|Monter|Descendre)/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: 'Actions' })).not.toBeInTheDocument();
  });
});
