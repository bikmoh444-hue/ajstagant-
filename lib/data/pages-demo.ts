import type { BureauContent, GalleryContent, GalleryItem, HistoryContent, OrderedContent, TeamContent } from '@/lib/types/pages';
import { demoContent } from './demo';
import { officialHistory, officialValues } from './official-history';

const ordered = (id: string, index: number): OrderedContent => ({
  id, sort_order: index, is_visible: true, is_demo: true,
});
const missingPhoto = { src: null, alt: 'Photographie officielle à fournir' };

export const demoCategories = ['Matchs', 'Entraînements', 'Équipe', 'Événements', 'Histoire'].map((label, index) => ({
  ...ordered(`category-${index}`, index), label,
}));

const galleryTitles = [
  'Sur le terrain', 'Le travail au quotidien', 'La force du groupe',
  'La vie du club', 'Les premiers jours', 'L’esprit de compétition',
  'Préparer la prochaine rencontre', 'Un collectif uni', 'Les couleurs de Tagant',
  'Souvenirs du club', 'Le futsal nous rassemble', 'Ensemble à l’entraînement',
];

export const demoGalleryItems: GalleryItem[] = galleryTitles.map((title, index) => ({
  ...ordered(`photo-${index}`, index), title,
  category_id: demoCategories[index % demoCategories.length].id,
  image: { ...missingPhoto, alt: `${title} — emplacement de démonstration` },
  description: 'Emplacement de démonstration en attente d’une photographie officielle du club.',
}));

const historyTemplate: HistoryContent = {
  ...ordered('history', 0),
  hero: {
    badge: 'HISTORIQUE DU CLUB', title: 'NOTRE HISTOIRE',
    subtitle: 'Une passion commune. Une histoire à partager.', arabicSubtitle: 'تاريخنا، شغف يجمعنا',
    description: 'Des premiers échanges à nos ambitions de demain, découvrez l’esprit qui anime A.J.S TAGANT.',
  },
  sportsNote: { title: 'TAGANT · FUTSAL', text: 'Le collectif au cœur de notre projet sportif.' },
  statistics: ['Année de fondation', 'Nombre de licenciés', 'Engagement futsal', 'Coupe / compétition'].map((label, index) => ({
    ...ordered(`history-stat-${index}`, index), label, value: null,
  })),
  originTitle: 'UNE ÉTINCELLE NÉE AU CŒUR DE TAGANT',
  paragraphs: [
    'A.J.S TAGANT est un projet collectif tourné vers le football en salle et la jeunesse de son territoire. La passion du jeu et l’envie de se retrouver sur le terrain en constituent le fil conducteur.',
    'Cette présentation est une proposition éditoriale de démonstration. Le récit des origines, les dates et les étapes du club seront complétés à partir des archives et des témoignages validés par l’association.',
    'Notre ambition : faire vivre un cadre sportif où le respect, l’engagement et le plaisir de jouer ensemble accompagnent chaque génération.',
  ],
  quote: '« Plus qu’une équipe, une famille. » — slogan de présentation',
  image: { ...missingPhoto, caption: 'Archive officielle et légende à fournir par l’association.' },
  timelineTitle: 'LES GRANDES ÉTAPES DU CLUB',
  steps: [
    ['Les origines', 'Les premiers rassemblements et la naissance du projet associatif seront documentés ici.'],
    ['La structuration du club', 'L’organisation de l’association et ses premiers engagements sportifs restent à confirmer.'],
    ['L’aventure en compétition', 'Les participations, les résultats et les rencontres marquantes seront ajoutés après validation.'],
    ['Un nouveau chapitre', 'Les projets à venir et les objectifs sportifs seront présentés par le club.'],
  ].map(([title, description], index) => ({ ...ordered(`step-${index}`, index), date: null, title, description })),
  galleryTitle: 'INSTANTANÉS DES PREMIERS JOURS',
  gallery: ['Les premiers rassemblements', 'La passion dès le départ', 'Nos souvenirs partagés'].map((title, index) => ({
    ...ordered(`history-photo-${index}`, index), title, category_id: 'category-4', image: missingPhoto,
  })),
  valuesTitle: 'LES QUATRE PILIERS FONDATEURS',
  values: [
    { title: 'Respect', description: 'Respecter ses coéquipiers, ses adversaires et le jeu.', icon: 'respect' as const },
    { title: 'Rigueur', description: 'Progresser grâce au travail et à la régularité.', icon: 'rigor' as const },
    { title: 'Solidarité', description: 'Avancer ensemble, sur le terrain et au-delà.', icon: 'solidarity' as const },
    { title: 'Passion', description: 'Partager le plaisir du futsal et de nos couleurs.', icon: 'passion' as const },
  ].map((value, index) => ({ ...ordered(`value-${index}`, index), ...value })),
  future: {
    title: 'LE FUTUR S’ÉCRIT AVEC VOUS',
    text: 'Joueurs, bénévoles et supporters : chacun peut prendre part à la vie de l’association. Échangeons autour de votre envie de rejoindre l’aventure A.J.S TAGANT.',
    statutes_url: null,
  },
};

