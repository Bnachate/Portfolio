// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosError, type AxiosResponse } from 'axios';
import { CompaniesTab } from '@/app/components/admin/CompaniesTab';
import { ReadOnlyProvider } from '@/app/admin/ReadOnlyContext';
import * as companiesService from '@/app/services/admin/companies.service';
import type { Company } from '@/app/types/api';

vi.mock('@/app/services/admin/companies.service', () => ({
  getCompanies: vi.fn(),
  updateCompany: vi.fn(),
  deleteCompany: vi.fn(),
}));
const service = vi.mocked(companiesService);

const COMPANIES: Company[] = [
  { id: 1, name: 'Ipocamp', slug: 'ipocamp', sector: null, websiteUrl: null, context: null, experienceCount: 1 },
  { id: 2, name: 'Vieille Boîte', slug: 'vieille-boite', sector: null, websiteUrl: null, context: null, experienceCount: 0 },
  {
    id: 3,
    name: 'Weborama',
    slug: 'weborama',
    sector: 'AdTech · Data marketing',
    websiteUrl: 'https://www.weborama.com/',
    context: 'Weborama est une entreprise d’AdTech.',
    experienceCount: 2,
  },
];

const apiError = (status: number, message: string) =>
  new AxiosError('Request failed', String(status), undefined, undefined, { status, data: { message } } as AxiosResponse);

function renderTab(readOnly = false) {
  render(
    <ReadOnlyProvider value={readOnly}>
      <CompaniesTab />
    </ReadOnlyProvider>,
  );
  return screen.findByText('Weborama');
}

const row = (name: string) => screen.getByText(name).closest('tr')!;

beforeEach(() => {
  service.getCompanies.mockResolvedValue(COMPANIES.map((company) => ({ ...company })));
});

describe('CompaniesTab (admin)', () => {
  it('lists the companies with their sector, the context still to write and their positions', async () => {
    await renderTab();
    expect(within(row('Weborama')).getByText('AdTech · Data marketing')).toBeInTheDocument();
    expect(within(row('Weborama')).getByText('2 postes')).toBeInTheDocument();
    expect(within(row('Ipocamp')).getByText('À rédiger')).toBeInTheDocument();
    expect(within(row('Vieille Boîte')).getByText('Aucun poste')).toBeInTheDocument();
    expect(screen.getByText(/3 entreprises/)).toHaveTextContent('1 sans poste');
    // A page exists only for companies with a position
    expect(screen.getByRole('link', { name: 'Voir la page Weborama sur le site' })).toHaveAttribute('href', '/experience/weborama');
    expect(screen.queryByRole('link', { name: 'Voir la page Vieille Boîte sur le site' })).not.toBeInTheDocument();
  });

  it('edits the context: trims the fields and sends null for the empty ones', async () => {
    service.updateCompany.mockImplementation(async (id, payload) => ({ ...COMPANIES[0], ...payload, id }) as never);
    await renderTab();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Modifier Ipocamp' }));
    const dialog = screen.getByRole('dialog', { name: 'Modifier Ipocamp' });
    await user.type(within(dialog).getByLabelText('Secteur'), '  Legal Tech  ');
    await user.type(within(dialog).getByLabelText('Contexte'), 'IPOCAMP est une start-up.{Enter}{Enter}- 15 000 dépôts');
    expect(within(dialog).getByText(/\/5000$/)).toHaveTextContent(`${'IPOCAMP est une start-up.\n\n- 15 000 dépôts'.length}/5000`);
    await user.click(within(dialog).getByRole('button', { name: 'Enregistrer' }));

    expect(service.updateCompany).toHaveBeenCalledWith(1, {
      name: 'Ipocamp',
      sector: 'Legal Tech',
      websiteUrl: null,
      context: 'IPOCAMP est une start-up.\n\n- 15 000 dépôts',
    });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(within(row('Ipocamp')).getByText('Legal Tech')).toBeInTheDocument();
  });

  it('never sends a blank name, and shows the server error (duplicate name)', async () => {
    service.updateCompany.mockRejectedValue(apiError(409, 'Cette entreprise existe déjà'));
    await renderTab();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Modifier Ipocamp' }));
    const dialog = screen.getByRole('dialog', { name: 'Modifier Ipocamp' });
    const name = within(dialog).getByLabelText('Nom');
    await user.clear(name);
    await user.type(name, '   ');
    await user.click(within(dialog).getByRole('button', { name: 'Enregistrer' }));
    expect(service.updateCompany).not.toHaveBeenCalled();
    expect(within(dialog).getByRole('alert')).toHaveTextContent('Champ requis : Nom');

    await user.clear(name);
    await user.type(name, 'weborama');
    await user.click(within(dialog).getByRole('button', { name: 'Enregistrer' }));
    expect(await within(dialog).findByText('Cette entreprise existe déjà')).toBeInTheDocument();
  });

  it('offers deletion only for a company without positions, after confirmation', async () => {
    service.deleteCompany.mockResolvedValue({} as never);
    await renderTab();
    expect(screen.queryByRole('button', { name: 'Supprimer Weborama' })).not.toBeInTheDocument();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Supprimer Vieille Boîte' }));
    const confirm = screen.getByRole('alertdialog', { name: 'Supprimer « Vieille Boîte » ?' });
    await user.click(within(confirm).getByRole('button', { name: 'Oui' }));
    expect(service.deleteCompany).toHaveBeenCalledWith(2);
    await waitFor(() => expect(screen.queryByText('Vieille Boîte')).not.toBeInTheDocument());
  });
});

describe('CompaniesTab (admin), refusals', () => {
  it('keeps the company and shows the server error when the deletion is refused', async () => {
    service.deleteCompany.mockRejectedValue(apiError(409, 'Cette entreprise a encore des postes'));
    await renderTab();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Supprimer Vieille Boîte' }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Oui' }));
    expect(await screen.findByText('Cette entreprise a encore des postes')).toBeInTheDocument();
    expect(screen.getByText('Vieille Boîte')).toBeInTheDocument();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('closes the form without saving with "Annuler"', async () => {
    await renderTab();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Modifier Weborama' }));
    const dialog = screen.getByRole('dialog', { name: 'Modifier Weborama' });
    // Opened with the current values
    expect(within(dialog).getByLabelText('Site web')).toHaveValue('https://www.weborama.com/');
    expect(within(dialog).getByLabelText('Contexte')).toHaveValue('Weborama est une entreprise d’AdTech.');
    await user.type(within(dialog).getByLabelText('Secteur'), ' modifié');
    await user.click(within(dialog).getByRole('button', { name: 'Annuler' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(service.updateCompany).not.toHaveBeenCalled();
  });
});

describe('CompaniesTab (read-only visitor)', () => {
  it('shows the companies without any editing control', async () => {
    await renderTab(true);
    expect(screen.queryByRole('button', { name: /Modifier|Supprimer/ })).not.toBeInTheDocument();
    // Viewing the public page stays possible
    expect(screen.getByRole('link', { name: 'Voir la page Weborama sur le site' })).toBeInTheDocument();
  });
});
