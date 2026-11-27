// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SiteHeader } from '@/app/components/site/SiteHeader';
import { SiteFooter } from '@/app/components/site/SiteFooter';
import { buildSkillGroups, currentExperience, experienceSummary, toBulletPoints } from '@/app/components/site/data';
import Home from '@/app/page';
import ProjectsPage from '@/app/projets/page';
import ProjectPage from '@/app/projets/[id]/page';
import ExperiencePage from '@/app/experience/page';
import EmployerPage from '@/app/experience/[slug]/page';
import SkillsPage from '@/app/competences/page';
import ContactPage from '@/app/contact/page';
import sitemap from '@/app/sitemap';
import { LOREM } from '@/app/config/content';
import { getPublicHero } from '@/server/services/hero';
import { findProject, listProjects } from '@/server/services/projects';
import { findEmployer, listEmployers, listExperiences, type EmployerDTO } from '@/server/services/experiences';
import { listTags } from '@/server/services/tags';
import { listSkillDomains } from '@/server/services/skill-domains';
import { getContentDates, getEmployerDates, getProjectDates } from '@/server/services/sitemap';
import type { Experience, Project, SkillDomain, TagWithDomain } from '@/app/types/api';

// Pages are server components reading the database through these services
vi.mock('@/server/services/hero', () => ({ getPublicHero: vi.fn() }));
vi.mock('@/server/services/projects', () => ({ listProjects: vi.fn(), findProject: vi.fn() }));
vi.mock('@/server/services/experiences', () => ({ listExperiences: vi.fn(), listEmployers: vi.fn(), findEmployer: vi.fn() }));
vi.mock('@/server/services/tags', () => ({ listTags: vi.fn() }));
vi.mock('@/server/services/skill-domains', () => ({ listSkillDomains: vi.fn() }));
vi.mock('@/server/services/sitemap', () => ({
  getContentDates: vi.fn(async () => ({ hero: null, experiences: null, companies: null, projects: null, tags: null, skillDomains: null })),
  getEmployerDates: vi.fn(async () => [{ slug: 'weborama', updatedAt: new Date('2026-11-02T10:00:00Z') }]),
  getProjectDates: vi.fn(async () => [{ id: 7, updatedAt: new Date('2026-11-01T10:00:00Z') }]),
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND');
  },
  redirect: (url: string) => {
    throw new Error(`NEXT_REDIRECT ${url}`);
  },
}));
// Case study pages: on by default in these tests (the code stays covered), switched off per test
const flags = vi.hoisted(() => ({ caseStudies: true }));
vi.mock('@/app/config/content', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/app/config/content')>()),
  get CASE_STUDIES_ENABLED() {
    return flags.caseStudies;
  },
}));

const HERO = {
  title: 'Développeur Full-Stack',
  subtitle: "6 ans d'expérience",
  description: 'Bonjour',
  primaryButtonText: 'Me contacter',
  primaryButtonUrl: '/contact',
  secondaryButtonText: 'Voir mes projets',
  secondaryButtonUrl: '/projets',
  githubUrl: 'https://github.com/someone',
  linkedinUrl: 'https://www.linkedin.com/in/someone/',
  availabilityEnabled: true,
  availabilityText: 'Ouvert aux opportunités, Paris',
};

// Display order comes from the database: "API et données" first here
const DOMAINS: SkillDomain[] = [
  { id: 7, name: 'API et données', position: 0 },
  { id: 3, name: 'Front-end', position: 1 },
  { id: 9, name: 'Mobile', position: 2 },
];

const TAGS: TagWithDomain[] = [
  { id: 1, name: 'Vue.js', domainId: 3 },
  { id: 2, name: 'React', domainId: 3 },
  { id: 3, name: 'Node.js', domainId: 7 },
  { id: 4, name: 'Cobol', domainId: null },
  { id: 5, name: 'Unused', domainId: 3 },
];

const EXPERIENCES: Experience[] = [
  {
    id: 10,
    job: 'Développeur Full-Stack',
    company: 'Weborama',
    companyId: 1,
    companySlug: 'weborama',
    description: '• Conception des API\n• Revues de code',
    startDate: '2026-01-01',
    endDate: null,
    position: 0,
    tags: [{ id: 1, name: 'Vue.js' }, { id: 3, name: 'Node.js' }],
  },
  {
    id: 11,
    job: 'Développeur React',
    company: 'Ipocamp',
    companyId: 2,
    companySlug: 'ipocamp',
    description: 'Applications React',
    startDate: '2021-04-01',
    endDate: '2023-01-01',
    position: 1,
    tags: [{ id: 2, name: 'React' }, { id: 3, name: 'Node.js' }],
  },
];

