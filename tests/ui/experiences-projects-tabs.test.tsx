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
import type { Experience, Project, TagWithDomain } from '@/app/types/api';

vi.mock('@/app/services/admin/experiences.service', () => ({
  getExperiences: vi.fn(),
  createExperience: vi.fn(),
  updateExperience: vi.fn(),
  deleteExperience: vi.fn(),
  reorderExperiences: vi.fn(),
  getTags: vi.fn(),
  createTag: vi.fn(),
}));
// Case study pages: on by default in these tests (the code stays covered), switched off per test
const flags = vi.hoisted(() => ({ caseStudies: true }));
vi.mock('@/app/config/content', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/app/config/content')>()),
  get CASE_STUDIES_ENABLED() {
    return flags.caseStudies;
  },
}));

vi.mock('@/app/services/admin/projects.service', () => ({
  getProjects: vi.fn(),
  createProject: vi.fn(),
  updateProject: vi.fn(),
  deleteProject: vi.fn(),
  reorderProjects: vi.fn(),
}));
const exp = vi.mocked(experiencesService);
const proj = vi.mocked(projectsService);

const TAGS: TagWithDomain[] = [
  { id: 1, name: 'Java', domainId: 2 },
  { id: 2, name: 'Vue.js', domainId: 1 },
];
const EXPERIENCE: Experience = {
  id: 10,
  job: 'Développeur Vue.js',
  company: 'Weborama',
  companyId: 1,
  companySlug: 'weborama',
  description: 'Front-end',
  startDate: '2023-01-01',
  endDate: null,
  position: 0,
  tags: [TAGS[1]!],
};
const OLDER: Experience = {
  id: 9,
  job: 'Développeur React',
  company: 'Ipocamp',
  companyId: 2,
  companySlug: 'ipocamp',
  description: 'React',
  startDate: '2021-04-01',
  endDate: '2022-12-01',
  position: 1,
  tags: [],
};
const PROJECT: Project = {
  id: 20,
  title: 'Portfolio',
  description: 'Mon site',
  projectImageUrl: 'https://example.com/shot.png',
  githubUrl: 'https://github.com/x/portfolio',
  demoUrl: null,
  position: 0,
  kind: null,
  scope: null,
  role: null,
  context: null,
  achievements: null,
  results: null,
  tags: [],
};
// Position 4: a gap left by deleted projects
const SECOND_PROJECT: Project = { ...PROJECT, id: 21, title: 'API Next.js', githubUrl: null, position: 4 };

const apiError = (message: string) =>
  new AxiosError('Bad Request', '400', undefined, undefined, { status: 400, data: { message } } as AxiosResponse);
const withMode = (readOnly: boolean, ui: React.ReactNode) => <ReadOnlyProvider value={readOnly}>{ui}</ReadOnlyProvider>;
const rowOf = (text: string) => screen.getByText(text).closest('tr')!;
const jobs = () => screen.getAllByRole('row').slice(1).map((r) => within(r).getAllByRole('cell')[1]!.querySelector('span')!.textContent);

beforeEach(() => {
  flags.caseStudies = true;
  exp.getTags.mockResolvedValue([...TAGS]);
  exp.getExperiences.mockResolvedValue([{ ...EXPERIENCE }, { ...OLDER }]);
  proj.getProjects.mockResolvedValue([{ ...PROJECT }, { ...SECOND_PROJECT }]);
});

