// Généré depuis les migrations.
import type { CollectionDefinition } from './types';
export const collections = {
  "site_settings": {
    "label": "Paramètres du site",
    "bucket": "club-assets",
    "fields": [
      {
        "name": "club_name",
        "label": "Nom du club",
        "type": "text",
        "required": false,
        "nullable": false
      },
      {
        "name": "club_name_ar",
        "label": "Nom arabe",
        "type": "text",
        "required": false,
        "nullable": false
      },
      {
        "name": "slogan",
        "label": "slogan",
        "type": "text",
        "required": false,
        "nullable": false
      },
      {
        "name": "slogan_ar",
        "label": "slogan ar",
        "type": "text",
        "required": false,
        "nullable": false
      },
      {
        "name": "logo_url",
        "label": "Logo",
        "type": "url",
        "required": false,
        "nullable": true
      },
      {
        "name": "favicon_url",
        "label": "Favicon",
        "type": "url",
        "required": false,
        "nullable": true
      },
      {
        "name": "primary_color",
        "label": "primary color",
        "type": "color",
        "required": false,
        "nullable": false
      },
      {
        "name": "secondary_color",
        "label": "secondary color",
        "type": "color",
        "required": false,
        "nullable": false
      },
      {
        "name": "accent_color",
        "label": "accent color",
        "type": "color",
        "required": false,
        "nullable": false
      },
      {
        "name": "background_color",
        "label": "background color",
        "type": "color",
        "required": false,
        "nullable": false
      },
      {
        "name": "heading_font",
        "label": "heading font",
        "type": "select",
        "required": false,
        "nullable": false,
        "options": [
          "Anton",
          "Oswald",
          "Cairo"
        ]
      },
      {
        "name": "body_font",
        "label": "body font",
        "type": "select",
        "required": false,
        "nullable": false,
        "options": [
          "Poppins",
          "Cairo"
        ]
      },
      {
        "name": "contact_email",
        "label": "contact email",
        "type": "email",
        "required": false,
        "nullable": true
      },
      {
        "name": "contact_phone",
        "label": "contact phone",
        "type": "text",
        "required": false,
        "nullable": true
      },
      {
        "name": "whatsapp_url",
        "label": "whatsapp url",
        "type": "url",
        "required": false,
        "nullable": true
      },
      {
        "name": "address",
        "label": "address",
        "type": "text",
        "required": false,
        "nullable": true
      },
      {
        "name": "address_ar",
        "label": "address ar",
        "type": "text",
        "required": false,
        "nullable": true
      },
      {
        "name": "map_url",
        "label": "map url",
        "type": "url",
        "required": false,
        "nullable": true
      },
      {
        "name": "facebook_url",
        "label": "facebook url",
        "type": "url",
        "required": false,
        "nullable": true
      },
      {
        "name": "instagram_url",
        "label": "instagram url",
        "type": "url",
        "required": false,
        "nullable": true
      },
      {
        "name": "youtube_url",
        "label": "youtube url",
        "type": "url",
        "required": false,
        "nullable": true
      },
      {
        "name": "tiktok_url",
        "label": "tiktok url",
        "type": "url",
        "required": false,
        "nullable": true
      },
      {
        "name": "footer_text",
        "label": "footer text",
        "type": "textarea",
        "required": false,
        "nullable": true
      },
      {
        "name": "seo_title",
        "label": "seo title",
        "type": "text",
        "required": false,
        "nullable": true
      },
      {
        "name": "seo_description",
        "label": "seo description",
        "type": "textarea",
        "required": false,
        "nullable": true
      },
      {
        "name": "seo_image_url",
        "label": "seo image url",
        "type": "url",
        "required": false,
        "nullable": true
      },
      {
        "name": "header_logo_url",
        "label": "Logo du header (facultatif)",
        "type": "url",
        "required": false,
        "nullable": true
      },
      {
        "name": "footer_logo_url",
        "label": "Logo du footer (facultatif)",
        "type": "url",
        "required": false,
        "nullable": true
      }
    ]
  },
  "navigation_items": {
    "label": "Navigation",
    "bucket": "club-assets",
    "fields": [
      {
        "name": "label_fr",
        "label": "Libellé FR",
        "type": "text",
        "required": true,
        "nullable": false
      },
      {
        "name": "label_ar",
        "label": "Libellé AR",
        "type": "text",
        "required": false,
        "nullable": false
      },
      {
        "name": "href",
        "label": "Destination",
        "type": "url",
        "required": true,
        "nullable": false
      },
      {
        "name": "sort_order",
        "label": "Ordre",
        "type": "number",
        "required": false,
        "nullable": false
      },
      {
        "name": "is_visible",
        "label": "Visible",
        "type": "boolean",
        "required": false,
        "nullable": false
      }
    ]
  },
  "page_content": {
    "label": "Textes et sections",
    "bucket": "club-assets",
    "fields": [
      {
        "name": "page_key",
        "label": "Page",
        "type": "text",
        "required": true,
        "nullable": false
      },
      {
        "name": "section_key",
        "label": "Section",
        "type": "text",
        "required": true,
        "nullable": false
      },
      {
        "name": "title_fr",
        "label": "Titre FR",
        "type": "text",
        "required": false,
        "nullable": true
      },
      {
        "name": "title_ar",
        "label": "Titre AR",
        "type": "text",
        "required": false,
        "nullable": true
      },
      {
        "name": "subtitle_fr",
        "label": "subtitle fr",
        "type": "text",
        "required": false,
        "nullable": true
      },
      {
        "name": "subtitle_ar",
        "label": "subtitle ar",
        "type": "text",
        "required": false,
        "nullable": true
      },
      {
        "name": "content_fr",
        "label": "content fr",
        "type": "textarea",
        "required": false,
        "nullable": true
      },
      {
        "name": "content_ar",
        "label": "content ar",
        "type": "textarea",
        "required": false,
        "nullable": true
      },
      {
        "name": "image_url",
        "label": "Image",
        "type": "url",
        "required": false,
        "nullable": true
      },
      {
        "name": "button_label_fr",
        "label": "button label fr",
        "type": "text",
        "required": false,
        "nullable": true
      },
      {
        "name": "button_label_ar",
        "label": "button label ar",
        "type": "text",
        "required": false,
        "nullable": true
      },
      {
        "name": "button_url",
        "label": "button url",
        "type": "url",
        "required": false,
        "nullable": true
      },
      {
        "name": "sort_order",
        "label": "Ordre",
        "type": "number",
        "required": false,
        "nullable": false
      },
      {
        "name": "is_visible",
        "label": "Visible",
        "type": "boolean",
        "required": false,
        "nullable": false
      },
      {
        "name": "settings_json",
        "label": "Contenu détaillé",
        "type": "json",
        "required": false,
        "nullable": false
      }
    ]
  },
  "homepage_sections": {
    "label": "Ordre des sections de l’accueil",
    "bucket": "club-assets",
    "fields": [
      {
        "name": "section_key",
        "label": "Section",
        "type": "text",
        "required": true,
        "nullable": false
      },
      {
        "name": "sort_order",
        "label": "Ordre",
        "type": "number",
        "required": false,
        "nullable": false
      },
      {
        "name": "is_visible",
        "label": "Visible",
        "type": "boolean",
        "required": false,
        "nullable": false
      },
      {
        "name": "settings_json",
        "label": "Contenu détaillé",
        "type": "json",
        "required": false,
        "nullable": false
      }
    ]
  },
  "history_milestones": {
    "label": "Étapes historiques",
    "bucket": "club-assets",
    "fields": [
      {
        "name": "year",
        "label": "year",
        "type": "number",
        "required": false,
        "nullable": true
      },
      {
        "name": "title_fr",
        "label": "Titre FR",
        "type": "text",
        "required": true,
        "nullable": false
      },
      {
        "name": "title_ar",
        "label": "Titre AR",
        "type": "text",
        "required": false,
        "nullable": false
      },
      {
        "name": "description_fr",
        "label": "Description FR",
        "type": "textarea",
        "required": false,
        "nullable": true
      },
      {
        "name": "description_ar",
        "label": "Description AR",
        "type": "textarea",
        "required": false,
        "nullable": true
      },
      {
        "name": "image_url",
        "label": "Image",
        "type": "url",
        "required": false,
        "nullable": true
      },
      {
        "name": "sort_order",
        "label": "Ordre",
        "type": "number",
        "required": false,
        "nullable": false
      },
      {
        "name": "is_visible",
        "label": "Visible",
        "type": "boolean",
        "required": false,
        "nullable": false
      }
    ]
  },
  "club_objectives": {
    "label": "Objectifs",
    "bucket": "club-assets",
    "fields": [
      {
        "name": "icon",
        "label": "icon",
        "type": "select",
        "required": false,
        "nullable": false,
        "options": [
          "youth",
          "ball",
          "team",
          "trophy"
        ]
      },
      {
        "name": "title_fr",
        "label": "Titre FR",
        "type": "text",
        "required": true,
        "nullable": false
      },
      {
        "name": "title_ar",
        "label": "Titre AR",
        "type": "text",
        "required": false,
        "nullable": false
      },
      {
        "name": "description_fr",
        "label": "Description FR",
        "type": "textarea",
        "required": false,
        "nullable": true
      },
      {
        "name": "description_ar",
        "label": "Description AR",
        "type": "textarea",
        "required": false,
        "nullable": true
      },
      {
        "name": "sort_order",
        "label": "Ordre",
        "type": "number",
        "required": false,
        "nullable": false
      },
      {
        "name": "is_visible",
        "label": "Visible",
        "type": "boolean",
        "required": false,
        "nullable": false
      }
    ]
  },
  "club_values": {
    "label": "Valeurs",
    "bucket": "club-assets",
    "fields": [
      {
        "name": "icon",
        "label": "icon",
        "type": "select",
        "required": false,
        "nullable": false,
        "options": [
          "respect",
          "rigor",
          "solidarity",
          "passion"
        ]
      },
      {
        "name": "title_fr",
        "label": "Titre FR",
        "type": "text",
        "required": true,
        "nullable": false
      },
      {
        "name": "title_ar",
        "label": "Titre AR",
        "type": "text",
        "required": false,
        "nullable": false
      },
      {
        "name": "description_fr",
        "label": "Description FR",
        "type": "textarea",
        "required": false,
        "nullable": true
      },
      {
        "name": "description_ar",
        "label": "Description AR",
        "type": "textarea",
        "required": false,
        "nullable": true
      },
      {
        "name": "sort_order",
        "label": "Ordre",
        "type": "number",
        "required": false,
        "nullable": false
      },
      {
        "name": "is_visible",
        "label": "Visible",
        "type": "boolean",
        "required": false,
        "nullable": false
      }
    ]
  },
  "players": {
    "label": "Joueurs",
    "bucket": "players",
    "fields": [
      {
        "name": "full_name",
        "label": "Nom complet",
        "type": "text",
        "required": true,
        "nullable": false
      },
      {
        "name": "photo_url",
        "label": "Photo",
        "type": "url",
        "required": false,
        "nullable": true
      },
      {
        "name": "shirt_number",
        "label": "Numéro",
        "type": "number",
        "required": false,
        "nullable": true
      },
      {
        "name": "position",
        "label": "Poste / rang",
        "type": "select",
        "required": true,
        "nullable": false,
        "options": [
          "Gardiens",
          "Défenseurs",
          "Milieux",
          "Attaquants"
        ]
      },
      {
        "name": "nationality",
        "label": "Nationalité",
        "type": "text",
        "required": false,
        "nullable": true
      },
      {
        "name": "date_of_birth",
        "label": "Date de naissance",
        "type": "date",
        "required": false,
        "nullable": true
      },
      {
        "name": "biography_fr",
        "label": "Biographie FR",
        "type": "textarea",
        "required": false,
        "nullable": true
      },
      {
        "name": "biography_ar",
        "label": "Biographie AR",
        "type": "textarea",
        "required": false,
        "nullable": true
      },
      {
        "name": "is_captain",
        "label": "Capitaine",
        "type": "boolean",
        "required": false,
        "nullable": false
      },
      {
        "name": "is_active",
        "label": "Actif",
        "type": "boolean",
        "required": false,
        "nullable": false
      },
      {
        "name": "is_featured",
        "label": "Mis en avant",
        "type": "boolean",
        "required": false,
        "nullable": false
      },
      {
        "name": "sort_order",
        "label": "Ordre",
        "type": "number",
        "required": false,
        "nullable": false
      },
      {
        "name": "is_visible",
        "label": "Visible",
        "type": "boolean",
        "required": false,
        "nullable": false
      },
      {
        "name": "category_id",
        "label": "Catégorie",
        "type": "reference",
        "required": false,
        "nullable": true,
        "reference": "team_categories"
      },
      {
        "name": "playing_role",
        "label": "Poste précis",
        "type": "text",
        "required": false,
        "nullable": true
      },
      {
        "name": "height_cm",
        "label": "Taille (cm)",
        "type": "number",
        "required": false,
        "nullable": true
      },
      {
        "name": "preferred_foot",
        "label": "Pied préféré",
        "type": "select",
        "required": false,
        "nullable": true,
        "options": [
          "Droit",
          "Gauche"
        ]
      },
      {
        "name": "is_vice_captain",
        "label": "Vice-capitaine",
        "type": "boolean",
        "required": false,
        "nullable": false
      }
    ]
  },
  "staff_members": {
    "label": "Staff",
    "bucket": "staff",
    "fields": [
      {
        "name": "full_name",
        "label": "Nom complet",
        "type": "text",
        "required": true,
        "nullable": false
      },
      {
        "name": "photo_url",
        "label": "Photo",
        "type": "url",
        "required": false,
        "nullable": true
      },
      {
        "name": "role_fr",
        "label": "Rôle FR",
        "type": "text",
        "required": true,
        "nullable": false
      },
      {
        "name": "role_ar",
        "label": "Rôle AR",
        "type": "text",
        "required": false,
        "nullable": true
      },
      {
        "name": "biography_fr",
        "label": "Biographie FR",
        "type": "textarea",
        "required": false,
        "nullable": true
      },
      {
        "name": "biography_ar",
        "label": "Biographie AR",
        "type": "textarea",
        "required": false,
        "nullable": true
      },
      {
        "name": "sort_order",
        "label": "Ordre",
        "type": "number",
        "required": false,
        "nullable": false
      },
      {
        "name": "is_visible",
        "label": "Visible",
        "type": "boolean",
        "required": false,
        "nullable": false
      }
    ]
  },
  "bureau_members": {
    "label": "Bureau",
    "bucket": "bureau",
    "fields": [
      {
        "name": "full_name",
        "label": "Nom complet",
        "type": "text",
        "required": true,
        "nullable": false
      },
      {
        "name": "photo_url",
        "label": "Photo",
        "type": "url",
        "required": false,
        "nullable": true
      },
      {
        "name": "role_fr",
        "label": "Rôle FR",
        "type": "text",
        "required": true,
        "nullable": false
      },
      {
        "name": "role_ar",
        "label": "Rôle AR",
        "type": "text",
        "required": false,
        "nullable": true
      },
      {
        "name": "biography_fr",
        "label": "Biographie FR",
        "type": "textarea",
        "required": false,
        "nullable": true
      },
      {
        "name": "biography_ar",
        "label": "Biographie AR",
        "type": "textarea",
        "required": false,
        "nullable": true
      },
      {
        "name": "mandate_start",
        "label": "mandate start",
        "type": "date",
        "required": false,
        "nullable": true
      },
      {
        "name": "mandate_end",
        "label": "mandate end",
        "type": "date",
        "required": false,
        "nullable": true
      },
      {
        "name": "is_president",
        "label": "Président",
        "type": "boolean",
        "required": false,
        "nullable": false
      },
      {
        "name": "is_featured",
        "label": "Mis en avant",
        "type": "boolean",
        "required": false,
        "nullable": false
      },
      {
        "name": "sort_order",
        "label": "Ordre",
        "type": "number",
        "required": false,
        "nullable": false
      },
      {
        "name": "is_visible",
        "label": "Visible",
        "type": "boolean",
        "required": false,
        "nullable": false
      },
      {
        "name": "full_name_ar",
        "label": "Nom complet en arabe",
        "type": "text",
        "required": false,
        "nullable": true
      },
      {
        "name": "full_name_fr",
        "label": "Nom complet en français",
        "type": "text",
        "required": false,
        "nullable": true
      }
    ]
  },
  "gallery_categories": {
    "label": "Catégories",
    "bucket": "club-assets",
    "fields": [
      {
        "name": "name_fr",
        "label": "Nom FR",
        "type": "text",
        "required": true,
        "nullable": false
      },
      {
        "name": "name_ar",
        "label": "Nom AR",
        "type": "text",
        "required": false,
        "nullable": true
      },
      {
        "name": "slug",
        "label": "Identifiant",
        "type": "text",
        "required": true,
        "nullable": false
      },
      {
        "name": "sort_order",
        "label": "Ordre",
        "type": "number",
        "required": false,
        "nullable": false
      },
      {
        "name": "is_visible",
        "label": "Visible",
        "type": "boolean",
        "required": false,
        "nullable": false
      }
    ]
  },
  "gallery_images": {
    "label": "Photographies",
    "bucket": "gallery",
    "fields": [
      {
        "name": "category_id",
        "label": "Catégorie",
        "type": "reference",
        "required": true,
        "nullable": false,
        "reference": "gallery_categories"
      },
      {
        "name": "image_url",
        "label": "Image",
        "type": "url",
        "required": true,
        "nullable": false
      },
      {
        "name": "title_fr",
        "label": "Titre FR",
        "type": "text",
        "required": true,
        "nullable": false
      },
      {
        "name": "title_ar",
        "label": "Titre AR",
        "type": "text",
        "required": false,
        "nullable": true
      },
      {
        "name": "description_fr",
        "label": "Description FR",
        "type": "textarea",
        "required": false,
        "nullable": true
      },
      {
        "name": "description_ar",
        "label": "Description AR",
        "type": "textarea",
        "required": false,
        "nullable": true
      },
      {
        "name": "taken_at",
        "label": "taken at",
        "type": "date",
        "required": false,
        "nullable": true
      },
      {
        "name": "sort_order",
        "label": "Ordre",
        "type": "number",
        "required": false,
        "nullable": false
      },
      {
        "name": "is_visible",
        "label": "Visible",
        "type": "boolean",
        "required": false,
        "nullable": false
      },
      {
        "name": "is_featured",
        "label": "Mis en avant",
        "type": "boolean",
        "required": false,
        "nullable": false
      }
    ]
  },
  "contact_messages": {
    "label": "Messages",
    "bucket": "club-assets",
    "fields": [
      {
        "name": "full_name",
        "label": "Nom complet",
        "type": "text",
        "required": true,
        "nullable": false
      },
      {
        "name": "email",
        "label": "email",
        "type": "email",
        "required": true,
        "nullable": false
      },
      {
        "name": "phone",
        "label": "phone",
        "type": "text",
        "required": false,
        "nullable": true
      },
      {
        "name": "subject",
        "label": "subject",
        "type": "text",
        "required": true,
        "nullable": false
      },
      {
        "name": "message",
        "label": "message",
        "type": "textarea",
        "required": true,
        "nullable": false
      },
      {
        "name": "status",
        "label": "status",
        "type": "select",
        "required": false,
        "nullable": false,
        "options": [
          "new",
          "read",
          "processed",
          "archived"
        ]
      }
    ]
  },
  "seasons": {
    "label": "Saisons",
    "bucket": "club-assets",
    "fields": [
      {
        "name": "name",
        "label": "name",
        "type": "text",
        "required": true,
        "nullable": false
      },
      {
        "name": "start_date",
        "label": "start date",
        "type": "date",
        "required": false,
        "nullable": true
      },
      {
        "name": "end_date",
        "label": "end date",
        "type": "date",
        "required": false,
        "nullable": true
      },
      {
        "name": "is_current",
        "label": "Saison actuelle",
        "type": "boolean",
        "required": false,
        "nullable": false
      },
      {
        "name": "sort_order",
        "label": "Ordre",
        "type": "number",
        "required": false,
        "nullable": false
      },
      {
        "name": "is_visible",
        "label": "Visible",
        "type": "boolean",
        "required": false,
        "nullable": false
      }
    ]
  },
  "competitions": {
    "label": "Compétitions",
    "bucket": "match-assets",
    "fields": [
      {
        "name": "name",
        "label": "name",
        "type": "text",
        "required": true,
        "nullable": false
      },
      {
        "name": "season_id",
        "label": "season id",
        "type": "reference",
        "required": true,
        "nullable": false,
        "reference": "seasons"
      },
      {
        "name": "logo_url",
        "label": "Logo",
        "type": "url",
        "required": false,
        "nullable": true
      },
      {
        "name": "competition_type",
        "label": "competition type",
        "type": "text",
        "required": false,
        "nullable": false
      },
      {
        "name": "subtitle",
        "label": "subtitle",
        "type": "text",
        "required": false,
        "nullable": true
      },
      {
        "name": "qualification_positions",
        "label": "qualification positions",
        "type": "numbers",
        "required": false,
        "nullable": true
      },
      {
        "name": "relegation_positions",
        "label": "relegation positions",
        "type": "numbers",
        "required": false,
        "nullable": true
      },
      {
        "name": "win_points",
        "label": "win points",
        "type": "number",
        "required": false,
        "nullable": false
      },
      {
        "name": "draw_points",
        "label": "draw points",
        "type": "number",
        "required": false,
        "nullable": false
      },
      {
        "name": "loss_points",
        "label": "loss points",
        "type": "number",
        "required": false,
        "nullable": false
      },
      {
        "name": "sort_order",
        "label": "Ordre",
        "type": "number",
        "required": false,
        "nullable": false
      },
      {
        "name": "is_visible",
        "label": "Visible",
        "type": "boolean",
        "required": false,
        "nullable": false
      }
    ]
  },
  "teams": {
    "label": "Équipes",
    "bucket": "match-assets",
    "fields": [
      {
        "name": "name",
        "label": "name",
        "type": "text",
        "required": true,
        "nullable": false
      },
      {
        "name": "short_name",
        "label": "short name",
        "type": "text",
        "required": false,
        "nullable": true
      },
      {
        "name": "logo_url",
        "label": "Logo",
        "type": "url",
        "required": false,
        "nullable": true
      },
      {
        "name": "city",
        "label": "city",
        "type": "text",
        "required": false,
        "nullable": true
      },
      {
        "name": "is_ajt",
        "label": "is ajt",
        "type": "boolean",
        "required": false,
        "nullable": false
      },
      {
        "name": "sort_order",
        "label": "Ordre",
        "type": "number",
        "required": false,
        "nullable": false
      },
      {
        "name": "is_visible",
        "label": "Visible",
        "type": "boolean",
        "required": false,
        "nullable": false
      }
    ]
  },
  "player_statistics": {
    "label": "Statistiques des joueurs",
    "bucket": "club-assets",
    "fields": [
      {
        "name": "player_id",
        "label": "player id",
        "type": "reference",
        "required": true,
        "nullable": false,
        "reference": "players"
      },
      {
        "name": "season_id",
        "label": "season id",
        "type": "reference",
        "required": true,
        "nullable": false,
        "reference": "seasons"
      },
      {
        "name": "matches_played",
        "label": "matches played",
        "type": "number",
        "required": false,
        "nullable": true
      },
      {
        "name": "goals",
        "label": "goals",
        "type": "number",
        "required": false,
        "nullable": true
      },
      {
        "name": "assists",
        "label": "assists",
        "type": "number",
        "required": false,
        "nullable": true
      },
      {
        "name": "clean_sheets",
        "label": "clean sheets",
        "type": "number",
        "required": false,
        "nullable": true
      },
      {
        "name": "yellow_cards",
        "label": "yellow cards",
        "type": "number",
        "required": false,
        "nullable": true
      },
      {
        "name": "red_cards",
        "label": "red cards",
        "type": "number",
        "required": false,
        "nullable": true
      }
    ]
  },
  "matches": {
    "label": "Matchs",
    "bucket": "club-assets",
    "fields": [
      {
        "name": "competition_id",
        "label": "competition id",
        "type": "reference",
        "required": true,
        "nullable": false,
        "reference": "competitions"
      },
      {
        "name": "season_id",
        "label": "season id",
        "type": "reference",
        "required": true,
        "nullable": false,
        "reference": "seasons"
      },
      {
        "name": "home_team_id",
        "label": "home team id",
        "type": "reference",
        "required": true,
        "nullable": false,
        "reference": "teams"
      },
      {
        "name": "away_team_id",
        "label": "away team id",
        "type": "reference",
        "required": true,
        "nullable": false,
        "reference": "teams"
      },
      {
        "name": "match_date",
        "label": "match date",
        "type": "datetime-local",
        "required": false,
        "nullable": true
      },
      {
        "name": "venue",
        "label": "venue",
        "type": "text",
        "required": false,
        "nullable": true
      },
      {
        "name": "city",
        "label": "city",
        "type": "text",
        "required": false,
        "nullable": true
      },
      {
        "name": "home_score",
        "label": "Score domicile",
        "type": "number",
        "required": false,
        "nullable": true
      },
      {
        "name": "away_score",
        "label": "Score extérieur",
        "type": "number",
        "required": false,
        "nullable": true
      },
      {
        "name": "status",
        "label": "status",
        "type": "select",
        "required": false,
        "nullable": false,
        "options": [
          "scheduled",
          "live",
          "finished",
          "postponed",
          "cancelled"
        ]
      },
      {
        "name": "round_number",
        "label": "round number",
        "type": "text",
        "required": false,
        "nullable": true
      },
      {
        "name": "streaming_url",
        "label": "streaming url",
        "type": "url",
        "required": false,
        "nullable": true
      },
      {
        "name": "ticket_url",
        "label": "ticket url",
        "type": "url",
        "required": false,
        "nullable": true
      },
      {
        "name": "is_featured",
        "label": "Mis en avant",
        "type": "boolean",
        "required": false,
        "nullable": false
      },
      {
        "name": "is_visible",
        "label": "Visible",
        "type": "boolean",
        "required": false,
        "nullable": false
      },
      {
        "name": "sort_order",
        "label": "Ordre",
        "type": "number",
        "required": false,
        "nullable": false
      }
    ]
  },
  "standings": {
    "label": "Classement",
    "bucket": "club-assets",
    "fields": [
      {
        "name": "competition_id",
        "label": "competition id",
        "type": "reference",
        "required": true,
        "nullable": false,
        "reference": "competitions"
      },
      {
        "name": "season_id",
        "label": "season id",
        "type": "reference",
        "required": true,
        "nullable": false,
        "reference": "seasons"
      },
      {
        "name": "team_id",
        "label": "team id",
        "type": "reference",
        "required": true,
        "nullable": false,
        "reference": "teams"
      },
      {
        "name": "position",
        "label": "Poste / rang",
        "type": "number",
        "required": true,
        "nullable": false
      },
      {
        "name": "played",
        "label": "played",
        "type": "number",
        "required": false,
        "nullable": false
      },
      {
        "name": "wins",
        "label": "wins",
        "type": "number",
        "required": false,
        "nullable": false
      },
      {
        "name": "draws",
        "label": "draws",
        "type": "number",
        "required": false,
        "nullable": false
      },
      {
        "name": "losses",
        "label": "losses",
        "type": "number",
        "required": false,
        "nullable": false
      },
      {
        "name": "goals_for",
        "label": "goals for",
        "type": "number",
        "required": false,
        "nullable": false
      },
      {
        "name": "goals_against",
        "label": "goals against",
        "type": "number",
        "required": false,
        "nullable": false
      },
      {
        "name": "points",
        "label": "points",
        "type": "number",
        "required": false,
        "nullable": false
      },
      {
        "name": "points_mode",
        "label": "Mode des points",
        "type": "select",
        "required": false,
        "nullable": false,
        "options": [
          "manual",
          "calculated"
        ]
      },
      {
        "name": "sort_order",
        "label": "Ordre",
        "type": "number",
        "required": false,
        "nullable": false
      },
      {
        "name": "is_visible",
        "label": "Visible",
        "type": "boolean",
        "required": false,
        "nullable": false
      }
    ]
  },
  "trophies": {
    "label": "Palmarès",
    "bucket": "club-assets",
    "fields": [
      {
        "name": "title_fr",
        "label": "Titre FR",
        "type": "text",
        "required": true,
        "nullable": false
      },
      {
        "name": "title_ar",
        "label": "Titre AR",
        "type": "text",
        "required": false,
        "nullable": true
      },
      {
        "name": "competition_name",
        "label": "competition name",
        "type": "text",
        "required": true,
        "nullable": false
      },
      {
        "name": "year",
        "label": "year",
        "type": "number",
        "required": false,
        "nullable": true
      },
      {
        "name": "quantity",
        "label": "quantity",
        "type": "number",
        "required": false,
        "nullable": false
      },
      {
        "name": "icon",
        "label": "icon",
        "type": "text",
        "required": false,
        "nullable": false
      },
      {
        "name": "competition_id",
        "label": "competition id",
        "type": "reference",
        "required": false,
        "nullable": true,
        "reference": "competitions"
      },
      {
        "name": "season_id",
        "label": "season id",
        "type": "reference",
        "required": false,
        "nullable": true,
        "reference": "seasons"
      },
      {
        "name": "sort_order",
        "label": "Ordre",
        "type": "number",
        "required": false,
        "nullable": false
      },
      {
        "name": "is_visible",
        "label": "Visible",
        "type": "boolean",
        "required": false,
        "nullable": false
      }
    ]
  },
  "team_categories": {
    "label": "Catégories de l’équipe",
    "bucket": "players",
    "fields": [
      {
        "name": "name_fr",
        "label": "Nom FR",
        "type": "text",
        "required": true,
        "nullable": false
      },
      {
        "name": "name_ar",
        "label": "Nom AR",
        "type": "text",
        "required": false,
        "nullable": true
      },
      {
        "name": "slug",
        "label": "Identifiant",
        "type": "text",
        "required": true,
        "nullable": false
      },
      {
        "name": "sort_order",
        "label": "Ordre",
        "type": "number",
        "required": false,
        "nullable": false
      },
      {
        "name": "is_visible",
        "label": "Visible",
        "type": "boolean",
        "required": false,
        "nullable": false
      }
    ]
  }
} as const satisfies Record<string,CollectionDefinition>;
export type EditableTable = keyof typeof collections;
