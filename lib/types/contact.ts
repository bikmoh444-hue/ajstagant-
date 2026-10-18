import type { PageHero } from './pages';

export interface ContactContent {
  hero: PageHero; association_name: string; locality: string;
  phone: string | null; email: string | null;
  facebook_url: string | null; instagram_url: string | null; whatsapp_url: string | null;
  map_url: string | null;
}
export interface ContactInput { name: string; email: string; phone?: string; subject?: string; message: string; website?: string }
export interface ContactMessage extends Omit<ContactInput, 'website'> {
  subject: string;
  id: string; created_at: string; status: 'new' | 'read' | 'archived';
}
export interface ContactMessageRepository { save(message: ContactMessage): Promise<void> }
export type ContactField = keyof ContactInput;
export type ContactErrors = Partial<Record<ContactField, string[]>>;
export interface ContactResponse { message: string; errors?: ContactErrors; id?: string }
