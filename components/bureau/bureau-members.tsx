import type { Director } from '@/lib/types/pages';
import { BureauMemberCard } from './bureau-member-card';

export function BureauMembers({ members }: { members: Director[] }) {
  const president = members.find(member => member.president);
  const isAdvisor = (member: Director) => /conseill|مستشار/i.test([member.roleFr,member.roleAr,member.role].join(' '));
  const officers = members.filter(member => member.id !== president?.id && !isAdvisor(member));
  const advisors = members.filter(member => member.id !== president?.id && isAdvisor(member));
  return <>
    {president && <BureauMemberCard member={president} featured />}
    {officers.length > 0 && <section className="bureau-group" aria-labelledby="bureau-officers-title"><h2 id="bureau-officers-title" className="bureau-group-heading"><span lang="ar" dir="rtl">أعضاء المكتب</span><span aria-hidden="true"> | </span><span lang="fr" dir="ltr">Membres du bureau</span></h2><div className="bureau-members-grid">{officers.map(member => <BureauMemberCard key={member.id} member={member} />)}</div></section>}
    {advisors.length > 0 && <section className="bureau-group" aria-labelledby="bureau-advisors-title"><h2 id="bureau-advisors-title" className="bureau-group-heading"><span lang="ar" dir="rtl">المستشارون</span><span aria-hidden="true"> | </span><span lang="fr" dir="ltr">Conseillers</span></h2><div className="bureau-members-grid">{advisors.map(member => <BureauMemberCard key={member.id} member={member} />)}</div></section>}
  </>;
}
