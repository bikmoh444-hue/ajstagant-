import Image from 'next/image';
import { canOptimizeImage } from '@/lib/utils/images';
import { UserRound, ShieldCheck } from 'lucide-react';
import type { Director } from '@/lib/types/pages';
import './bureau.css';

export function BureauMemberCard({ member, featured = false }: { member: Director; featured?: boolean }) {
  const legacyArabic = /[\u0600-\u06ff]/.test(member.name ?? '');
  const nameAr = member.nameAr || (legacyArabic ? member.name : null);
  const nameFr = member.nameFr || (!legacyArabic ? member.name : null);
  return <article className={`bureau-profile ${featured ? 'bureau-profile-president' : ''}`}>
    <div className="bureau-profile-portrait">
      {member.image.src ? <Image src={member.image.src} alt={nameAr || nameFr || member.image.alt} fill sizes={featured ? '(max-width: 640px) 90vw, 500px' : '(max-width: 640px) 90vw, (max-width: 1023px) 45vw, 320px'} quality={85} unoptimized={!canOptimizeImage(member.image.src)} /> : <div className="bureau-profile-placeholder" role="img" aria-label="Portrait à venir — الصورة قريبا"><span><UserRound aria-hidden="true" strokeWidth={1.2} /></span><p>A.J.S TAGANT</p></div>}
      {featured && <span className="bureau-president-badge"><ShieldCheck size={16} aria-hidden="true"/><span lang="ar" dir="rtl">الرئاسة</span><span lang="fr" dir="ltr">Présidence</span></span>}
    </div>
    <div className="bureau-profile-info">
      <h3 lang="ar" dir="rtl">{nameAr || 'الاسم قيد الاستكمال'}</h3>
      <p className="bureau-profile-name-fr" lang="fr" dir="ltr">{nameFr || 'Nom à compléter'}</p>
      <div className="bureau-profile-functions"><p lang="ar" dir="rtl">{member.roleAr || (/[\u0600-\u06ff]/.test(member.role) ? member.role : 'الصفة قيد الاستكمال')}</p><p lang="fr" dir="ltr">{member.roleFr || (!/[\u0600-\u06ff]/.test(member.role) ? member.role : 'Fonction à compléter')}</p></div>
      {(member.biography || member.mandate || member.is_demo) && <details className="bureau-profile-details"><summary><span lang="ar" dir="rtl">نبذة</span><span aria-hidden="true"> · </span><span lang="fr" dir="ltr">En savoir plus</span></summary>{member.biography && <p dir="auto">{member.biography}</p>}{member.mandate && <p>Mandat : {member.mandate}</p>}{member.is_demo && <p>Présentation de démonstration</p>}</details>}
    </div>
  </article>;
}
