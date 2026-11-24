// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HeroTab } from '@/app/components/admin/HeroTab';
import { ContactsTab } from '@/app/components/admin/ContactsTab';
import { ReadOnlyProvider } from '@/app/admin/ReadOnlyContext';
import * as heroService from '@/app/services/admin/hero.service';
import * as contactsService from '@/app/services/admin/contacts.service';
import type { ContactMessage, Hero } from '@/app/types/api';

vi.mock('@/app/services/admin/hero.service', () => ({ getHero: vi.fn(), saveHero: vi.fn() }));
vi.mock('@/app/services/admin/contacts.service', () => ({
  getContacts: vi.fn(),
  updateContactStatus: vi.fn(),
  deleteContact: vi.fn(),
  sendContactMessage: vi.fn(),
}));
const hero = vi.mocked(heroService);
const contacts = vi.mocked(contactsService);

const HERO: Hero = {
  title: 'Développeur Full-Stack',
  subtitle: "7 ans d'expérience",
  description: 'Bonjour',
  primaryButtonText: 'Me contacter',
  primaryButtonUrl: '#contact',
  secondaryButtonText: 'Voir mes projets',
  secondaryButtonUrl: '#projets',
  githubUrl: 'https://github.com/someone',
  linkedinUrl: 'https://www.linkedin.com/in/someone/',
  email: 'private@example.com',
};

const withMode = (readOnly: boolean, ui: React.ReactNode) => <ReadOnlyProvider value={readOnly}>{ui}</ReadOnlyProvider>;

describe('HeroTab (admin)', () => {
  beforeEach(() => {
    hero.getHero.mockResolvedValue({ ...HERO });
  });

  it('previews changes live and saves them', async () => {
    hero.saveHero.mockImplementation(async (data) => data as Hero);
    const user = userEvent.setup();
    render(withMode(false, <HeroTab />));

    const title = await screen.findByLabelText('Titre principal');
    await user.clear(title);
    await user.type(title, 'Lead Developer');
    expect(screen.getByRole('heading', { level: 1, name: 'Lead Developer' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /sauvegarder les modifications/i }));
    expect(hero.saveHero).toHaveBeenCalledWith({ ...HERO, title: 'Lead Developer' });
    expect(await screen.findByText('Les modifications ont été sauvegardées avec succès !')).toBeInTheDocument();
  });

  it('"Annuler" restores the last saved version after confirmation', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const user = userEvent.setup();
    render(withMode(false, <HeroTab />));

    const subtitle = await screen.findByLabelText('Sous-titre');
    await user.clear(subtitle);
    await user.type(subtitle, 'Brouillon');
    await user.click(screen.getByRole('button', { name: 'Annuler' }));

    expect(screen.getByLabelText('Sous-titre')).toHaveValue(HERO.subtitle);
    expect(hero.saveHero).not.toHaveBeenCalled();
  });
});

