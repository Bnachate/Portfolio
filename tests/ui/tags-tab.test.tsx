// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosError, type AxiosResponse } from 'axios';
import { TagsTab } from '@/app/components/admin/TagsTab';
import { ReadOnlyProvider } from '@/app/admin/ReadOnlyContext';
import * as tagsService from '@/app/services/admin/tags.service';
import { getSkillDomains } from '@/app/services/admin/skill-domains.service';
import type { SkillDomain, TagWithUsage } from '@/app/types/api';

vi.mock('@/app/services/admin/tags.service', () => ({
  getTags: vi.fn(),
  getTagsWithUsage: vi.fn(),
  createTag: vi.fn(),
  updateTag: vi.fn(),
  deleteTag: vi.fn(),
}));
const service = vi.mocked(tagsService);

vi.mock('@/app/services/admin/skill-domains.service', () => ({ getSkillDomains: vi.fn() }));
const DOMAINS: SkillDomain[] = [
  { id: 1, name: 'Front-end', position: 0 },
  { id: 3, name: 'API et données', position: 1 },
];

const TAGS: TagWithUsage[] = [
  { id: 1, name: 'React', domainId: 1, experienceCount: 2, projectCount: 1 },
  { id: 2, name: 'Svelte', domainId: null, experienceCount: 0, projectCount: 0 },
  { id: 3, name: 'Vue.js', domainId: 1, experienceCount: 1, projectCount: 0 },
];

function renderTab(readOnly = false) {
  render(
    <ReadOnlyProvider value={readOnly}>
      <TagsTab />
    </ReadOnlyProvider>,
  );
  return screen.findByText('React');
}

const row = (name: string) => screen.getByText(name).closest('tr')!;

beforeEach(() => {
  service.getTagsWithUsage.mockResolvedValue(TAGS.map((tag) => ({ ...tag })));
  vi.mocked(getSkillDomains).mockResolvedValue(DOMAINS);
});

