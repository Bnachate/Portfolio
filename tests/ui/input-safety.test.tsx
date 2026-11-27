// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactForm } from '@/app/components/contact/ContactForm';
import LoginPage from '@/app/auth/login/page';
import { HeroTab } from '@/app/components/admin/HeroTab';
import { ProjectsTab } from '@/app/components/admin/ProjectsTab';
import { ExperienceTab } from '@/app/components/admin/ExperienceTab';
import { TagsTab } from '@/app/components/admin/TagsTab';
import { ContactsTab } from '@/app/components/admin/ContactsTab';
import Home from '@/app/page';
import ProjectPage from '@/app/projets/[id]/page';
import ExperiencePage from '@/app/experience/page';
import EmployerPage from '@/app/experience/[slug]/page';
import SkillsPage from '@/app/competences/page';
import { ReadOnlyProvider } from '@/app/admin/ReadOnlyContext';
import { sendContactMessage, getContacts } from '@/app/services/admin/contacts.service';
import { login } from '@/app/services/auth.service';
import { getHero, saveHero } from '@/app/services/admin/hero.service';
import { createProject, getProjects } from '@/app/services/admin/projects.service';
import { createExperience, getExperiences, getTags } from '@/app/services/admin/experiences.service';
import * as tagsService from '@/app/services/admin/tags.service';
import { getPublicHero } from '@/server/services/hero';
import { findProject, listProjects } from '@/server/services/projects';
import { findEmployer, listEmployers, listExperiences, type EmployerDTO } from '@/server/services/experiences';
import { listTags } from '@/server/services/tags';
import { listSkillDomains } from '@/server/services/skill-domains';
import { getSkillDomains } from '@/app/services/admin/skill-domains.service';
import type { Experience, Hero as HeroData, Project } from '@/app/types/api';

vi.mock('@/app/services/admin/contacts.service', () => ({
  sendContactMessage: vi.fn(),
  getContacts: vi.fn(),
  updateContactStatus: vi.fn(),
  deleteContact: vi.fn(),
}));
vi.mock('@/app/services/auth.service', () => ({ login: vi.fn(), logout: vi.fn() }));
vi.mock('@/app/services/admin/hero.service', () => ({ getHero: vi.fn(), saveHero: vi.fn() }));
vi.mock('@/app/services/admin/projects.service', () => ({
  getProjects: vi.fn(),
  createProject: vi.fn(),
  updateProject: vi.fn(),
  deleteProject: vi.fn(),
  reorderProjects: vi.fn(),
}));
vi.mock('@/app/services/admin/experiences.service', () => ({
  getExperiences: vi.fn(),
  createExperience: vi.fn(),
  updateExperience: vi.fn(),
  deleteExperience: vi.fn(),
  reorderExperiences: vi.fn(),
  getTags: vi.fn(),
  createTag: vi.fn(),
}));
// Public pages are server components reading the database through these services
vi.mock('@/server/services/hero', () => ({ getPublicHero: vi.fn() }));
vi.mock('@/server/services/projects', () => ({ listProjects: vi.fn(), findProject: vi.fn() }));
vi.mock('@/server/services/experiences', () => ({ listExperiences: vi.fn(), listEmployers: vi.fn(), findEmployer: vi.fn() }));
vi.mock('@/server/services/tags', () => ({ listTags: vi.fn() }));
vi.mock('@/server/services/skill-domains', () => ({ listSkillDomains: vi.fn() }));
vi.mock('@/app/services/admin/skill-domains.service', () => ({ getSkillDomains: vi.fn() }));
// Case study pages: on by default in these tests (the code stays covered), switched off per test
const flags = vi.hoisted(() => ({ caseStudies: true }));
vi.mock('@/app/config/content', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/app/config/content')>()),
  get CASE_STUDIES_ENABLED() {
    return flags.caseStudies;
  },
}));

vi.mock('@/app/services/admin/tags.service', () => ({
  getTags: vi.fn(),
  getTagsWithUsage: vi.fn(),
  createTag: vi.fn(),
  updateTag: vi.fn(),
  deleteTag: vi.fn(),
}));

const BLANK = '   ';
const XSS = '<img src=x onerror="window.__xss=1"><script>window.__xss=1</script>';
const xssRan = () => (window as { __xss?: number }).__xss !== undefined;
const admin = (ui: React.ReactNode) => <ReadOnlyProvider value={false}>{ui}</ReadOnlyProvider>;

