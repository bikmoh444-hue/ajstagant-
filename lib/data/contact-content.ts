import type { ContactContent } from '@/lib/types/contact';
import { demoContent } from './demo';

export const contactContent: ContactContent = {
  hero: { badge: 'PARLONS FUTSAL', title: 'CONTACTEZ-NOUS', subtitle: 'Une question, un projet, l’envie de rejoindre le club ?', arabicSubtitle: 'تواصلوا معنا' },
  association_name: 'A.J.S TAGANT — الجمعية الشبابية لرياضة تكانت',
  locality: demoContent.contactInfo.location,
  phone: demoContent.contactInfo.phone, email: demoContent.contactInfo.email,
  facebook_url: null, instagram_url: null, whatsapp_url: null, map_url: null,
};
