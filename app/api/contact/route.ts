import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { contactFieldErrors, contactSchema } from '@/lib/contact/schema';
import { contactRateLimit } from '@/lib/contact/rate-limit';
import { ContactQuotaExceeded, ContactStorageUnavailable, getContactMessageRepository } from '@/lib/contact/message-repository';
import type { ContactMessage, ContactResponse } from '@/lib/types/contact';

export const runtime = 'nodejs';
const MAX_BODY_BYTES = 24_000;

function reply(body: ContactResponse, status: number, headers: Record<string, string> = {}) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store', ...headers } });
}

async function readBody(request: Request): Promise<string | null> {
  if (!request.body) return '';
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) { await reader.cancel(); return null; }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  return Buffer.concat(chunks).toString('utf8');
}

export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  // L'URL interne Next peut utiliser localhost. Host reste l'autorité demandée
  // par le navigateur ; derrière un proxy TLS, configurer l'origine publique.
  const internalUrl = new URL(request.url);
  let expectedOrigin: string;
  try {
    expectedOrigin = new URL(process.env.CONTACT_PUBLIC_ORIGIN?.trim() || `${internalUrl.protocol}//${request.headers.get('host') ?? internalUrl.host}`).origin;
  } catch { return reply({ message: 'Le service de contact est temporairement indisponible.' }, 503); }
  if (origin && origin !== expectedOrigin) return reply({ message: 'Origine de la requête non autorisée.' }, 403);
  const quota = contactRateLimit(request.headers);
  if (!quota.allowed) return reply({ message: 'Trop de tentatives. Réessayez dans quelques minutes.' }, 429, { 'Retry-After': String(quota.retryAfter) });
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) return reply({ message: 'Le format de la requête est invalide.' }, 415);
  let payload: unknown;
  try {
    const raw = await readBody(request);
    if (raw === null) return reply({ message: 'Votre message dépasse la taille autorisée.' }, 413);
    payload = JSON.parse(raw);
  } catch { return reply({ message: 'La requête ne peut pas être lue.' }, 400); }
  const parsed = contactSchema.safeParse(payload);
  if (!parsed.success) {
    const errors = contactFieldErrors(parsed.error);
    if (errors.website) return reply({ message: 'La soumission a été refusée.' }, 400);
    return reply({ message: 'Vérifiez les champs indiqués.', errors }, 400);
  }
  const { name, email, phone, subject, message } = parsed.data;
  const contact: ContactMessage = { id: randomUUID(), created_at: new Date().toISOString(), status: 'new', name, email, phone: phone || undefined, subject, message };
  try {
    const source=process.env.CONTACT_TRUST_PROXY==='true'?request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()??'shared':'shared';
    await getContactMessageRepository(source).save(contact);
    return reply({ id: contact.id, message: 'Votre message a été envoyé avec succès. Nous vous répondrons dès que possible.' }, 201);
  } catch (error) {
    if(error instanceof ContactQuotaExceeded)return reply({message:'Trop de tentatives. Réessayez dans quelques minutes.'},429,{'Retry-After':'900'});
    if (error instanceof ContactStorageUnavailable) return reply({ message: 'Le service de contact n’est pas encore activé. Votre message n’a pas été envoyé. Réessayez ultérieurement.' }, 503);
    return reply({ message: 'L’enregistrement a échoué. Votre message n’a pas été envoyé. Veuillez réessayer.' }, 500);
  }
}