const EMPLOYERS: EmployerDTO[] = [
  {
    id: 1,
    name: 'Weborama',
    slug: 'weborama',
    sector: 'AdTech · Data marketing',
    websiteUrl: 'https://www.weborama.com/',
    context: "Weborama est une entreprise d’AdTech.\n\nRéférent Front-End au sein d’une équipe incluant :\n- un Scrum Master\n- 2 développeurs Front-End",
    startDate: '2026-01-01',
    endDate: null,
    experiences: [EXPERIENCES[0]],
  },
  {
    id: 2,
    name: 'Ipocamp',
    slug: 'ipocamp',
    sector: null,
    websiteUrl: null,
    context: null,
    startDate: '2021-04-01',
    endDate: '2023-01-01',
    experiences: [EXPERIENCES[1]],
  },
];

const emptyCaseStudy = { kind: null, scope: null, role: null, context: null, achievements: null, results: null };
const PROJECT: Project = {
  id: 7,
  title: 'Portfolio Next.js',
  description: 'Ce site',
  projectImageUrl: 'https://example.com/shot.png',
  githubUrl: 'https://github.com/x/portfolio',
  demoUrl: null,
  position: 0,
  ...emptyCaseStudy,
  tags: [{ id: 4, name: 'Cobol' }],
};

beforeEach(() => {
  flags.caseStudies = true;
  vi.mocked(getPublicHero).mockResolvedValue({ ...HERO });
  vi.mocked(listProjects).mockResolvedValue([{ ...PROJECT }]);
  vi.mocked(findProject).mockResolvedValue({ ...PROJECT });
  vi.mocked(listExperiences).mockResolvedValue(EXPERIENCES.map((e) => ({ ...e })));
  vi.mocked(listEmployers).mockResolvedValue(EMPLOYERS.map((e) => ({ ...e })));
  vi.mocked(findEmployer).mockImplementation(async (slug) => EMPLOYERS.find((e) => e.slug === slug) ?? null);
  vi.mocked(listTags).mockResolvedValue(TAGS.map((t) => ({ ...t })));
  vi.mocked(listSkillDomains).mockResolvedValue(DOMAINS.map((d) => ({ ...d })));
});

const noContactDetails = (container: HTMLElement) => {
  expect(container.querySelector('a[href^="mailto:"], a[href^="tel:"]')).toBeNull();
  expect(container.textContent).not.toMatch(/[\w.+-]+@[\w-]+\.[a-z]{2,}|\+33/i);
};

