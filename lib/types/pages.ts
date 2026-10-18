import type { BureauMember, Media, Player } from './site';

export interface OrderedContent {
  id: string;
  sort_order: number;
  is_visible: boolean;
  is_demo: boolean;
}

export interface PageHero {
  badge: string;
  title: string;
  subtitle: string;
  arabicSubtitle?: string;
  description?: string;
}

export interface PageStatistic extends OrderedContent {
  label: string;
  value: string | null;
}

export interface HistoryStep extends OrderedContent {
  date: string | null;
  title: string;
  description: string;
}

export interface ClubValue extends OrderedContent {
  title: string;
  description: string;
  icon: 'respect' | 'rigor' | 'solidarity' | 'passion';
}

export interface GalleryCategory extends OrderedContent {
  label: string;
}

export interface GalleryItem extends OrderedContent {
  title: string;
  category_id: string;
  image: Media;
  date?: string | null;
  description?: string | null;
}

export interface HistoryContent extends OrderedContent {
  vision?: {title:string;description:string};
  mission?: {title:string;description:string};
  hero: PageHero;
  sportsNote: { title: string; text: string };
  statistics: PageStatistic[];
  originTitle: string;
  paragraphs: string[];
  quote: string;
  image: Media;
  timelineTitle: string;
  steps: HistoryStep[];
  galleryTitle: string;
  gallery: GalleryItem[];
  valuesTitle: string;
  values: ClubValue[];
  future: { title: string; text: string; statutes_url: string | null; joinLabel?:string; joinUrl?:string; statutesLabel?:string; unavailableLabel?:string };
}

export interface PlayerStatistics extends OrderedContent {
  player_id: string;
  season: string;
  matches_played?: number | null;
  goals?: number | null;
  assists?: number | null;
  clean_sheets?: number | null;
}

export interface PlayerProfile extends Omit<Player, 'number'>, OrderedContent {
  number: number | null;
  playing_role?: string | null;
  category_id?: string | null;
  nationality?: string | null;
  date_of_birth?: string | null;
  height_cm?: number | null;
  preferred_foot?: 'Droit' | 'Gauche' | null;
  is_captain: boolean;
  is_vice_captain?: boolean;
  season: string;
  statistics: PlayerStatistics[];
}

export interface StaffMember extends OrderedContent {
  name: string | null;
  role: string;
  image: Media;
  biography?: string | null;
}

export interface Director extends Omit<BureauMember, 'name'>, OrderedContent {
  name: string | null;
  biography?: string | null;
  mandate?: string | null;
  nameAr?: string | null;
  nameFr?: string | null;
  roleAr?: string | null;
  roleFr?: string | null;
}

export interface BannerContent {
  eyebrow: string;
  title: string;
  actions: { label: string; href: string }[];
}

export interface TeamContent {
  categories?: {id:string;label:string;slug:string}[];
  hero: PageHero;
  season: string;
  statistics: PageStatistic[];
  players: PlayerProfile[];
  staffTitle: string;
  staff: StaffMember[];
  banner: BannerContent;
}

export interface GalleryContent {
  hero: PageHero;
  categories: GalleryCategory[];
  images: GalleryItem[];
  pageSize: number;
}

export interface BureauContent {
  hero: PageHero;
  introduction: string;
  members: Director[];
}

export interface PagesRepository {
  getHistoryContent(): Promise<HistoryContent>;
  getTeamContent(): Promise<TeamContent>;
  getGalleryContent(): Promise<GalleryContent>;
  getBureauContent(): Promise<BureauContent>;
}
