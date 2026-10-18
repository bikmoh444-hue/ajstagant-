import { ClubMedia } from '@/components/ui/club-media';
import type { StaffMember } from '@/lib/types/pages';
export function StaffCard({ member }: { member: StaffMember }) {
  return <article className="staff-card"><ClubMedia media={member.image} /><div>
    <p>{member.role}</p><h3>{member.name ?? 'Identité à renseigner'}</h3>
    {member.biography && <p className="staff-biography">{member.biography}</p>}
    {member.is_demo && <span className="demo-label">Présentation de démonstration</span>}
  </div></article>;
}