describe('SiteHeader', () => {
  it('links every page and the admin, marks the current one and offers the CV', () => {
    render(<SiteHeader current="experience" />);
    const nav = screen.getByRole('navigation', { name: 'Navigation principale' });
    const hrefs = within(nav).getAllByRole('link').map((link) => link.getAttribute('href'));
    expect(hrefs).toEqual(['/', '/projets', '/experience', '/competences', '/contact', '/admin', '/CV_Brahim_Nachate_Developpeur_Full-Stack.pdf']);
    expect(within(nav).getByRole('link', { name: 'Expérience' })).toHaveAttribute('aria-current', 'page');
    expect(within(nav).getByRole('link', { name: 'Accueil' })).not.toHaveAttribute('aria-current');
  });

  it('folds the navigation behind a "Menu" button that controls it', async () => {
    render(<SiteHeader current="home" />);
    const menu = screen.getByRole('button', { name: 'Menu' });
    const nav = screen.getByRole('navigation', { name: 'Navigation principale' });
    expect(menu).toHaveAttribute('aria-controls', nav.id);
    expect(menu).toHaveAttribute('aria-expanded', 'false');

    const user = userEvent.setup();
    await user.click(menu);
    expect(menu).toHaveAttribute('aria-expanded', 'true');
    await user.click(menu);
    expect(menu).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes the menu with Escape (focus back on the button), a link or a click outside', async () => {
    render(
      <>
        <SiteHeader current="home" />
        <p>Contenu de la page</p>
      </>,
    );
    const menu = screen.getByRole('button', { name: 'Menu' });
    const user = userEvent.setup();

    await user.click(menu);
    await user.tab();
    await user.keyboard('{Escape}');
    expect(menu).toHaveAttribute('aria-expanded', 'false');
    expect(menu).toHaveFocus();

    await user.click(menu);
    await user.click(screen.getByRole('link', { name: 'Projets' }));
    expect(menu).toHaveAttribute('aria-expanded', 'false');

    await user.click(menu);
    await user.click(screen.getByText('Contenu de la page'));
    expect(menu).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('SiteFooter', () => {
  it('leads to the contact form and the admin, never shows an email address', () => {
    const { container } = render(<SiteFooter links={HERO} />);
    expect(screen.getByRole('link', { name: 'Écrire à Brahim' })).toHaveAttribute('href', '/contact');
    expect(screen.getByRole('link', { name: 'Admin' })).toHaveAttribute('href', '/admin');
    expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', HERO.githubUrl);
    noContactDetails(container);
  });
});

describe('Home page', () => {
  it('shows the hero with its availability indicator and buttons', async () => {
    const { container } = render(await Home());
    expect(screen.getByRole('heading', { level: 1, name: HERO.title })).toBeInTheDocument();
    expect(screen.getByText(HERO.availabilityText)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Me contacter' })).toHaveAttribute('href', '/contact');
    expect(screen.getByRole('link', { name: 'Voir mes projets' })).toHaveAttribute('href', '/projets');
    expect(container.querySelector('script[type="application/ld+json"]')).not.toBeNull();
    noContactDetails(container);
  });

  it('hides the availability indicator when it is turned off', async () => {
    vi.mocked(getPublicHero).mockResolvedValue({ ...HERO, availabilityEnabled: false });
    render(await Home());
    expect(screen.queryByText(HERO.availabilityText)).not.toBeInTheDocument();
  });

  it('summarizes each page in its tile and shows the current position', async () => {
    render(await Home());
    const tiles = screen.getByRole('region', { name: 'Pages du portfolio' });
    expect(within(tiles).getByRole('link', { name: /1 projet\s*Projets/ })).toHaveAttribute('href', '/projets');
    expect(within(tiles).getByText(/2 postes, 2021 à \d{4}/)).toBeInTheDocument();
    expect(within(tiles).getByText('3 domaines')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Développeur Full-Stack' })).toBeInTheDocument();
    expect(screen.getByText('Conception des API')).toBeInTheDocument();
  });
});

describe('Projects page', () => {
  it('lists projects with placeholders while the case study is empty', async () => {
    render(await ProjectsPage());
    const article = screen.getByRole('heading', { level: 2, name: PROJECT.title }).closest('article')!;
    expect(within(article).getByText(LOREM.kind)).toBeInTheDocument();
    expect(within(article).getByRole('link', { name: /Lire l'étude de cas/ })).toHaveAttribute('href', '/projets/7');
    expect(within(article).getByRole('link', { name: 'Code source sur GitHub' })).toHaveAttribute('href', PROJECT.githubUrl);
    expect(within(article).queryByRole('link', { name: 'Voir la démo' })).not.toBeInTheDocument();
  });

  it('hides the case study button while the case studies are switched off', async () => {
    flags.caseStudies = false;
    render(await ProjectsPage());
    const article = screen.getByRole('heading', { level: 2, name: PROJECT.title }).closest('article')!;
    expect(within(article).queryByRole('link', { name: /Lire l'étude de cas/ })).not.toBeInTheDocument();
    expect(within(article).getByRole('link', { name: 'Code source sur GitHub' })).toBeInTheDocument();
  });

  it('announces upcoming projects when there are none', async () => {
    vi.mocked(listProjects).mockResolvedValue([]);
    render(await ProjectsPage());
    expect(screen.getByText('Les projets arrivent bientôt.')).toBeInTheDocument();
  });
});

describe('Case study page', () => {
  const page = async (id: string) => ProjectPage({ params: Promise.resolve({ id }) });

  it('shows placeholders for empty case study fields', async () => {
    render(await page('7'));
    expect(screen.getByRole('heading', { level: 1, name: PROJECT.title })).toBeInTheDocument();
    expect(screen.getByText(LOREM.context)).toBeInTheDocument();
    expect(screen.getByText(LOREM.achievements[0])).toBeInTheDocument();
    expect(screen.getByText(LOREM.results)).toBeInTheDocument();
  });

  it('shows the written case study, one achievement per line', async () => {
    vi.mocked(findProject).mockResolvedValue({
      ...PROJECT,
      kind: 'Projet personnel',
      role: 'Conception et développement',
      context: 'Mon portfolio',
      achievements: 'API REST\nTests Playwright',
      results: '96 % de couverture',
    });
    render(await page('7'));
    expect(screen.getByText('Projet personnel')).toBeInTheDocument();
    expect(screen.getByText('Mon portfolio')).toBeInTheDocument();
    expect(screen.getByText('Tests Playwright').tagName).toBe('LI');
    expect(screen.queryByText(LOREM.context)).not.toBeInTheDocument();
  });

  it('redirects to the home page while the case studies are switched off', async () => {
    flags.caseStudies = false;
    await expect(page('7')).rejects.toThrow('NEXT_REDIRECT /');
    expect(findProject).not.toHaveBeenCalledWith(7);
  });

  it('answers "not found" for an unknown or invalid id', async () => {
    vi.mocked(findProject).mockResolvedValue(null);
    await expect(page('999')).rejects.toThrow('NEXT_NOT_FOUND');
    await expect(page('abc')).rejects.toThrow('NEXT_NOT_FOUND');
  });
});

describe('sitemap', () => {
  it('lists the case study pages only when they are published', async () => {
    const urls = async () => (await sitemap()).map((entry) => new URL(entry.url).pathname);
    expect(await urls()).toContain('/projets/7');
    flags.caseStudies = false;
    expect(await urls()).toEqual(['/', '/projets', '/experience', '/competences', '/contact', '/experience/weborama']);
  });

  it('dates each page with the latest change of what it shows', async () => {
    const day = (d: number) => new Date(`2026-11-${String(d).padStart(2, '0')}T10:00:00Z`);
    vi.mocked(getContentDates).mockResolvedValueOnce({ hero: day(1), experiences: day(5), companies: day(6), projects: day(3), tags: day(2), skillDomains: day(9) });
    const entries = await sitemap();
    const lastmod = (path: string) => entries.find((e) => new URL(e.url).pathname === path)?.lastModified;
    expect(lastmod('/')).toEqual(day(9));
    expect(lastmod('/projets')).toEqual(day(3));
    // Cards: companies and positions, no tags any more
    expect(lastmod('/experience')).toEqual(day(6));
    expect(lastmod('/competences')).toEqual(day(9));
    expect(lastmod('/contact')).toBeUndefined();
    expect(lastmod('/projets/7')).toEqual(new Date('2026-11-01T10:00:00Z'));
    expect(lastmod('/experience/weborama')).toEqual(new Date('2026-11-02T10:00:00Z'));
  });

  it('still lists every page, without dates, when the database fails', async () => {
    vi.mocked(getContentDates).mockRejectedValueOnce(new Error('down'));
    vi.mocked(getProjectDates).mockRejectedValueOnce(new Error('down'));
    vi.mocked(getEmployerDates).mockRejectedValueOnce(new Error('down'));
    const entries = await sitemap();
    expect(entries.map((e) => new URL(e.url).pathname)).toEqual(['/', '/projets', '/experience', '/competences', '/contact']);
    expect(entries.every((e) => e.lastModified === undefined)).toBe(true);
  });
});

describe('Experience page', () => {
  it('shows one card per employer, leading to its page, then the education', async () => {
    render(await ExperiencePage());
    const cards = within(screen.getByRole('region', { name: 'Entreprises' })).getAllByRole('link');
    expect(cards.map((card) => card.getAttribute('href'))).toEqual(['/experience/weborama', '/experience/ipocamp']);
    expect(within(cards[0]).getByRole('heading', { level: 2, name: 'Weborama' })).toBeInTheDocument();
    expect(cards[0]).toHaveTextContent('AdTech · Data marketing');
    expect(cards[0]).toHaveTextContent('En poste');
    expect(cards[0]).toHaveTextContent('Développeur Full-Stack');
    expect(cards[1]).toHaveTextContent('Avr. 2021 - Janv. 2023');
    expect(cards[1]).not.toHaveTextContent('En poste');
    // The missions are on the employer page, not on the list
    expect(screen.queryByText('Revues de code')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Formation' })).toBeInTheDocument();
    expect(screen.getByText('Coding Academy by Epitech Paris')).toBeInTheDocument();
  });

  it('says the timeline is coming when there is no position yet', async () => {
    vi.mocked(listEmployers).mockResolvedValue([]);
    render(await ExperiencePage());
    expect(screen.getByText('Le parcours arrive bientôt.')).toBeInTheDocument();
  });
});

describe('Employer page', () => {
  const page = (slug: string) => EmployerPage({ params: Promise.resolve({ slug }) });

  it('shows the context, then each position with its missions and technologies', async () => {
    render(await page('weborama'));
    expect(screen.getByRole('heading', { level: 1, name: 'Weborama' })).toBeInTheDocument();
    expect(screen.getByText('AdTech · Data marketing')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: "Fil d'Ariane" })).toHaveTextContent('Expérience/Weborama');
    // Context: paragraphs and the team as a list
    expect(screen.getByRole('heading', { level: 2, name: 'Contexte' })).toBeInTheDocument();
    expect(screen.getByText('Weborama est une entreprise d’AdTech.').tagName).toBe('P');
    expect(screen.getByText('un Scrum Master').tagName).toBe('LI');
    // Position
    expect(screen.getByRole('heading', { level: 2, name: 'Poste actuel : Développeur Full-Stack' })).toBeInTheDocument();
    expect(screen.getByText('Revues de code').tagName).toBe('LI');
    expect(screen.getByRole('list', { name: 'Technologies : Développeur Full-Stack' })).toHaveTextContent('Vue.js');
    const site = screen.getByRole('link', { name: 'weborama.com' });
    expect(site).toHaveAttribute('href', 'https://www.weborama.com/');
    expect(site).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('leaves out the context and the website when they are not written yet', async () => {
    render(await page('ipocamp'));
    expect(screen.queryByRole('heading', { level: 2, name: 'Contexte' })).not.toBeInTheDocument();
    expect(screen.queryByText('Site')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Développeur React' })).toBeInTheDocument();
  });

  it('answers 404 for an unknown or malformed slug, without querying malformed ones', async () => {
    await expect(page('inconnue')).rejects.toThrow('NEXT_NOT_FOUND');
    vi.mocked(findEmployer).mockClear();
    await expect(page('../admin')).rejects.toThrow('NEXT_NOT_FOUND');
    await expect(page('Weborama')).rejects.toThrow('NEXT_NOT_FOUND');
    expect(findEmployer).not.toHaveBeenCalled();
  });
});

describe('Skills page', () => {
  it('groups used skills by the domains of the database, in their order', async () => {
    render(await SkillsPage());
    const headings = within(screen.getByRole('main')).getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    // Empty domains ("Mobile") are hidden; "Autres" comes last
    expect(headings).toEqual(['API et données', 'Front-end', 'Autres', 'Langues']);
    const frontEnd = screen.getByRole('heading', { level: 2, name: 'Front-end' }).closest('section')!;
    expect(within(frontEnd).getAllByRole('listitem').map((li) => li.textContent)).toEqual(['React', 'Vue.js']);
    // Every skill looks the same for now: no legend, no current / previous wording
    expect(screen.queryByText(/poste actuel|poste précédent/)).not.toBeInTheDocument();
    // Tags used nowhere are not shown; tags without a domain go to "Autres"
    expect(screen.queryByText('Unused')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Autres' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Langues' })).toBeInTheDocument();
  });
});

describe('Contact page', () => {
  it('offers the form and online profiles, never an email or a phone number', async () => {
    const { container } = render(await ContactPage());
    expect(screen.getByRole('form', { name: 'Formulaire de contact' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Restons en contact' })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'LinkedIn' })[0]).toHaveAttribute('href', HERO.linkedinUrl);
    noContactDetails(container);
  });
});

describe('page data helpers', () => {
  it('summarizes the experiences and picks the current one', () => {
    expect(experienceSummary(EXPERIENCES, new Date(2026, 10, 25))).toBe('2 postes, 2021 à 2026');
    expect(experienceSummary([])).toBe('Bientôt');
    expect(currentExperience(EXPERIENCES)?.id).toBe(10);
    expect(currentExperience([])).toBeNull();
  });

  it('turns description lines into bullet points', () => {
    expect(toBulletPoints('• Un\n- Deux\n\n* Trois\r\nQuatre')).toEqual(['Un', 'Deux', 'Trois', 'Quatre']);
  });

  it('builds skill groups in domain order, skills alphabetical, still knowing the current ones', () => {
    const groups = buildSkillGroups(DOMAINS, TAGS, EXPERIENCES, [PROJECT]);
    expect(groups.map((g) => g.title)).toEqual(['API et données', 'Front-end', 'Autres']);
    expect(groups[1].skills).toEqual([
      { name: 'React', current: false },
      { name: 'Vue.js', current: true },
    ]);
  });

  it('puts a tag whose domain is unknown in "Autres"', () => {
    const groups = buildSkillGroups([], TAGS, EXPERIENCES, [PROJECT]);
    expect(groups.map((g) => g.title)).toEqual(['Autres']);
  });
});
