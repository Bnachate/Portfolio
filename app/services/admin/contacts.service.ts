import apiClient, { unwrap } from '@/app/config/api.config';
import type { ContactMessage, ContactStatus } from '@/app/types/api';

export const getContacts = () => unwrap<ContactMessage[]>(apiClient.get('/contacts'));

export const updateContactStatus = (id: number, status: ContactStatus) =>
  unwrap<ContactMessage>(apiClient.patch(`/contacts/${id}`, { status }));

export const deleteContact = (id: number) => apiClient.delete(`/contacts/${id}`);

/** Public: used by the contact form. */
export const sendContactMessage = (payload: { name: string; email: string; subject: string; message: string; website?: string }) =>
  apiClient.post('/contacts', payload);
