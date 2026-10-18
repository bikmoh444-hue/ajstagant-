import type { EditableTable } from './collections.generated';
export interface AdminPageDefinition { title:string; tables:EditableTable[]; pageKey?:string; fields?:string[] }
export const legacyAdminPages:Record<string,AdminPageDefinition>={
 accueil:{title:'Page d’accueil',tables:['page_content','homepage_sections'],pageKey:'home'},
 histoire:{title:'Histoire',tables:['page_content','history_milestones','club_values'],pageKey:'histoire'},
 objectifs:{title:'Objectifs',tables:['club_objectives']},
 joueurs:{title:'Joueurs',tables:['players','player_statistics','seasons']},
 staff:{title:'Staff technique',tables:['staff_members']},
 bureau:{title:'Bureau directeur',tables:['bureau_members','page_content'],pageKey:'bureau'},
 galerie:{title:'Galerie',tables:['gallery_images','gallery_categories','page_content'],pageKey:'galerie'},
 matchs:{title:'Matchs',tables:['matches','teams','competitions','seasons','page_content'],pageKey:'matchs'},
 resultats:{title:'Résultats',tables:['matches']},
 classement:{title:'Classement',tables:['standings','competitions','seasons','teams']},
 palmares:{title:'Palmarès',tables:['trophies']},
 messages:{title:'Messages',tables:['contact_messages']},
 apparence:{title:'Apparence',tables:['site_settings'],fields:['logo_url','header_logo_url','footer_logo_url','favicon_url','primary_color','secondary_color','accent_color','background_color','heading_font','body_font','footer_text','slogan','slogan_ar','seo_image_url']},
 navigation:{title:'Navigation',tables:['navigation_items']},
 reseaux:{title:'Réseaux sociaux',tables:['site_settings'],fields:['facebook_url','instagram_url','whatsapp_url','youtube_url','tiktok_url']},
 parametres:{title:'Paramètres',tables:['site_settings','page_content'],fields:undefined},
 equipe:{title:'Textes de l’équipe',tables:['page_content'],pageKey:'equipe'},
 contact:{title:'Textes du contact',tables:['page_content'],pageKey:'contact'},
};

export const adminPages:Record<string,AdminPageDefinition>={
 accueil:{title:'Accueil',tables:['page_content','homepage_sections','club_objectives'],pageKey:'home'},
 histoire:{title:'Histoire',tables:['page_content','history_milestones','club_values'],pageKey:'histoire'},
 equipe:{title:'Équipe',tables:['page_content','players','team_categories','staff_members','player_statistics','seasons'],pageKey:'equipe'},
 matchs:{title:'Matchs & Classement',tables:['matches','standings','teams','competitions','seasons','trophies','page_content'],pageKey:'matchs'},
 galerie:{title:'Galerie',tables:['gallery_images','gallery_categories','page_content'],pageKey:'galerie'},
 bureau:{title:'Bureau directeur',tables:['bureau_members','page_content'],pageKey:'bureau'},
 contact:{title:'Contact',tables:['page_content','site_settings','contact_messages'],pageKey:'contact',fields:['contact_email','contact_phone','address','address_ar','map_url','whatsapp_url','facebook_url','instagram_url','youtube_url','tiktok_url']},
 parametres:{title:'Paramètres',tables:['site_settings','navigation_items'],fields:['club_name','club_name_ar','slogan','slogan_ar','logo_url','favicon_url','footer_text','seo_image_url']},
};
export const adminTableLabels:Partial<Record<EditableTable,string>>={page_content:'Textes et photos',homepage_sections:'Ordre et visibilité',club_objectives:'Objectifs',history_milestones:'Chronologie',club_values:'Valeurs',team_categories:'Catégories',players:'Joueurs',staff_members:'Staff',player_statistics:'Statistiques',seasons:'Saisons',matches:'Matchs',standings:'Classement',teams:'Équipes',competitions:'Compétitions',trophies:'Palmarès',gallery_images:'Photos',gallery_categories:'Albums',bureau_members:'Membres',site_settings:'Coordonnées',contact_messages:'Messages reçus',navigation_items:'Menu du site'};
