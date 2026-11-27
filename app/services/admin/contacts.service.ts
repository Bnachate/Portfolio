import apiClient, { unwrap } from '@/app/config/api.config';
import type { ContactMessage, ContactStatus } from '@/app/types/api';
import type { AxiosResponse } from 'axios';

export const getContacts = (): Promise<ContactMessage[]> => unwrap<ContactMessage[]>(apiClient.get('/contacts'));

export const updateContactStatus = (id: number, status: ContactStatus): Promise<ContactMessage> =>
  unwrap<ContactMessage>(apiClient.patch(`/contacts/${id}`, { status }));

export const deleteContact = (id: number): Promise<AxiosResponse<unknown>> => apiClient.delete(`/contacts/${id}`);

/** Public: used by the contact form. */
export type ContactPayload = { name: string; email: string; subject: string; message: string; website?: string };

export const sendContactMessage = (payload: ContactPayload): Promise<AxiosResponse<unknown>> =>
  apiClient.post('/contacts', payload);
