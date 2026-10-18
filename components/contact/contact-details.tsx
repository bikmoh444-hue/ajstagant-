'use client';
import { useLocale } from '@/components/ui/locale-provider';
import { MapPin, Mail, Phone, Facebook, Instagram, MessageCircle } from 'lucide-react';
import { configuredLink } from '@/lib/utils/sports';
import type { ContactContent } from '@/lib/types/contact';

export function ContactDetails({ content: c }: { content: ContactContent }) {
  const {t}=useLocale();
  const socials = [
    { label: 'Facebook', url: configuredLink(c.facebook_url), icon: Facebook },
    { label: 'Instagram', url: configuredLink(c.instagram_url), icon: Instagram },
    { label: 'WhatsApp', url: configuredLink(c.whatsapp_url), icon: MessageCircle },
  ];
  const mapUrl = configuredLink(c.map_url);
  return <div className="dedicated-contact-details"><p className="kicker">{t('L’ASSOCIATION À VOTRE ÉCOUTE')}</p><h2 className="inner-section-title">{t('FAISONS ÉQUIPE.')}</h2>
    <p className="contact-association-name">{c.association_name}</p><div className="contact-details">
      <p><MapPin /><span><strong>{t('Localité')}</strong>{c.locality}</span></p>
      <p><Phone /><span><strong>{t('Téléphone')}</strong>{c.phone ? <a href={`tel:${c.phone}`}>{c.phone}</a> : t('Numéro officiel à renseigner')}</span></p>
      <p><Mail /><span><strong>{t('Email')}</strong>{c.email ? <a href={`mailto:${c.email}`}>{c.email}</a> : t('Adresse officielle à renseigner')}</span></p>
    </div><h3 className="contact-social-title">{t('SUIVEZ LE CLUB')}</h3><div className="contact-network-list">{socials.map(social => <div key={social.label}><social.icon size={18} />{social.url ? <a href={social.url} target="_blank" rel="noopener noreferrer">{social.label}</a> : <span>{social.label}<small>{t('Lien officiel à renseigner')}</small></span>}</div>)}</div>
    {mapUrl && <a className="button royal contact-map-link" href={mapUrl} rel="noopener noreferrer" target="_blank"><MapPin size={16} />VOIR LA LOCALISATION</a>}
  </div>;
}
