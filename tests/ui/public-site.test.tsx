// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { routerMock } from './setup-ui';
import { Header } from '@/app/components/Header';
import { Hero } from '@/app/components/Hero';
import { Projects } from '@/app/components/Projects';
import { ExperienceCard } from '@/app/components/experience/ExperienceCard';
import { ContactInfo } from '@/app/components/contact/ContactInfo';
import { Experience as ExperienceSection } from '@/app/components/Experience';
import { Education } from '@/app/components/Education';
import { Contact } from '@/app/components/Contact';
import { logout } from '@/app/services/auth.service';
import type { Experience, Project } from '@/app/types/api';

vi.mock('@/app/services/auth.service', () => ({ logout: vi.fn(), login: vi.fn() }));

const hero = {
  title: 'Développeur Full-Stack',
  subtitle: "7 ans d'expérience",
  description: 'Bonjour',
  primaryButtonText: 'Me contacter',
  primaryButtonUrl: '#contact',
  secondaryButtonText: 'Voir mes projets',
  secondaryButtonUrl: '#projets',
  githubUrl: 'https://github.com/someone',
  linkedinUrl: 'https://www.linkedin.com/in/someone/',
};

describe('Header', () => {
  it('scrolls to the section of the clicked link', async () => {
    const section = document.createElement('section');
    section.id = 'experience';
    section.scrollIntoView = vi.fn();
    document.body.appendChild(section);

    render(<Header isAuthenticated={false} />);
    await userEvent.click(screen.getAllByRole('button', { name: 'Expérience' })[0]);

    expect(section.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    section.remove();
  });

  it('offers visitors the read-only admin and the login page', () => {
    render(<Header isAuthenticated={false} />);
    expect(screen.getByRole('link', { name: 'Admin' })).toHaveAttribute('href', '/admin');
    expect(screen.getByRole('link', { name: 'Connexion' })).toHaveAttribute('href', '/auth/login');
    expect(screen.queryByRole('button', { name: 'Déconnexion' })).not.toBeInTheDocument();
  });

  it('opens and closes the mobile menu', async () => {
    const user = userEvent.setup();
    render(<Header isAuthenticated={false} />);

    await user.click(screen.getByRole('button', { name: 'Ouvrir le menu' }));
    // Desktop and mobile menus are both in the DOM once the mobile one is open
    expect(screen.getAllByRole('link', { name: 'Connexion' })).toHaveLength(2);

    await user.click(screen.getByRole('button', { name: 'Fermer le menu' }));
    expect(screen.getAllByRole('link', { name: 'Connexion' })).toHaveLength(1);
  });

  it('lets the admin open the panel and log out', async () => {
    vi.mocked(logout).mockResolvedValue({} as never);
    const user = userEvent.setup();
    render(<Header isAuthenticated />);

    await user.click(screen.getByRole('button', { name: 'Admin' }));
    expect(routerMock.push).toHaveBeenCalledWith('/admin');

    await user.click(screen.getByRole('button', { name: 'Déconnexion' }));
    expect(logout).toHaveBeenCalled();
    expect(routerMock.refresh).toHaveBeenCalled();
  });
});

describe('Hero', () => {
  it('shows the content and links GitHub, LinkedIn and the contact form, never an email', () => {
    const { container } = render(<Hero hero={hero} />);

    expect(screen.getByRole('heading', { level: 1, name: hero.title })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Me contacter' })).toHaveAttribute('href', '#contact');
    expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', hero.githubUrl);
    expect(screen.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('href', hero.linkedinUrl);
    expect(screen.getByRole('link', { name: 'Me contacter via le formulaire' })).toHaveAttribute('href', '#contact');
    expect(container.querySelector('a[href^="mailto:"]')).toBeNull();
  });
});

describe('Projects', () => {
  it('announces upcoming projects when there are none', () => {
    render(<Projects projects={[]} />);
    expect(screen.getByText('Les projets arrivent bientôt.')).toBeInTheDocument();
  });

  it('shows each project with its tags and links', () => {
    const project: Project = {
      id: 1,
      title: 'Portfolio',
      description: 'Mon site',
      projectImageUrl: 'https://example.com/shot.png',
      githubUrl: 'https://github.com/x/portfolio',
      demoUrl: null,
      position: 0,
      tags: [{ id: 1, name: 'Next.js' }],
    };
    render(<Projects projects={[project]} />);

    const card = screen.getByRole('heading', { name: 'Portfolio' }).parentElement!;
    expect(within(card).getByText('Next.js')).toBeInTheDocument();
    expect(within(card).getByRole('link', { name: 'Code' })).toHaveAttribute('href', project.githubUrl);
    expect(within(card).queryByRole('link', { name: 'Démo' })).not.toBeInTheDocument();
  });
});

describe('ExperienceCard', () => {
  it('shows the period, the duration and the tags', () => {
    const experience: Experience = {
      id: 1,
      job: 'Développeur React / Node.js',
      company: 'Ipocamp',
      description: '• API REST',
      startDate: '2021-04-01',
      endDate: '2023-01-01',
      position: 0,
      tags: [{ id: 1, name: 'React' }],
    };
    render(<ExperienceCard experience={experience} />);

    expect(screen.getByText('Avr. 2021 - Janv. 2023')).toBeInTheDocument();
    expect(screen.getByText('1 an 9 mois')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
  });
});

describe('Experience section', () => {
  it('lists the experiences and links the full CV', () => {
    const experience: Experience = {
      id: 1,
      job: 'Développeur Full-Stack Vue.js / Java',
      company: 'Weborama',
      description: 'Missions',
      startDate: '2026-01-01',
      endDate: null,
      position: 0,
      tags: [],
    };
    render(<ExperienceSection experiences={[experience]} />);
    expect(screen.getByRole('heading', { level: 2, name: 'Expérience' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: experience.job })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Voir le CV complet/ })).toHaveAttribute(
      'href',
      '/CV_Brahim_Nachate_Developpeur_Full-Stack.pdf',
    );
  });
});

describe('Education section', () => {
  it('shows degrees and language levels', () => {
    render(<Education />);
    expect(screen.getByRole('heading', { name: 'Code & Go' })).toBeInTheDocument();
    expect(screen.getByText('Coding Academy by Epitech Paris')).toBeInTheDocument();
    expect(screen.getByRole('meter', { name: 'Anglais : Professionnel (B2)' })).toHaveAttribute('aria-valuenow', '75');
  });
});

describe('Contact section', () => {
  it('combines the invitation and the form, anchored for the menu', () => {
    const { container } = render(<Contact />);
    expect(container.querySelector('section#contact')).not.toBeNull();
    expect(screen.getByRole('heading', { level: 2, name: 'Contactez-moi' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Envoyer le message/ })).toBeInTheDocument();
  });
});

describe('ContactInfo', () => {
  it('invites visitors to use the form and publishes no contact details', () => {
    const { container } = render(<ContactInfo />);
    expect(screen.getByText(/envoyez-moi simplement un message via le formulaire/)).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/@|\+33|\d{2} \d{2} \d{2} \d{2}/);
  });
});
