import { getHero } from './hero';

type ContactInput = { name: string; email: string; subject: string; message: string };

/**
 * Emails the admin when a contact message arrives, through the Resend HTTP API.
 * Optional: does nothing unless RESEND_API_KEY is set.
 * Recipient: CONTACT_NOTIFY_EMAIL, or the contact email saved in the hero section.
 * Plain text only, so visitor input can never inject HTML into the email.
 */
export async function notifyNewContact(contact: ContactInput) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  const to = process.env.CONTACT_NOTIFY_EMAIL || (await getHero()).email;
  // Without a verified domain, Resend only allows its test sender (and only to your own address)
  const from = process.env.CONTACT_FROM_EMAIL || 'Portfolio <onboarding@resend.dev>';
  const subject = `Nouveau message : ${contact.subject}`.replace(/[\r\n]+/g, ' ').slice(0, 200);

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to,
        reply_to: contact.email,
        subject,
        text: [
          `De : ${contact.name} <${contact.email}>`,
          `Sujet : ${contact.subject}`,
          '',
          contact.message,
          '',
          '— Répondez directement à cet email pour écrire à cette personne.',
        ].join('\n'),
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) console.error('Contact notification failed:', response.status, await response.text());
  } catch (error) {
    // The message is already saved: a notification failure must not fail the request
    console.error('Contact notification failed:', error);
  }
}