export const demoHistory: HistoryContent = {
 ...historyTemplate,...officialHistory.fr,is_demo:false,
 future:{...historyTemplate.future,...officialHistory.fr.future},steps:[],
 values:officialValues.map((value,index)=>({...ordered(value.id,index),is_demo:false,title:value.title_fr,description:value.description_fr,icon:value.icon})),
};

export const demoTeam: TeamContent = {
  hero: { badge: 'EFFECTIF OFFICIEL', title: 'SAISON EN COURS', subtitle: 'Un collectif, une ambition, les couleurs de Tagant.', description: 'Présentation de démonstration : l’effectif officiel et la saison attendent leur validation.' },
  season: 'Saison à confirmer',
  statistics: ['Nombre de joueurs', 'Âge moyen', 'Engagement'].map((label, index) => ({
    ...ordered(`team-stat-${index}`, index), label, value: null,
  })),
  players: demoContent.featuredPlayers.map((player, index) => ({
    ...player, ...ordered(player.id, index), is_captain: false,
    season: 'Saison à confirmer', statistics: [],
  })),
  staffTitle: 'STAFF TECHNIQUE ET MÉDICAL',
  staff: ['Entraîneur principal', 'Entraîneur adjoint', 'Préparateur physique', 'Médecin'].map((role, index) => ({
    ...ordered(`staff-${index}`, index), name: null, role, image: missingPhoto,
  })),
  banner: { eyebrow: 'ENSEMBLE, FAISONS VIBRER NOS COULEURS', title: 'TOUS DERRIÈRE LES BLEU & JAUNE DE TAGANT !', actions: [
    { label: 'REJOINDRE LES SUPPORTERS', href: '/#contact' },
    { label: 'VOIR LA GALERIE MATCHS', href: '/galerie?categorie=category-0' },
  ] },
};

export const demoGallery: GalleryContent = {
  hero: { badge: 'NOS MOMENTS PARTAGÉS', title: 'GALERIE A.J.S TAGANT', subtitle: 'Sur le terrain, dans les tribunes, au cœur du club.', description: 'Emplacements de démonstration : les photographies officielles seront ajoutées depuis Supabase Storage.' },
  categories: demoCategories, images: demoGalleryItems, pageSize: 9,
};

export const demoBureau: BureauContent = {
  hero: { badge: 'LA VIE ASSOCIATIVE', title: 'BUREAU DIRECTEUR', subtitle: 'Au service du club et de son projet sportif.', arabicSubtitle: 'أعضاء المكتب المسير' },
  introduction: 'Présentation de démonstration. La composition du bureau, les identités, les biographies et les mandats seront publiés après validation par l’association.',
  members: [...demoContent.bureauMembers, { id: 'advisor', name: '', role: 'Conseiller', president: false, image: missingPhoto }].map((member, index) => ({
    ...member, ...ordered(member.id, index), name: null,
    biography: member.president ? 'Biographie officielle à renseigner par l’association.' : null,
  })),
};
