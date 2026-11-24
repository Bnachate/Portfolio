// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosError, type AxiosResponse } from 'axios';
import { ExperienceTab } from '@/app/components/admin/ExperienceTab';
import { ProjectsTab } from '@/app/components/admin/ProjectsTab';
import { ReadOnlyProvider } from '@/app/admin/ReadOnlyContext';
import * as experiencesService from '@/app/services/admin/experiences.service';
import * as projectsService from '@/app/services/admin/projects.service';
import type { Experience, Project, Tag } from '@/app/types/api';

vi.mock('@/app/services/admin/experiences.service', () => ({
  getExperiences: vi.fn(),
  createExperience: vi.fn(),
  updateExperience: vi.fn(),
  deleteExperience: vi.fn(),
  getTags: vi.fn(),
  createTag: vi.fn(),
}));
vi.mock('@/app/services/admin/projects.service', () => ({
  getProjects: vi.fn(),
  createProject: vi.fn(),
  updateProject: vi.fn(),
  deleteProject: vi.fn(),
}));
const exp = vi.mocked(experiencesService);
const proj = vi.mocked(projectsService);

const TAGS: Tag[] = [
  { id: 1, name: 'Java' },
  { id: 2, name: 'Vue.js' },
];
const EXPERIENCE: Experience = {
  id: 10,
  job: 'Développeur Vue.js',
  company: 'Weborama',
  description: 'Front-end',
  startDate: '2023-01-01',
  endDate: null,
  position: 0,
  tags: [TAGS[1]],
};
const PROJECT: Project = {
  id: 20,
  title: 'Portfolio',
  description: 'Mon site',
  projectImageUrl: 'https://example.com/shot.png',
  githubUrl: 'https://github.com/x/portfolio',
  demoUrl: null,
  position: 0,
  tags: [],
};

const apiError = (message: string) =>
  new AxiosError('Bad Request', '400', undefined, undefined, { status: 400, data: { message } } as AxiosResponse);
const withMode = (readOnly: boolean, ui: React.ReactNode) => <ReadOnlyProvider value={readOnly}>{ui}</ReadOnlyProvider>;

beforeEach(() => {
  exp.getTags.mockResolvedValue([...TAGS]);
  exp.getExperiences.mockResolvedValue([{ ...EXPERIENCE }]);
  proj.getProjects.mockResolvedValue([{ ...PROJECT }]);
});

describe('ExperienceTab (admin)', () => {
  it('lists experiences with their period and tags', async () => {
    render(withMode(false, <ExperienceTab />));
    const row = (await screen.findByText('Développeur Vue.js')).closest('tr')!;
    expect(within(row).getByText("01-01-2023 - Aujourd'hui")).toBeInTheDocument();
    expect(within(row).getByText('Vue.js')).toBeInTheDocument();
    expect(screen.getByText(/1 expérience au total/)).toBeInTheDocument();
  });

  it('creates an experience once the required fields and a tag are filled', async () => {
    exp.createExperience.mockResolvedValue({ ...EXPERIENCE, id: 11 });
    const user = userEvent.setup();
    render(withMode(false, <ExperienceTab />));
    await screen.findByText('Développeur Vue.js');

    await user.click(screen.getByRole('button', { name: /nouvelle expérience/i }));
    const dialog = await screen.findByRole('dialog');
    const create = within(dialog).getByRole('button', { name: 'Créer' });

    await user.type(within(dialog).getByLabelText('Titre du poste'), 'Développeur Java');
    await user.type(within(dialog).getByLabelText('Entreprise'), 'ACME');
    await user.type(within(dialog).getByLabelText('Date de début'), '2024-02-01');
    await user.type(within(dialog).getByLabelText('Description'), 'Spring Boot');
    // A tag is still missing
    expect(create).toBeDisabled();

    await user.click(within(dialog).getByLabelText('Tags'));
    await user.click(await screen.findByRole('menuitemcheckbox', { name: 'Java' }));
    await user.keyboard('{Escape}');
    expect(create).toBeEnabled();

    await user.click(create);
    expect(exp.createExperience).toHaveBeenCalledWith({
      job: 'Développeur Java',
      company: 'ACME',
      position: 0,
      description: 'Spring Boot',
      startDate: '2024-02-01',
      endDate: null,
      tags: [1],
    });
    await waitFor(() => expect(exp.getExperiences).toHaveBeenCalledTimes(2));
  });

  it('creates a missing tag from the experience form', async () => {
    exp.createTag.mockResolvedValue({ id: 3, name: 'Go' });
    const user = userEvent.setup();
    render(withMode(false, <ExperienceTab />));
    await screen.findByText('Développeur Vue.js');

    await user.click(screen.getByRole('button', { name: /nouvelle expérience/i }));
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByLabelText('Tags'));
    await user.type(await screen.findByPlaceholderText('Nouveau tag'), 'Go');
    await user.click(screen.getByRole('button', { name: 'Créer le tag' }));

    expect(exp.createTag).toHaveBeenCalledWith('Go');
    await user.keyboard('{Escape}');
    expect(within(within(dialog).getByLabelText('Tags')).getByText('Go')).toBeInTheDocument();
  });

  it('only enables "Mettre à jour" once something changed, then saves', async () => {
    exp.updateExperience.mockResolvedValue({ ...EXPERIENCE, company: 'Weborama SA' });
    const user = userEvent.setup();
    render(withMode(false, <ExperienceTab />));
    await screen.findByText('Développeur Vue.js');

    await user.click(screen.getByRole('button', { name: 'Modifier' }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText("Modifier l'expérience")).toBeInTheDocument();
    const update = within(dialog).getByRole('button', { name: 'Mettre à jour' });
    expect(update).toBeDisabled();

    await user.type(within(dialog).getByLabelText('Entreprise'), ' SA');
    expect(update).toBeEnabled();
    await user.click(update);

    expect(exp.updateExperience).toHaveBeenCalledWith(10, expect.objectContaining({ company: 'Weborama SA', tags: [2] }));
  });

  it('blocks an end date before the start date in the form itself', async () => {
    const user = userEvent.setup();
    render(withMode(false, <ExperienceTab />));
    await screen.findByText('Développeur Vue.js');

    await user.click(screen.getByRole('button', { name: 'Modifier' }));
    const dialog = await screen.findByRole('dialog');
    const endDate = within(dialog).getByLabelText('Date de fin');
    expect(endDate).toHaveAttribute('min', '2023-01-01');

    await user.type(endDate, '2020-01-01');
    await user.click(within(dialog).getByRole('button', { name: 'Mettre à jour' }));
    expect(endDate).toBeInvalid();
    expect(exp.updateExperience).not.toHaveBeenCalled();
  });

  it('shows the API error inside the form', async () => {
    exp.updateExperience.mockRejectedValue(apiError('job: 200 caractères maximum'));
    const user = userEvent.setup();
    render(withMode(false, <ExperienceTab />));
    await screen.findByText('Développeur Vue.js');

    await user.click(screen.getByRole('button', { name: 'Modifier' }));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText('Titre du poste'), ' senior');
    await user.click(within(dialog).getByRole('button', { name: 'Mettre à jour' }));

    expect(await within(dialog).findByRole('alert')).toHaveTextContent('200 caractères maximum');
    // The form stays open with the input kept
    expect(within(dialog).getByLabelText('Titre du poste')).toHaveValue('Développeur Vue.js senior');
  });

  it('deletes an experience after confirmation', async () => {
    exp.deleteExperience.mockResolvedValue({} as never);
    exp.getExperiences.mockResolvedValueOnce([{ ...EXPERIENCE }]).mockResolvedValueOnce([]);
    const user = userEvent.setup();
    render(withMode(false, <ExperienceTab />));
    await screen.findByText('Développeur Vue.js');

    await user.click(screen.getByRole('button', { name: "Supprimer l'expérience" }));
    await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Supprimer' }));

    expect(exp.deleteExperience).toHaveBeenCalledWith(10);
    await waitFor(() => expect(screen.queryByText('Développeur Vue.js')).not.toBeInTheDocument());
  });
});

