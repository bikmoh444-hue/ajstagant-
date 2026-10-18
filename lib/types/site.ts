export type Position = 'Gardiens' | 'Défenseurs' | 'Milieux' | 'Attaquants';
export interface Media { src: string | null; alt: string; caption?: string }
export interface Player { id: string; name: string; position: Position; number: number | null; image: Media }
export interface BureauMember { id: string; name: string; role: string; image: Media; president?: boolean }
export interface SiteContent {
  clubName?: string;
  historyImage?: Media;
  copy?: Record<string, string | boolean>;
  sections?: { key:string;sort_order:number;is_visible:boolean;settings:unknown }[];
  logoUrl: string | null; heroImageUrl: string | null; heroTitle: string; heroSubtitle: string; slogan: string;
  introduction: string; facts: { label: string; value: string }[]; aboutImage: Media;
  historyContent: string[]; objectives: { title: string; description: string; icon: 'youth' | 'ball' | 'team' | 'trophy' }[];
  featuredPlayers: Player[]; galleryImages: Media[]; bureauMembers: BureauMember[];
  contactInfo: { location: string; email: string | null; phone: string | null; socials: { label: string; url: string }[] };
  footerSettings: { arabicName: string; slogan: string; copyright: string };
}
export interface ContentRepository { getHomeContent(): Promise<SiteContent> }
