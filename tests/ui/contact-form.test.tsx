// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosError, type AxiosResponse } from 'axios';
import { ContactForm } from '@/app/components/contact/ContactForm';
import { sendContactMessage } from '@/app/services/admin/contacts.service';

vi.mock('@/app/services/admin/contacts.service', () => ({ sendContactMessage: vi.fn() }));
const send = vi.mocked(sendContactMessage);

const apiError = (status: number, message: string) =>
  new AxiosError('Request failed', String(status), undefined, undefined, { status, data: { message } } as AxiosResponse);

async function fillForm() {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Nom'), 'Ada Lovelace');
  await user.type(screen.getByLabelText('E-mail'), 'ada@example.com');
  await user.type(screen.getByLabelText('Sujet'), 'Proposition de mission');
  await user.type(screen.getByLabelText('Message'), 'Bonjour !');
  return user;
}

describe('ContactForm', () => {
  it('sends the message and shows a confirmation, then allows another message', async () => {
    send.mockResolvedValue({} as never);
    render(<ContactForm />);
    const user = await fillForm();

    await user.click(screen.getByRole('button', { name: /envoyer le message/i }));

    expect(send).toHaveBeenCalledWith({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      subject: 'Proposition de mission',
      message: 'Bonjour !',
      website: '',
    });
    expect(await screen.findByText('Message envoyé !')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Envoyer un autre message' }));
    expect(screen.getByLabelText('Nom')).toHaveValue('');
  });

  it('marks every visible field as required, with an email input', () => {
    render(<ContactForm />);
    for (const label of ['Nom', 'E-mail', 'Sujet', 'Message']) {
      expect(screen.getByLabelText(label)).toBeRequired();
    }
    expect(screen.getByLabelText('E-mail')).toHaveAttribute('type', 'email');
  });

  it('hides the honeypot field from people and assistive technologies', () => {
    render(<ContactForm />);
    const honeypot = screen.getByLabelText('Site web');
    expect(honeypot.closest('[aria-hidden="true"]')).not.toBeNull();
    expect(honeypot).toHaveAttribute('tabindex', '-1');
  });

  it('shows the rate limit message returned by the API', async () => {
    send.mockRejectedValue(apiError(429, 'Trop de tentatives. Merci de réessayer un peu plus tard.'));
    render(<ContactForm />);
    const user = await fillForm();

    await user.click(screen.getByRole('button', { name: /envoyer le message/i }));

    expect(await screen.findByText('Trop de tentatives. Merci de réessayer un peu plus tard.')).toBeInTheDocument();
    // The visitor's input is kept so they can retry later
    expect(screen.getByLabelText('Message')).toHaveValue('Bonjour !');
  });

  it('shows a generic message when the server is unreachable', async () => {
    send.mockRejectedValue(new Error('Network Error'));
    render(<ContactForm />);
    const user = await fillForm();

    await user.click(screen.getByRole('button', { name: /envoyer le message/i }));

    expect(await screen.findByText("Le message n'a pas pu être envoyé. Réessayez plus tard.")).toBeInTheDocument();
  });
});
