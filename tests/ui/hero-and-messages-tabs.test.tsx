// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
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
  primaryButtonUrl: '/contact',
  secondaryButtonText: 'Voir mes projets',
  secondaryButtonUrl: '/projets',
  githubUrl: 'https://github.com/someone',
  linkedinUrl: 'https://www.linkedin.com/in/someone/',
  email: 'private@example.com',
  availabilityEnabled: true,
  availabilityText: 'Ouvert aux opportunités, Paris',
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
    expect(within(screen.getByRole('complementary', { name: 'Aperçu' })).getByText('Lead Developer')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Enregistrer' }));
    expect(hero.saveHero).toHaveBeenCalledWith({ ...HERO, title: 'Lead Developer' });
    expect(await screen.findByRole('status')).toHaveTextContent('Enregistré : les modifications sont en ligne.');
  });

  it('turns the availability indicator off, in the preview and in the saved data', async () => {
    hero.saveHero.mockImplementation(async (data) => data as Hero);
    const user = userEvent.setup();
    render(withMode(false, <HeroTab />));

    const toggle = await screen.findByRole('switch', { name: 'Afficher le voyant de disponibilité' });
    expect(toggle).toHaveAttribute('aria-checked', 'true');
    const preview = screen.getByRole('complementary', { name: 'Aperçu' });
    expect(within(preview).getByText(HERO.availabilityText)).toBeInTheDocument();

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-checked', 'false');
    expect(within(preview).queryByText(HERO.availabilityText)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Enregistrer' }));
    expect(hero.saveHero).toHaveBeenCalledWith({ ...HERO, availabilityEnabled: false });
  });

  it('refuses a blank required field without calling the API', async () => {
    const user = userEvent.setup();
    render(withMode(false, <HeroTab />));

    const text = await screen.findByLabelText('Texte du voyant');
    await user.clear(text);
    await user.type(text, '   ');
    await user.click(screen.getByRole('button', { name: 'Enregistrer' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Champ requis : Texte du voyant');
    expect(hero.saveHero).not.toHaveBeenCalled();
  });

  it('"Annuler les modifications" restores the last saved version after confirmation', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const user = userEvent.setup();
    render(withMode(false, <HeroTab />));

    const subtitle = await screen.findByLabelText('Sous-titre');
    await user.clear(subtitle);
    await user.type(subtitle, 'Brouillon');
    await user.click(screen.getByRole('button', { name: 'Annuler les modifications' }));

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
    expect(screen.getByRole('switch', { name: 'Afficher le voyant de disponibilité' })).toBeDisabled();
    expect(screen.getByLabelText('E-mail de contact')).toBeDisabled();
    expect(screen.getByLabelText('E-mail de contact')).toHaveValue('');
    expect(screen.getByLabelText('E-mail de contact')).toHaveAttribute('placeholder', 'Masqué en lecture seule');
    expect(screen.queryByRole('button', { name: 'Enregistrer' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Annuler les modifications' })).not.toBeInTheDocument();
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

  // Each message of the list is a button named by its content (sender, date, subject)
  const listItem = (name: string) => within(screen.getByRole('list', { name: 'Messages reçus' })).getByRole('button', { name: new RegExp(name) });
  const article = (name: string) => screen.getByRole('article', { name: `Message de ${name}` });

  it('lists the messages with subject and counts the unread ones', async () => {
    const onUnread = vi.fn();
    render(<ContactsTab onUnreadCountChange={onUnread} />);
    await screen.findByText('Ada');
    expect(screen.getByText(/3 messages au total/)).toBeInTheDocument();
    expect(screen.getByText(/2 non lus/)).toBeInTheDocument();
    expect(listItem('Ada')).toHaveTextContent('Sujet de Ada');
    expect(screen.getByText('Sélectionnez un message pour le lire.')).toBeInTheDocument();
    await waitFor(() => expect(onUnread).toHaveBeenLastCalledWith(2));
  });

  it('announces unread messages to screen readers, the amber dot being visual only', async () => {
    render(<ContactsTab />);
    await screen.findByText('Ada');
    expect(listItem('Ada')).toHaveAccessibleName(/^Nouveau message : Ada/);
    expect(listItem('Alan')).not.toHaveAccessibleName(/Nouveau message/);
  });

  it('filters the unread messages', async () => {
    const user = userEvent.setup();
    render(<ContactsTab />);
    await screen.findByText('Ada');

    await user.click(screen.getByRole('button', { name: 'Non lus (2)' }));
    expect(screen.getByRole('button', { name: 'Non lus (2)' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByText('Alan')).not.toBeInTheDocument();
    expect(screen.getByText('Grace')).toBeInTheDocument();
  });

  it('opening an unread message shows it next to the list and marks it as read', async () => {
    contacts.updateContactStatus.mockImplementation(async (id, status) => ({ ...message(id, status, 'Ada') }));
    const onUnread = vi.fn();
    const user = userEvent.setup();
    render(<ContactsTab onUnreadCountChange={onUnread} />);
    await screen.findByText('Ada');

    await user.click(listItem('Ada'));

    expect(within(article('Ada')).getByText('Message de Ada')).toBeInTheDocument();
    expect(contacts.updateContactStatus).toHaveBeenCalledWith(1, 'read');
    expect(await within(article('Ada')).findByText('Lu')).toBeInTheDocument();
    expect(within(article('Ada')).getByRole('link', { name: 'Répondre par e-mail' })).toHaveAttribute(
      'href',
      'mailto:ada@example.com?subject=Re%3A%20Sujet%20de%20Ada',
    );
    expect(listItem('Ada')).toHaveAttribute('aria-current', 'true');
    expect(onUnread).toHaveBeenLastCalledWith(1);
  });

  it('opening an already read message does not change its status', async () => {
    const user = userEvent.setup();
    render(<ContactsTab />);
    await screen.findByText('Alan');

    await user.click(listItem('Alan'));
    expect(article('Alan')).toBeInTheDocument();
    expect(contacts.updateContactStatus).not.toHaveBeenCalled();
  });

  it('marks a message as done, or back as unread', async () => {
    contacts.updateContactStatus.mockImplementation(async (id, status) => ({ ...message(id, status, 'Alan') }));
    const user = userEvent.setup();
    render(<ContactsTab />);
    await screen.findByText('Alan');

    await user.click(listItem('Alan'));
    await user.click(screen.getByRole('button', { name: 'Marquer comme traité' }));
    expect(contacts.updateContactStatus).toHaveBeenCalledWith(2, 'done');
    expect(await within(article('Alan')).findByText('Traité')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Marquer comme non lu' }));
    expect(contacts.updateContactStatus).toHaveBeenLastCalledWith(2, 'new');
  });

  it('deletes a message only after the in-place confirmation', async () => {
    contacts.deleteContact.mockResolvedValue({} as never);
    const user = userEvent.setup();
    render(<ContactsTab />);
    await screen.findByText('Grace');

    await user.click(listItem('Grace'));
    await user.click(screen.getByRole('button', { name: 'Supprimer' }));
    await user.click(within(screen.getByRole('group', { name: 'Supprimer ce message ?' })).getByRole('button', { name: 'Non' }));
    expect(contacts.deleteContact).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Supprimer' }));
    await user.click(within(screen.getByRole('group', { name: 'Supprimer ce message ?' })).getByRole('button', { name: 'Oui' }));
    expect(contacts.deleteContact).toHaveBeenCalledWith(3);
    expect(screen.queryByText('Grace')).not.toBeInTheDocument();
    expect(screen.getByText('Sélectionnez un message pour le lire.')).toBeInTheDocument();
  });
});
