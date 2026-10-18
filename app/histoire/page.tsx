import { getPageMetadata } from '@/lib/data/metadata';
import { getPublicSettings } from '@/lib/data/public-settings';
import { HistoryPage } from '@/components/history/history-page';
import { getHistoryContent } from '@/lib/data/repository';
import { getLocale } from '@/lib/locale';

export async function generateMetadata(){return getPageMetadata('histoire');}

export default async function Page() {
  const [content, site] = await Promise.all([getHistoryContent(), getPublicSettings()]);
  const locale=await getLocale();
  return <HistoryPage content={content} locale={locale} logoUrl={site.logo_url} clubName={site.club_name} clubNameAr={site.club_name_ar} slogan={locale==='ar'?site.slogan_ar:site.slogan} />;
}