const HERO: HeroData = {
  title: 'Titre',
  subtitle: 'Sous-titre',
  description: 'Description',
  primaryButtonText: 'Contact',
  primaryButtonUrl: '/contact',
  secondaryButtonText: 'Projets',
  secondaryButtonUrl: '/projets',
  githubUrl: 'https://github.com/someone',
  linkedinUrl: 'https://www.linkedin.com/in/someone/',
  email: 'me@example.com',
  availabilityEnabled: true,
  availabilityText: 'Disponible',
};

beforeEach(() => {
  delete (window as { __xss?: number }).__xss;
  vi.mocked(getTags).mockResolvedValue([{ id: 1, name: 'Java', domainId: null }]);
  vi.mocked(getExperiences).mockResolvedValue([]);
  vi.mocked(getProjects).mockResolvedValue([]);
  vi.mocked(getHero).mockResolvedValue({ ...HERO });
  vi.mocked(getSkillDomains).mockResolvedValue([]);
  vi.mocked(tagsService.getTagsWithUsage).mockResolvedValue([{ id: 1, name: 'Java', domainId: null, experienceCount: 0, projectCount: 0 }]);
});

describe('blank or whitespace-only input never reaches the API', () => {
  it.each(['Nom', 'Sujet', 'Message'])('contact form: %s made of spaces', async (blankField) => {
    const user = userEvent.setup();
    render(<ContactForm />);
    for (const [label, value] of [['Nom', 'Ada'], ['E-mail', 'ada@example.com'], ['Sujet', 'Sujet'], ['Message', 'Bonjour']] as const) {
      await user.type(screen.getByLabelText(label), label === blankField ? BLANK : value);
    }
    await user.click(screen.getByRole('button', { name: /envoyer le message/i }));

    expect(sendContactMessage).not.toHaveBeenCalled();
    expect(screen.getByText('Merci de remplir tous les champs.')).toBeInTheDocument();
  });

  it('login: a password made of spaces is not sent (it would count towards the rate limit)', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);
    await user.type(screen.getByLabelText('E-mail'), 'admin@example.com');
    await user.type(screen.getByLabelText('Mot de passe'), BLANK);
    await user.click(screen.getByRole('button', { name: 'Se connecter' }));

    expect(login).not.toHaveBeenCalled();
    expect(screen.getByText('Veuillez saisir votre email et votre mot de passe')).toBeInTheDocument();
  });

  it('hero: a field made of spaces blocks the save and names the field', async () => {
    const user = userEvent.setup();
    render(admin(<HeroTab />));
    const title = await screen.findByLabelText('Titre principal');
    await user.clear(title);
    await user.type(title, BLANK);
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }));

    expect(saveHero).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent('Champ requis : Titre principal');
  });

  it('project: "Créer" stays disabled and Enter does nothing while the title is blank', async () => {
    const user = userEvent.setup();
    render(admin(<ProjectsTab />));
    await user.click(await screen.findByRole('button', { name: /nouveau projet/i }));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText('Titre du projet'), BLANK);
    await user.type(within(dialog).getByLabelText("URL de l'image"), 'https://example.com/i.png');
    await user.type(within(dialog).getByLabelText('Description'), 'Description');

    expect(within(dialog).getByRole('button', { name: 'Créer' })).toBeDisabled();
    await user.type(within(dialog).getByLabelText('Titre du projet'), '{Enter}');
    expect(createProject).not.toHaveBeenCalled();
  });

  it('experience: "Créer" stays disabled while the job title is blank', async () => {
    const user = userEvent.setup();
    render(admin(<ExperienceTab />));
    await user.click(await screen.findByRole('button', { name: /nouvelle expérience/i }));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText('Titre du poste'), BLANK);
    await user.type(within(dialog).getByLabelText('Entreprise'), 'ACME');
    await user.type(within(dialog).getByLabelText('Date de début'), '2024-01-01');
    await user.type(within(dialog).getByLabelText('Description'), 'Description');
    await user.click(within(dialog).getByLabelText('Tags'));
    await user.click(await screen.findByRole('menuitemcheckbox', { name: 'Java' }));
    await user.keyboard('{Escape}');

    expect(within(dialog).getByRole('button', { name: 'Créer' })).toBeDisabled();
    await user.type(within(dialog).getByLabelText('Entreprise'), '{Enter}');
    expect(createExperience).not.toHaveBeenCalled();
  });

  it('experience form: a tag made of spaces cannot be created', async () => {
    const user = userEvent.setup();
    render(admin(<ExperienceTab />));
    await user.click(await screen.findByRole('button', { name: /nouvelle expérience/i }));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText('Nom du nouveau tag'), BLANK);
    expect(within(dialog).getByRole('button', { name: 'Créer le tag' })).toBeDisabled();
  });

  it('tags tab: blank creation is disabled and a blank rename is cancelled', async () => {
    const user = userEvent.setup();
    render(admin(<TagsTab />));
    await screen.findByText('Java');

    await user.type(screen.getByLabelText('Nom du nouveau tag'), BLANK);
    expect(screen.getByRole('button', { name: 'Ajouter' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Renommer Java' }));
    const input = screen.getByLabelText('Nouveau nom pour Java');
    await user.clear(input);
    await user.type(input, `${BLANK}{Enter}`);
    expect(tagsService.updateTag).not.toHaveBeenCalled();
    expect(screen.getByText('Java')).toBeInTheDocument();
  });
});

describe('injection payloads are displayed as plain text, never run', () => {
  it('admin messages: a hostile message shows as text', async () => {
    vi.mocked(getContacts).mockResolvedValue([
      { id: 1, name: XSS, email: 'ada@example.com', subject: XSS, message: XSS, status: 'read', createdAt: '2026-11-20T10:00:00.000Z' },
    ]);
    const user = userEvent.setup();
    const { container } = render(<ContactsTab />);

    expect(await screen.findAllByText(XSS)).not.toHaveLength(0);
    await user.click(within(screen.getByRole('list', { name: 'Messages reçus' })).getByRole('button'));
    const article = screen.getByRole('article');

    expect(within(article).getAllByText(XSS).length).toBeGreaterThanOrEqual(3);
    expect(container.querySelector('img, script')).toBeNull();
    expect(xssRan()).toBe(false);
  });

  it('tag names with HTML show literally', async () => {
    vi.mocked(tagsService.getTagsWithUsage).mockResolvedValue([{ id: 2, name: '<b>gras</b>', domainId: null, experienceCount: 0, projectCount: 0 }]);
    const { container } = render(admin(<TagsTab />));
    expect(await screen.findByText('<b>gras</b>')).toBeInTheDocument();
    expect(container.querySelector('b')).toBeNull();
  });

  it('public pages render hostile content as text', async () => {
    const experience: Experience = {
      id: 1,
      job: XSS,
      company: XSS,
      companyId: 1,
      companySlug: 'xss',
      description: XSS,
      startDate: '2024-01-01',
      endDate: null,
      position: 0,
      tags: [{ id: 1, name: XSS }],
    };
    const project: Project = {
      id: 1,
      title: XSS,
      description: XSS,
      projectImageUrl: 'https://example.com/i.png',
      githubUrl: null,
      demoUrl: null,
      position: 0,
      kind: XSS,
      scope: XSS,
      role: XSS,
      context: XSS,
      achievements: XSS,
      results: XSS,
      tags: [{ id: 1, name: XSS }],
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- visitors never get the email
    const { email, ...publicHero } = { ...HERO, title: XSS, subtitle: XSS, description: XSS, availabilityText: XSS };
    vi.mocked(getPublicHero).mockResolvedValue(publicHero);
    vi.mocked(listExperiences).mockResolvedValue([experience]);
    // Context with a hostile paragraph and a hostile bullet
    const employer: EmployerDTO = {
      id: 1, name: XSS, slug: 'xss', sector: XSS, websiteUrl: 'https://example.com/', context: `${XSS}\n- ${XSS}`,
      startDate: '2024-01-01', endDate: null, experiences: [experience],
    };
    vi.mocked(listEmployers).mockResolvedValue([employer]);
    vi.mocked(findEmployer).mockResolvedValue(employer);
    vi.mocked(listProjects).mockResolvedValue([project]);
    vi.mocked(findProject).mockResolvedValue(project);
    vi.mocked(listTags).mockResolvedValue([{ id: 1, name: XSS, domainId: 1 }]);
    vi.mocked(listSkillDomains).mockResolvedValue([{ id: 1, name: XSS, position: 0 }]);

    const pages = [
      await Home(),
      await ProjectPage({ params: Promise.resolve({ id: '1' }) }),
      await ExperiencePage(),
      await EmployerPage({ params: Promise.resolve({ slug: 'xss' }) }),
      await SkillsPage(),
    ];
    for (const page of pages) {
      const { container, unmount } = render(page);
      expect(screen.getAllByText(XSS)).not.toHaveLength(0);
      // The only script is the JSON-LD of the home page, serialized without a closing tag
      for (const script of container.querySelectorAll('script')) {
        expect(script).toHaveAttribute('type', 'application/ld+json');
        expect(script.textContent).not.toContain('</script');
      }
      // Only real images (profile photo, project screenshot), none created from the text
      expect([...container.querySelectorAll('img')].every((img) => !img.getAttribute('onerror'))).toBe(true);
      unmount();
    }
    expect(xssRan()).toBe(false);
  });
});