describe('ExperienceTab (read-only visitor)', () => {
  it('shows the experiences without any editing control', async () => {
    render(withMode(true, <ExperienceTab />));
    await screen.findByText('Développeur Vue.js');
    expect(screen.queryByRole('button', { name: /nouvelle expérience/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Modifier' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: "Supprimer l'expérience" })).not.toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: 'Actions' })).not.toBeInTheDocument();
  });
});

describe('ProjectsTab (admin)', () => {
  it('lists projects with a GitHub link', async () => {
    render(withMode(false, <ProjectsTab />));
    await screen.findByText('Portfolio');
    expect(screen.getByRole('link', { name: 'Ouvrir sur GitHub' })).toHaveAttribute('href', PROJECT.githubUrl);
  });

  it('creates a project, sending empty optional links as null', async () => {
    proj.createProject.mockResolvedValue({ ...PROJECT, id: 21 });
    const user = userEvent.setup();
    render(withMode(false, <ProjectsTab />));
    await screen.findByText('Portfolio');

    await user.click(screen.getByRole('button', { name: /nouveau projet/i }));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText('Titre du projet'), 'API Next.js');
    await user.type(within(dialog).getByLabelText("URL de l'image"), 'https://example.com/api.png');
    await user.type(within(dialog).getByLabelText('Description'), 'Route handlers');
    await user.click(within(dialog).getByRole('button', { name: 'Créer' }));

    expect(proj.createProject).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'API Next.js', githubUrl: null, demoUrl: null, tags: [] }),
    );
  });

  it('shows the API error when a link is refused', async () => {
    proj.updateProject.mockRejectedValue(apiError('demoUrl: URL http(s) invalide'));
    const user = userEvent.setup();
    render(withMode(false, <ProjectsTab />));
    await screen.findByText('Portfolio');

    await user.click(screen.getByRole('button', { name: 'Modifier' }));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText('URL de démo'), 'https://example.com/demo');
    await user.click(within(dialog).getByRole('button', { name: 'Mettre à jour' }));

    expect(await within(dialog).findByRole('alert')).toHaveTextContent('URL http(s) invalide');
  });

  it('deletes a project after confirmation', async () => {
    proj.deleteProject.mockResolvedValue({} as never);
    const user = userEvent.setup();
    render(withMode(false, <ProjectsTab />));
    await screen.findByText('Portfolio');

    await user.click(screen.getByRole('button', { name: 'Supprimer le projet' }));
    await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Supprimer' }));
    expect(proj.deleteProject).toHaveBeenCalledWith(20);
  });
});

describe('ProjectsTab (read-only visitor)', () => {
  it('keeps the GitHub link but hides every editing control', async () => {
    render(withMode(true, <ProjectsTab />));
    await screen.findByText('Portfolio');
    expect(screen.getByRole('link', { name: 'Ouvrir sur GitHub' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /nouveau projet/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Modifier' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Supprimer le projet' })).not.toBeInTheDocument();
  });
});
