import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { setupDatabase } from './helpers';
import { notifyNewContact } from '@/server/services/notifications';
import { DEFAULT_HERO } from '@/server/services/hero';

const contact = { name: 'Ada', email: 'ada@example.com', subject: 'Mission\r\nBcc: victim@example.com', message: 'Hello <b>there</b>' };

// Resend is never called for real: fetch is replaced by a spy
const fetchMock = vi.fn();

beforeAll(setupDatabase);

beforeEach(() => {
  fetchMock.mockReset().mockResolvedValue(new Response('{}', { status: 200 }));
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

const sentBody = () => JSON.parse(fetchMock.mock.calls[0][1].body);

describe('contact notification', () => {
  it('does nothing without a Resend API key', async () => {
    await notifyNewContact(contact);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('emails the hero contact address by default, with reply-to set to the visitor', async () => {
    vi.stubEnv('RESEND_API_KEY', 're_test');
    await notifyNewContact(contact);

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.resend.com/emails');
    expect(init.headers.Authorization).toBe('Bearer re_test');
    expect(sentBody()).toMatchObject({ to: DEFAULT_HERO.email, reply_to: contact.email });
  });

  it('uses CONTACT_NOTIFY_EMAIL and CONTACT_FROM_EMAIL when set', async () => {
    vi.stubEnv('RESEND_API_KEY', 're_test');
    vi.stubEnv('CONTACT_NOTIFY_EMAIL', 'me@example.com');
    vi.stubEnv('CONTACT_FROM_EMAIL', 'Portfolio <contact@example.com>');
    await notifyNewContact(contact);
    expect(sentBody()).toMatchObject({ to: 'me@example.com', from: 'Portfolio <contact@example.com>' });
  });

  it('strips line breaks from the subject (no header injection) and sends plain text only', async () => {
    vi.stubEnv('RESEND_API_KEY', 're_test');
    await notifyNewContact(contact);
    const body = sentBody();
    expect(body.subject).not.toMatch(/[\r\n]/);
    expect(body).not.toHaveProperty('html');
    expect(body.text).toContain('Hello <b>there</b>');
  });

  it('never throws when Resend fails: the message is already saved', async () => {
    vi.stubEnv('RESEND_API_KEY', 're_test');
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    fetchMock.mockResolvedValueOnce(new Response('{"message":"invalid key"}', { status: 401 }));
    await expect(notifyNewContact(contact)).resolves.toBeUndefined();

    fetchMock.mockRejectedValueOnce(new Error('network down'));
    await expect(notifyNewContact(contact)).resolves.toBeUndefined();

    expect(consoleError).toHaveBeenCalledTimes(2);
    consoleError.mockRestore();
  });
});
