import type { SiteContent } from '@/lib/types/site';
export const demoContent: SiteContent = {
  logoUrl: null, heroImageUrl: null, heroTitle: 'A.J.S TAGANT', heroSubtitle: 'الجمعية الشبابية لرياضة تكانت', slogan: 'La passion du futsal. La force du collectif.',
  introduction: 'A.J.S TAGANT rassemble les passionnés de football en salle autour de valeurs de partage, de respect et de dépassement de soi. Découvrez une association portée par son territoire et l’énergie de sa jeunesse.',
  facts: [{ label: 'Nom', value: 'A.J.S TAGANT' }, { label: 'Localisation', value: 'Tagant, Maroc' }, { label: 'Discipline', value: 'Football en salle · Futsal' }, { label: 'Statut', value: 'Association sportive' }],
  aboutImage: { src: null, alt: 'Photographie officielle d’un match de futsal à fournir' },
  historyContent: ['Une passion commune, une aventure collective. A.J.S TAGANT porte un projet sportif qui place la jeunesse et la pratique du futsal au cœur de son engagement.', 'Cette présentation est provisoire. Les dates de création, les étapes et les résultats du club seront renseignés à partir des informations officielles de l’association.'],
  objectives: [{ title: 'Développement des jeunes', description: 'Accompagner les talents et transmettre les valeurs du sport.', icon: 'youth' }, { title: 'Football en salle', description: 'Faire vivre et développer la pratique du futsal.', icon: 'ball' }, { title: 'Esprit d’équipe', description: 'Grandir ensemble dans le respect et la solidarité.', icon: 'team' }, { title: 'Compétitions sportives', description: 'Se dépasser et représenter fièrement nos couleurs.', icon: 'trophy' }],
  featuredPlayers: (['Gardiens', 'Défenseurs', 'Milieux', 'Attaquants'] as const).map((position, index) => ({ id: `demo-${index}`, name: `Joueur démo ${index + 1}`, position, number: [1, 4, 8, 9][index], image: { src: null, alt: `Portrait de démonstration — ${position}` } })),
  galleryImages: ['La force du collectif', 'La passion sur le terrain', 'Ensemble, plus loin'].map(caption => ({ src: null, alt: 'Photographie officielle à fournir', caption })),
  bureauMembers: ['Président', 'Vice-président', 'Secrétaire général', 'Trésorier'].map((role, index) => ({ id: `bureau-${index}`, name: 'Identité à renseigner', role, president: index === 0, image: { src: null, alt: 'Portrait officiel à fournir' } })),
  contactInfo: { location: 'Tagant, Maroc · adresse exacte à confirmer', email: null, phone: null, socials: [] },
  footerSettings: { arabicName: 'الجمعية الشبابية لرياضة تكانت', slogan: 'Plus qu’une équipe, une famille.', copyright: 'A.J.S TAGANT. Tous droits réservés.' },
};
