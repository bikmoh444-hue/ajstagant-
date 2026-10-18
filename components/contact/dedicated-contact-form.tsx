'use client';
import { useLocale } from '@/components/ui/locale-provider';
import { useRef, useState } from 'react';
import { LoaderCircle, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { contactFieldErrors, contactSchema } from '@/lib/contact/schema';
import type { ContactErrors, ContactField, ContactResponse } from '@/lib/types/contact';

export function DedicatedContactForm({ storageMode }: { storageMode: 'local' | 'disabled' | 'supabase' }) {
  const {t}=useLocale();
  const form = useRef<HTMLFormElement>(null);
  const inFlight = useRef(false);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [notice, setNotice] = useState('');
  const errorProps = (field: ContactField) => ({ 'aria-invalid': Boolean(errors[field]), 'aria-describedby': errors[field] ? `contact-${field}-error` : undefined });
  const fieldError = (field: ContactField) => errors[field] && <p id={`contact-${field}-error`} className="contact-field-error">{t(errors[field]?.[0]??'')}</p>;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;
    const element = event.currentTarget;
    const data = new FormData(element);
    const payload = Object.fromEntries(['name', 'email', 'message'].map(key => [key, String(data.get(key) ?? '')]));
    const parsed = contactSchema.safeParse(payload);
    setNotice('');
    if (!parsed.success) {
      const validationErrors = contactFieldErrors(parsed.error);
      setErrors(validationErrors); setStatus('error'); setNotice('Veuillez corriger les champs indiqués.');
      const first = Object.keys(validationErrors)[0];
      requestAnimationFrame(() => element.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[name="${first}"]`)?.focus());
      return;
    }
    inFlight.current = true;
    setErrors({}); setStatus('loading');
    try {
      const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(parsed.data), signal: AbortSignal.timeout(15_000) });
      const result: ContactResponse = await response.json();
      if (!response.ok) { setErrors(result.errors ?? {}); setStatus('error'); setNotice(result.message || 'L’envoi a échoué. Veuillez réessayer.'); return; }
      setStatus('success'); setNotice(result.message); form.current?.reset();
    } catch { setStatus('error'); setNotice('Impossible de confirmer l’envoi. Vérifiez votre connexion avant de réessayer.'); }
    finally { inFlight.current = false; }
  }

  return <form ref={form} className="contact-form dedicated-contact-form" noValidate onSubmit={submit} aria-busy={status === 'loading'}>
    <h2>{t("ÉCRIVEZ-NOUS")}</h2><p className="form-note">{t("Les champs marqués * sont obligatoires.")}</p>
    {storageMode === 'local' ? <p className="contact-service-note">Mode local : le message est enregistré sur ce serveur. Aucun email n’est envoyé.</p> : storageMode==='disabled'?<p className="contact-service-note">L’envoi sera activé lors de l’intégration du service de messagerie du club.</p>:<p className="contact-service-note">{t("Votre message sera transmis à l’espace sécurisé de l’association.")}</p>}
    <fieldset disabled={status === 'loading'}>
      <div className="form-row"><div><label htmlFor="contact-name">{t("Nom complet")} *<input id="contact-name" name="name" autoComplete="name" maxLength={100} required {...errorProps('name')} /></label>{fieldError('name')}</div><div><label htmlFor="contact-email">{t("Email")} *<input id="contact-email" type="email" name="email" autoComplete="email" maxLength={254} required {...errorProps('email')} /></label>{fieldError('email')}</div></div>
      <label htmlFor="contact-message">{t("Message")} *<textarea id="contact-message" name="message" rows={6} maxLength={5000} required {...errorProps('message')} /></label>{fieldError('message')}
      <button type="submit" className="button primary">{status === 'loading' ? <><LoaderCircle size={17} className="contact-spinner" />{t("ENVOI EN COURS…")}</> : <><Send size={16} />{t("Envoyer le message")}</>}</button>
    </fieldset>
    {notice && <div className={`contact-feedback ${status}`} role={status === 'error' ? 'alert' : 'status'}>{status === 'success' ? <CheckCircle2 size={19} /> : <AlertCircle size={19} />}<p>{t(notice)}</p></div>}
  </form>;
}
