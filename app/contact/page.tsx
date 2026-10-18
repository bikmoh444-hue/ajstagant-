import { getPageMetadata } from '@/lib/data/metadata';
import './contact.css';
import { PageHero } from '@/components/ui/page-hero';
import { ContactDetails } from '@/components/contact/contact-details';
import { DedicatedContactForm } from '@/components/contact/dedicated-contact-form';
import { getContactContent } from '@/lib/data/repository';
import { contactStorageMode } from '@/lib/contact/config';
export async function generateMetadata(){return getPageMetadata('contact');}
export const dynamic = 'force-dynamic';
export default async function Page() {
  const content = await getContactContent();
  const configured = contactStorageMode();
  return <main id="main-content" className="contact-page"><PageHero hero={content.hero} /><section className="section"><div className="container contact-grid"><ContactDetails content={content} /><DedicatedContactForm storageMode={configured === 'local' ? 'local' : configured==='supabase'?'supabase':'disabled'} /></div></section></main>;
}