describe('TagsTab (admin)', () => {
  it('lists tags with their domain, usage and the number of unused ones', async () => {
    await renderTab();
    expect(screen.getByText(/3 tags au total/)).toBeInTheDocument();
    expect(screen.getByText(/1 non utilisé/)).toBeInTheDocument();
    expect(within(row('React')).getByText('2 expériences, 1 projet')).toBeInTheDocument();
    expect(within(row('Svelte')).getByText('Non utilisé')).toBeInTheDocument();
    expect(screen.getByLabelText('Domaine de React')).toHaveValue('1');
    expect(screen.getByLabelText('Domaine de Svelte')).toHaveValue('');
  });

  it('creates a tag with its domain and inserts it in alphabetical order', async () => {
    service.createTag.mockResolvedValue({ id: 4, name: 'Go', domainId: 3 });
    const user = userEvent.setup();
    await renderTab();

    await user.type(screen.getByLabelText('Nom du nouveau tag'), '  Go ');
    await user.selectOptions(screen.getByLabelText('Domaine du nouveau tag'), 'API et données');
    await user.click(screen.getByRole('button', { name: 'Ajouter' }));

    expect(service.createTag).toHaveBeenCalledWith('Go', 3);
    const names = screen.getAllByRole('row').slice(1).map((r) => within(r).getAllByRole('cell')[0].textContent);
    expect(names).toEqual(['Go', 'React', 'Svelte', 'Vue.js']);
    expect(screen.getByLabelText('Nom du nouveau tag')).toHaveValue('');
  });

  it('shows the API error for a duplicate tag', async () => {
    service.createTag.mockRejectedValue(
      new AxiosError('Conflict', '409', undefined, undefined, { status: 409, data: { message: 'Ce tag existe déjà' } } as AxiosResponse),
    );
    const user = userEvent.setup();
    await renderTab();

    await user.type(screen.getByLabelText('Nom du nouveau tag'), 'react');
    await user.click(screen.getByRole('button', { name: 'Ajouter' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Ce tag existe déjà');
  });

  it('saves a new domain as soon as it is picked', async () => {
    service.updateTag.mockResolvedValue({ id: 2, name: 'Svelte', domainId: 1 });
    const user = userEvent.setup();
    await renderTab();

    await user.selectOptions(screen.getByLabelText('Domaine de Svelte'), 'Front-end');
    expect(service.updateTag).toHaveBeenCalledWith(2, { domainId: 1 });
    expect(screen.getByLabelText('Domaine de Svelte')).toHaveValue('1');
  });

  it('renames a tag with Enter and cancels with Escape', async () => {
    service.updateTag.mockResolvedValue({ id: 2, name: 'SvelteKit', domainId: null });
    const user = userEvent.setup();
    await renderTab();

    await user.click(screen.getByRole('button', { name: 'Renommer Svelte' }));
    const input = screen.getByLabelText('Nouveau nom pour Svelte');
    await user.clear(input);
    await user.type(input, 'SvelteKit{Enter}');
    expect(service.updateTag).toHaveBeenCalledWith(2, { name: 'SvelteKit' });
    expect(await screen.findByText('SvelteKit')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Renommer React' }));
    await user.type(screen.getByLabelText('Nouveau nom pour React'), 'X{Escape}');
    expect(screen.queryByLabelText('Nouveau nom pour React')).not.toBeInTheDocument();
    expect(service.updateTag).toHaveBeenCalledTimes(1);
  });

  it('asks in the row before deleting a used tag, then removes it', async () => {
    service.deleteTag.mockResolvedValue({} as never);
    const user = userEvent.setup();
    await renderTab();

    await user.click(screen.getByRole('button', { name: 'Supprimer React' }));
    const confirm = screen.getByRole('group', { name: /Supprimer « React » \? Il sera retiré de 2 expériences, 1 projet/ });
    // The safe answer has the focus
    expect(within(confirm).getByRole('button', { name: 'Non' })).toHaveFocus();

    await user.click(within(confirm).getByRole('button', { name: 'Oui' }));
    expect(service.deleteTag).toHaveBeenCalledWith(1);
    expect(screen.queryByText('React')).not.toBeInTheDocument();
  });

  it('keeps the tag when deletion is cancelled with "Non" or Escape', async () => {
    const user = userEvent.setup();
    await renderTab();

    await user.click(screen.getByRole('button', { name: 'Supprimer Svelte' }));
    await user.click(within(screen.getByRole('group', { name: 'Supprimer « Svelte » ?' })).getByRole('button', { name: 'Non' }));
    expect(screen.getByRole('button', { name: 'Supprimer Svelte' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Supprimer Svelte' }));
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('group')).not.toBeInTheDocument();
    expect(service.deleteTag).not.toHaveBeenCalled();
  });

  it('filters tags with the search field and explains an empty result', async () => {
    const user = userEvent.setup();
    await renderTab();

    await user.type(screen.getByLabelText('Rechercher un tag'), 'vu');
    expect(screen.getByText('Vue.js')).toBeInTheDocument();
    expect(screen.queryByText('React')).not.toBeInTheDocument();

    await user.clear(screen.getByLabelText('Rechercher un tag'));
    await user.type(screen.getByLabelText('Rechercher un tag'), 'cobol');
    expect(screen.getByText('Aucun tag ne correspond à « cobol »')).toBeInTheDocument();
  });
});

describe('TagsTab (read-only visitor)', () => {
  it('shows the tags, domains and usage but no way to change them', async () => {
    await renderTab(true);
    expect(screen.getByText('2 expériences, 1 projet')).toBeInTheDocument();
    expect(within(row('Svelte')).getByText('Autres')).toBeInTheDocument();
    // Domain names come from the database
    expect(await within(row('React')).findByText('Front-end')).toBeInTheDocument();
    expect(screen.getByLabelText('Rechercher un tag')).toBeInTheDocument();
    expect(screen.queryByLabelText('Nom du nouveau tag')).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^(Ajouter|Renommer|Supprimer)/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: 'Actions' })).not.toBeInTheDocument();
  });
});