describe('HeroTab (read-only visitor)', () => {
  it('shows every field disabled, no email and no save button', async () => {
    // The API omits the email for visitors
    hero.getHero.mockResolvedValue({ ...HERO, email: undefined });
    render(withMode(true, <HeroTab />));

    expect(await screen.findByLabelText('Titre principal')).toBeDisabled();
    expect(screen.getByLabelText('Email de contact')).toBeDisabled();
    expect(screen.getByLabelText('Email de contact')).toHaveValue('');
    expect(screen.getByLabelText('Email de contact')).toHaveAttribute('placeholder', 'Masqué en lecture seule');
    expect(screen.queryByRole('button', { name: /sauvegarder/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Annuler' })).not.toBeInTheDocument();
  });
});

describe('ContactsTab', () => {
  const message = (id: number, status: ContactMessage['status'], name: string): ContactMessage => ({
    id,
    name,
    email: `${name.toLowerCase()}@example.com`,
    subject: `Sujet de ${name}`,
    message: `Message de ${name}`,
    status,
    createdAt: '2026-11-20T10:00:00.000Z',
  });

  beforeEach(() => {
    contacts.getContacts.mockResolvedValue([message(1, 'new', 'Ada'), message(2, 'read', 'Alan'), message(3, 'new', 'Grace')]);
  });

  const row = (name: string) => screen.getByText(name).closest('tr')!;
  // Row actions are icon buttons named after the sender
  const viewButton = (name: string) => screen.getByRole('button', { name: `Voir le message de ${name}` });
  const deleteButton = (name: string) => screen.getByRole('button', { name: `Supprimer le message de ${name}` });

  it('lists the messages with subject and counts the new ones', async () => {
    render(<ContactsTab />);
    expect(await screen.findByText('Ada')).toBeInTheDocument();
    expect(screen.getByText(/3 messages total/)).toBeInTheDocument();
    expect(screen.getByText(/2 nouveaux/)).toBeInTheDocument();
    expect(within(row('Ada')).getByText('Sujet de Ada')).toBeInTheDocument();
    expect(within(row('Ada')).getByRole('link', { name: /ada@example.com/ })).toHaveAttribute('href', 'mailto:ada@example.com');
  });

  it('announces new messages to screen readers, and keeps the indicator slot on every row', async () => {
    render(<ContactsTab />);
    await screen.findByText('Ada');
    // The blue dot is visual only: its meaning is also given as text
    expect(within(row('Ada')).getByText('Nouveau message :')).toHaveClass('sr-only');
    expect(within(row('Alan')).queryByText('Nouveau message :')).not.toBeInTheDocument();
    // Same leading slot before the name on read and new rows, so names line up
    for (const name of ['Ada', 'Alan']) {
      const slot = screen.getByText(name).parentElement!.firstElementChild!;
      expect(slot).toHaveAttribute('aria-hidden', 'true');
      expect(slot).toHaveClass('w-2');
    }
  });

  it('opening a new message shows it and marks it as read', async () => {
    contacts.updateContactStatus.mockImplementation(async (id, status) => ({ ...message(id, status, 'Ada') }));
    const user = userEvent.setup();
    render(<ContactsTab />);
    await screen.findByText('Ada');

    await user.click(viewButton('Ada'));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Message de Ada')).toBeInTheDocument();
    expect(contacts.updateContactStatus).toHaveBeenCalledWith(1, 'read');
    expect(await within(dialog).findByText('Lu')).toBeInTheDocument();
    expect(within(dialog).getByRole('link', { name: /répondre par email/i })).toHaveAttribute('href', 'mailto:ada@example.com');
  });

  it('opening an already read message does not change its status', async () => {
    const user = userEvent.setup();
    render(<ContactsTab />);
    await screen.findByText('Alan');

    await user.click(viewButton('Alan'));
    await screen.findByRole('dialog');
    expect(contacts.updateContactStatus).not.toHaveBeenCalled();
  });

  it('marks a message as done', async () => {
    contacts.updateContactStatus.mockImplementation(async (id, status) => ({ ...message(id, status, 'Alan') }));
    const user = userEvent.setup();
    render(<ContactsTab />);
    await screen.findByText('Alan');

    await user.click(viewButton('Alan'));
    await user.click(await screen.findByRole('button', { name: /marquer comme traité/i }));
    expect(contacts.updateContactStatus).toHaveBeenCalledWith(2, 'done');
  });

  it('deletes a message only after confirmation', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true);
    contacts.deleteContact.mockResolvedValue({} as never);
    const user = userEvent.setup();
    render(<ContactsTab />);
    await screen.findByText('Grace');

    await user.click(deleteButton('Grace'));
    expect(contacts.deleteContact).not.toHaveBeenCalled();

    await user.click(deleteButton('Grace'));
    expect(contacts.deleteContact).toHaveBeenCalledWith(3);
    expect(screen.queryByText('Grace')).not.toBeInTheDocument();
    expect(confirm).toHaveBeenCalledTimes(2);
  });
});