describe('ExperienceTab (admin)', () => {
  it('lists experiences with their period, tags and state badges', async () => {
    render(withMode(false, <ExperienceTab />));
    await screen.findByText('Développeur Vue.js');
    const row = rowOf('Développeur Vue.js');
    expect(within(row).getByText('Janv. 2023 - Présent')).toBeInTheDocument();
    expect(within(row).getByRole('list', { name: 'Tags de Développeur Vue.js' })).toHaveTextContent('Vue.js');
    expect(within(row).getByText('En cours')).toBeInTheDocument();
    expect(within(rowOf('Développeur React')).queryByText('En cours')).not.toBeInTheDocument();
    expect(screen.queryByText('Chevauchement')).not.toBeInTheDocument();
    expect(screen.getByText(/2 expériences au total/)).toBeInTheDocument();
  });

  it('flags experiences whose periods overlap', async () => {
    exp.getExperiences.mockResolvedValue([{ ...EXPERIENCE }, { ...OLDER, endDate: '2023-06-01' }]);
    render(withMode(false, <ExperienceTab />));
    await screen.findByText('Développeur Vue.js');
    expect(screen.getAllByText('Chevauchement')).toHaveLength(2);
  });

  it('moves an experience down and shows the order saved by the API', async () => {
    exp.reorderExperiences.mockResolvedValue([{ ...OLDER, position: 0 }, { ...EXPERIENCE, position: 1 }]);
    const user = userEvent.setup();
    render(withMode(false, <ExperienceTab />));
    await screen.findByText('Développeur Vue.js');

    // The first row cannot go up, the last one cannot go down
    expect(screen.getByRole('button', { name: 'Monter Développeur Vue.js' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Descendre Développeur React' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Descendre Développeur Vue.js' }));
    expect(exp.reorderExperiences).toHaveBeenCalledWith([9, 10]);
    expect(jobs()).toEqual(['Développeur React', 'Développeur Vue.js']);
  });

  it('shows the API error when the order could not be saved', async () => {
    exp.reorderExperiences.mockRejectedValue(apiError('La liste a changé entre-temps : rechargez la page'));
    const user = userEvent.setup();
    render(withMode(false, <ExperienceTab />));
    await screen.findByText('Développeur Vue.js');

    await user.click(screen.getByRole('button', { name: 'Monter Développeur React' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('rechargez la page');
    expect(jobs()).toEqual(['Développeur Vue.js', 'Développeur React']);
  });

  it('creates an experience at the end of the list once the required fields and a tag are filled', async () => {
    exp.createExperience.mockResolvedValue({ ...EXPERIENCE, id: 11 });
    const user = userEvent.setup();
    render(withMode(false, <ExperienceTab />));
    await screen.findByText('Développeur Vue.js');

    await user.click(screen.getByRole('button', { name: 'Nouvelle expérience' }));
    const dialog = await screen.findByRole('dialog');
    const create = within(dialog).getByRole('button', { name: 'Créer' });
    // The order is set with the arrows, not in the form
    expect(within(dialog).queryByLabelText(/Position/)).not.toBeInTheDocument();

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
      position: 2,
      description: 'Spring Boot',
      startDate: '2024-02-01',
      endDate: null,
      tags: [1],
    });
    await waitFor(() => expect(exp.getExperiences).toHaveBeenCalledTimes(2));
  });

  it('creates a missing tag from the experience form', async () => {
    exp.createTag.mockResolvedValue({ id: 3, name: 'Go', domainId: null });
    const user = userEvent.setup();
    render(withMode(false, <ExperienceTab />));
    await screen.findByText('Développeur Vue.js');

    await user.click(screen.getByRole('button', { name: 'Nouvelle expérience' }));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText('Nom du nouveau tag'), 'Go');
    await user.click(within(dialog).getByRole('button', { name: 'Créer le tag' }));

    expect(exp.createTag).toHaveBeenCalledWith('Go');
    const selected = within(dialog).getByRole('list', { name: 'Tags sélectionnés' });
    expect(within(selected).getByText('Go')).toBeInTheDocument();
    expect(within(dialog).getByLabelText('Tags')).toHaveTextContent('1 tag sélectionné');

    // The chip's remove button deselects it
    await user.click(within(selected).getByRole('button', { name: 'Retirer Go' }));
    expect(within(dialog).queryByRole('list', { name: 'Tags sélectionnés' })).not.toBeInTheDocument();
  });

  it('only enables "Mettre à jour" once something changed, then saves', async () => {
    exp.updateExperience.mockResolvedValue({ ...EXPERIENCE, company: 'Weborama SA' });
    const user = userEvent.setup();
    render(withMode(false, <ExperienceTab />));
    await screen.findByText('Développeur Vue.js');

    await user.click(screen.getByRole('button', { name: 'Modifier Développeur Vue.js' }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText("Modifier l'expérience")).toBeInTheDocument();
    const update = within(dialog).getByRole('button', { name: 'Mettre à jour' });
    expect(update).toBeDisabled();

    await user.type(within(dialog).getByLabelText('Entreprise'), ' SA');
    expect(update).toBeEnabled();
    await user.click(update);

    expect(exp.updateExperience).toHaveBeenCalledWith(10, expect.objectContaining({ company: 'Weborama SA', tags: [2], position: 0 }));
  });

  it('blocks an end date before the start date in the form itself', async () => {
    const user = userEvent.setup();
    render(withMode(false, <ExperienceTab />));
    await screen.findByText('Développeur Vue.js');

    await user.click(screen.getByRole('button', { name: 'Modifier Développeur Vue.js' }));
    const dialog = await screen.findByRole('dialog');
    const endDate = within(dialog).getByLabelText('Date de fin (vide = poste actuel)');
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

    await user.click(screen.getByRole('button', { name: 'Modifier Développeur Vue.js' }));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText('Titre du poste'), ' senior');
    await user.click(within(dialog).getByRole('button', { name: 'Mettre à jour' }));

    expect(await within(dialog).findByRole('alert')).toHaveTextContent('200 caractères maximum');
    // The form stays open with the input kept
    expect(within(dialog).getByLabelText('Titre du poste')).toHaveValue('Développeur Vue.js senior');
  });

  it('deletes an experience after confirming in a modal', async () => {
    exp.deleteExperience.mockResolvedValue({} as never);
    exp.getExperiences.mockResolvedValueOnce([{ ...EXPERIENCE }, { ...OLDER }]).mockResolvedValueOnce([{ ...OLDER }]);
    const user = userEvent.setup();
    render(withMode(false, <ExperienceTab />));
    await screen.findByText('Développeur Vue.js');

    await user.click(screen.getByRole('button', { name: 'Supprimer Développeur Vue.js' }));
    const confirm = await screen.findByRole('alertdialog', { name: 'Supprimer « Développeur Vue.js » ?' });
    expect(confirm).toHaveAccessibleDescription(/Weborama.*définitive/);
    // The safe answer has the focus
    expect(within(confirm).getByRole('button', { name: 'Non' })).toHaveFocus();
    await user.click(within(confirm).getByRole('button', { name: 'Oui' }));

    expect(exp.deleteExperience).toHaveBeenCalledWith(10);
    await waitFor(() => expect(screen.queryByText('Développeur Vue.js')).not.toBeInTheDocument());
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('keeps the experience when the deletion is refused', async () => {
    const user = userEvent.setup();
    render(withMode(false, <ExperienceTab />));
    await screen.findByText('Développeur Vue.js');

    await user.click(screen.getByRole('button', { name: 'Supprimer Développeur Vue.js' }));
    await user.click(within(await screen.findByRole('alertdialog')).getByRole('button', { name: 'Non' }));
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(exp.deleteExperience).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Supprimer Développeur Vue.js' })).toBeInTheDocument();
  });
});

describe('ExperienceTab (read-only visitor)', () => {
  it('shows the experiences without any editing or ordering control', async () => {
    render(withMode(true, <ExperienceTab />));
    await screen.findByText('Développeur Vue.js');
    expect(screen.queryByRole('button', { name: 'Nouvelle expérience' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^(Modifier|Supprimer|Monter|Descendre) / })).not.toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: 'Actions' })).not.toBeInTheDocument();
  });
});

describe('ProjectsTab (admin)', () => {
  it('lists projects with their GitHub link and a link to the public page', async () => {
    render(withMode(false, <ProjectsTab />));
    await screen.findByText('Portfolio');
    expect(within(rowOf('Portfolio')).getByRole('link', { name: 'github.com/x/portfolio' })).toHaveAttribute('href', PROJECT.githubUrl);
    expect(within(rowOf('API Next.js')).getByText('Aucun')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Voir Portfolio sur le site' })).toHaveAttribute('href', '/projets/20');
    expect(screen.getByRole('img', { name: 'Capture de Portfolio' })).toHaveAttribute('src', PROJECT.projectImageUrl);
  });

  it('creates a project at the end of the list, sending empty optional fields as null', async () => {
    proj.createProject.mockResolvedValue({ ...PROJECT, id: 22 });
    const user = userEvent.setup();
    render(withMode(false, <ProjectsTab />));
    await screen.findByText('Portfolio');

    await user.click(screen.getByRole('button', { name: 'Nouveau projet' }));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText('Titre du projet'), 'Blog');
    await user.type(within(dialog).getByLabelText("URL de l'image"), 'https://example.com/blog.png');
    await user.type(within(dialog).getByLabelText('Description'), 'Articles');
    await user.type(within(dialog).getByLabelText('Rôle'), '   ');
    await user.click(within(dialog).getByRole('button', { name: 'Créer' }));

    expect(proj.createProject).toHaveBeenCalledWith({
      title: 'Blog',
      description: 'Articles',
      projectImageUrl: 'https://example.com/blog.png',
      githubUrl: null,
      demoUrl: null,
      position: 5,
      kind: null,
      scope: null,
      role: null,
      context: null,
      achievements: null,
      results: null,
      tags: [],
    });
  });

  it('edits the case study of a project', async () => {
    proj.updateProject.mockResolvedValue({ ...PROJECT });
    const user = userEvent.setup();
    render(withMode(false, <ProjectsTab />));
    await screen.findByText('Portfolio');

    await user.click(screen.getByRole('button', { name: 'Modifier Portfolio' }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByRole('group', { name: 'Étude de cas' })).toBeInTheDocument();
    await user.type(within(dialog).getByLabelText('Type'), 'Projet personnel');
    await user.type(within(dialog).getByLabelText("Ce que j'ai fait (une réalisation par ligne)"), 'API{Enter}Tests');
    await user.click(within(dialog).getByRole('button', { name: 'Mettre à jour' }));

    expect(proj.updateProject).toHaveBeenCalledWith(20, expect.objectContaining({ kind: 'Projet personnel', achievements: 'API\nTests', results: null }));
  });

  it('shows the API error when a link is refused', async () => {
    proj.updateProject.mockRejectedValue(apiError('demoUrl: URL http(s) invalide'));
    const user = userEvent.setup();
    render(withMode(false, <ProjectsTab />));
    await screen.findByText('Portfolio');

    await user.click(screen.getByRole('button', { name: 'Modifier Portfolio' }));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText('URL de démo'), 'https://example.com/demo');
    await user.click(within(dialog).getByRole('button', { name: 'Mettre à jour' }));

    expect(await within(dialog).findByRole('alert')).toHaveTextContent('URL http(s) invalide');
  });

  it('moves a project up', async () => {
    proj.reorderProjects.mockResolvedValue([{ ...SECOND_PROJECT, position: 0 }, { ...PROJECT, position: 1 }]);
    const user = userEvent.setup();
    render(withMode(false, <ProjectsTab />));
    await screen.findByText('Portfolio');

    await user.click(screen.getByRole('button', { name: 'Monter API Next.js' }));
    expect(proj.reorderProjects).toHaveBeenCalledWith([21, 20]);
    expect(jobs()).toEqual(['API Next.js', 'Portfolio']);
  });

  it('deletes a project after confirming in a modal', async () => {
    proj.deleteProject.mockResolvedValue({} as never);
    const user = userEvent.setup();
    render(withMode(false, <ProjectsTab />));
    await screen.findByText('Portfolio');

    await user.click(screen.getByRole('button', { name: 'Supprimer Portfolio' }));
    await user.click(within(await screen.findByRole('alertdialog', { name: 'Supprimer « Portfolio » ?' })).getByRole('button', { name: 'Oui' }));
    expect(proj.deleteProject).toHaveBeenCalledWith(20);
  });
});

describe('ProjectsTab (case studies switched off)', () => {
  it('has no link to the public case study page', async () => {
    flags.caseStudies = false;
    render(withMode(false, <ProjectsTab />));
    await screen.findByText('Portfolio');
    expect(screen.queryByRole('link', { name: 'Voir Portfolio sur le site' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Modifier Portfolio' })).toBeInTheDocument();
  });
});

describe('ProjectsTab (read-only visitor)', () => {
  it('keeps the links but hides every editing control', async () => {
    render(withMode(true, <ProjectsTab />));
    await screen.findByText('Portfolio');
    expect(screen.getByRole('link', { name: 'github.com/x/portfolio' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Voir Portfolio sur le site' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Nouveau projet' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^(Modifier|Supprimer|Monter|Descendre) / })).not.toBeInTheDocument();
  });
});
