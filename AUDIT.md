# Audit AJT TAGANT — 17 octobre 2026

## A. Problèmes détectés

### Connexion

Le projet possède déjà `admin_users`, lié par UUID à `auth.users`, ainsi que les
rôles `editor` et `super_admin`. La présence d'un compte dans Authentication
n'accorde aucun accès au dashboard. Cette séparation est conservée.

Le code affichait le même refus pour des situations différentes : identifiants
refusés, adresse non confirmée, service indisponible, fonction SQL manquante et
rôle absent. Les erreurs RPC étaient présentées comme une absence de rôle.
L'adresse email n'était pas normalisée et l'intégralité de FormData était
transmise à la validation. Les erreurs d'écriture des cookies étaient ignorées,
y compris pour les actions de connexion.

**Cause exacte du refus sur votre compte : non confirmée.** Les requêtes Auth,
REST et RPC vers l'instance configurée échouent ici avec `EACCES`. Aucun mot de
passe, UUID du compte concerné ou message exact de refus n'a été fourni.
Il serait incorrect d'affirmer que son rôle est absent sans lire cette base.
`sql/diagnose-admin.sql` permet de vérifier confirmation, rôle et fonction SQL.

Variables vérifiées sans afficher les secrets : URL et clé anonyme présentes,
mode demo inactif, clé serveur vide. La validité des clés et les paramètres
distants Auth/SMTP ne peuvent pas être vérifiés depuis cet environnement.
La clé serveur n'est pas nécessaire au login ; elle est nécessaire aux
invitations et au stockage Supabase des messages de contact.

### Administration et site public

- Le slogan de l'accueil et l'identité du bloc Histoire n'utilisaient pas tous
  les paramètres du site.
- Les logos du header et du footer ne pouvaient pas avoir de références propres.
- Certains liens de l'accueil et boutons Histoire étaient fixes.
- Supprimer un document structurel pouvait rendre une page inaccessible, sans
  bouton permettant de recréer ce document dans l'administration.
- Après suppression de tous les éléments d'une liste éditoriale, l'éditeur
  ajoutait une chaîne vide au lieu de restaurer la structure d'un objet.
- Plusieurs mutations ne géraient pas les exceptions réseau côté formulaire.
- Une URL d'image autorisée par le formulaire pouvait être refusée ensuite par
  l'optimiseur Next.js. Les composants média publics affichent maintenant les
  références enregistrées sans passer par cet optimiseur.
- Un trophée lié uniquement à une saison masquée pouvait rester lisible.
- Les tests de production ont rencontré des artefacts `.next` faisant référence
  à des modules de développement absents : erreurs 500, malgré un build réussi.
  Les dossiers de sortie sont maintenant séparés.

## B. Corrections effectuées

| Fichiers | Changement |
| --- | --- |
| `lib/admin/login.ts`, `lib/admin/auth.ts`, `app/admin/actions.ts` | Validation explicite des identifiants, email nettoyé, mot de passe conservé, erreurs Auth/RPC distinctes, contrôle strict des rôles, déconnexion locale, protection des contenus structurels |
| `lib/supabase/server.ts`, `middleware.ts` | Écriture des cookies obligatoire dans les actions qui modifient la session ; réponse admin sans cache ; panne Auth traitée sans accorder de droits |
| `app/admin/login/page.tsx` | Messages pour lien expiré et accès nécessitant une session |
| `app/admin/auth/confirm/route.ts`, `app/admin/set-password/*`, `components/admin/password-form.tsx` | Invitations token_hash/code et fragments URL, jetons retirés de la barre d'adresse, vérification de session avant définition du mot de passe |
| `components/admin/collection-manager.tsx`, `json-editor.tsx`, `draft-preview.tsx`, `app/admin/admin.css` | Exceptions réseau, restauration des objets dans les listes vides, identifiants distincts, RTL éditorial, aperçu avant enregistrement, suppression structurelle retirée |
| `app/admin/(protected)/[section]/page.tsx` | Paramètres d'identité transmis à l'aperçu |
| `lib/admin/pages.ts`, `lib/admin/collections.generated.ts`, `lib/supabase/database.ts`, `scripts/generate-db-contract.mjs` | Champs des logos header/footer et contrat généré intégrant la migration incrémentale |
| `app/layout.tsx`, `lib/data/public-settings.ts`, `lib/data/supabase-repository.ts` | Logos avec repli sur le logo principal, slogan global et nom localisé dans l'accueil |
| `app/histoire/page.tsx`, `components/history/history-page.tsx`, `components/home/home-page.tsx`, `lib/data/documents.ts`, `lib/types/pages.ts` | Identité Histoire synchronisée, liens et boutons éditables, compatibilité des anciens documents, retrait du bouton Statuts désactivé lorsque le document manque |
| `components/ui/club-media.tsx` | Affichage des références média enregistrées sans restriction de l'optimiseur ; compromis : pas d'optimisation Next.js pour ces images |
| `next.config.ts`, `eslint.config.mjs`, `.gitignore`, `.vercelignore`, `tsconfig.json` | Développement dans `.next`, production dans `.next-production`, exclusions et types associés |
| `.env.example`, `README.md`, `supabase/README.md`, `sql/*` | Configuration sans secrets, diagnostic et ordre de migration |
| `scripts/check-auth.mjs`, `check-session.mjs`, `diagnose-supabase.mjs`, `check-security.mjs`, `check-pages.mjs`, `package.json` | Tests et diagnostic décrits ci-dessous |

Les actions de contenu utilisent toujours Supabase avec la session de l'admin,
les validations serveur et RLS. Aucun accès service_role n'est ajouté au
navigateur. Les lectures publiques utilisent un client anonyme séparé et
`cache: no-store` ; les sauvegardes invalident les layouts public et admin.
Le favicon existant reste dynamique : URL versionnée avec `updated_at` et
réponse `/favicon` sans cache. Les uploads ont un chemin UUID immuable.

L'aperçu reste local au formulaire et ne sauvegarde rien : rendu de l'accueil
et de l'Histoire, identité et médias, fiches staff/bureau, Hero des autres
documents, résumé des autres enregistrements. Il ne compose pas toutes les
relations en brouillon comme une copie intégrale du site.

## C. Audit Dashboard

« Implémenté » signifie liaison présente et inspectée dans le code. Cela ne
signifie pas qu'une mutation sur votre instance distante a été vérifiée.

| Section du site | Gestion Dashboard | Supabase | Statut |
| --- | --- | --- | --- |
| Logo principal | Oui, Apparence/Paramètres | `site_settings.logo_url`, Storage `club-assets`, `media_assets` | Implémenté ; sauvegarde distante à valider |
| Logos header/footer | Oui, overrides facultatifs | `site_settings.header_logo_url`, `footer_logo_url` | Migration 007 à exécuter |
| Favicon | Oui | `site_settings.favicon_url`, Storage | Route de repli et absence de cache testées ; remplacement distant à valider |
| Open Graph, noms FR/AR, slogan, couleurs, polices | Oui | `site_settings` | Implémenté ; synchronisation distante à valider |
| Accueil, textes, images et boutons | Oui | `page_content`, `homepage_sections` | Rendu local testé ; mutations distantes à valider |
| Ordre/visibilité de l'accueil | Oui | `homepage_sections`, RPC `move_content` | Implémenté ; RPC distante à valider |
| Histoire et valeurs | Oui | `page_content`, `history_milestones`, `club_values`, galerie | Rendu local testé ; mutations distantes à valider |
| Joueurs et statistiques | Oui | `players`, `player_statistics`, `seasons` | Filtres locaux testés ; CRUD/RLS distants à valider |
| Staff technique | Oui | `staff_members`, Storage `staff` | Rendu local testé ; CRUD distant à valider |
| Bureau | Oui | `bureau_members`, `page_content`, Storage `bureau` | Rendu local testé ; CRUD distant à valider |
| Matchs, résultats, adversaires | Oui | `matches`, `teams`, `competitions`, `seasons` | Rendu/filtres locaux testés ; CRUD distant à valider |
| Classements et palmarès | Oui | `standings`, `trophies` | Calculs locaux testés ; RLS/écritures distantes à valider |
| Galerie photos | Oui, import multiple et médiathèque | `gallery_images`, `gallery_categories`, Storage `gallery` | Lightbox/filtres locaux testés ; upload distant à valider |
| Contact et messages | Oui | `site_settings`, `page_content`, `contact_messages` privé | API locale testée ; clé serveur à renseigner pour Supabase |
| Navigation, footer, réseaux sociaux | Oui | `navigation_items`, `site_settings` | Rendu et FR/AR locaux testés ; sauvegarde distante à valider |
| Administrateurs | Super admin uniquement | `admin_users`, RPC `set_admin_role` | Gardes simulées testées ; RLS réelle à valider |
| Actualités | Non : section absente du projet actuel | Aucune table/route dédiée | Non ajoutée conformément au respect de la structure existante |
| Partenaires/sponsors et galerie vidéo | Non : sections dédiées absentes | Aucune table/route dédiée | Non ajoutées conformément au périmètre existant |

Les publications utilisent les indicateurs existants `is_visible`, `is_active`
et les politiques de lecture publique. Les buckets existants sont publics
pour les images du site ; ils ne doivent pas contenir de documents privés.
Les écritures Storage restent réservées aux rôles administrateur autorisés.

## D. SQL

Nouveaux fichiers, fournis mais **non exécutés sur votre base** :

1. `supabase/migrations/007_branding_and_publication.sql` : colonnes facultatives
   de logos, contraintes de liens et politique publique des trophées.
2. `sql/diagnose-admin.sql` : vérification en lecture seule pour un UUID précis.
3. `sql/grant-admin.sql` : attribution explicite de `super_admin` à un compte
   Auth existant ; échoue si l'UUID n'existe pas.
4. `sql/README.md` : ordre complet et distinction base neuve/base existante.

Les migrations 001 à 006 existantes sont conservées. Aucune table n'est
supprimée, aucun utilisateur n'est créé, aucun mot de passe n'est codé en dur
et RLS n'est pas désactivée. Ne pas réexécuter les migrations initiales sur
une base existante et ne pas appliquer 007 deux fois.

## E. Tests réellement effectués

| Contrôle | Résultat |
| --- | --- |
| `npm run typecheck` | Réussi après les dernières modifications |
| `npm run lint` | Réussi |
| `npm run build` | Réussi avec sortie isolée `.next-production` |
| `npm run test:auth` | Réussi avec clients simulés : validation, email normalisé, mot de passe inchangé, autorisation editor/super_admin, refus des autres rôles, erreurs Auth/RPC/réseau, gardes et déconnexion |
| `npm run test:session` | Réussi avec SDK SSR réel et API Auth simulée : écriture des cookies, relecture lors d'une nouvelle requête, effacement et refus après déconnexion |
| `npm run test:domain` | Réussi : règles sportives, liens, dates, contact et quota |
| `npm run test:security` | Réussi : validations, liens dangereux refusés, contrats SQL statiques et compatibilité des documents existants |
| `npm run test:contact` | Réussi après isolation du build : validation, honeypot, origine, taille, quota, stockage local et mode désactivé |
| `npm run test:e2e` | Réussi : Chromium, sept pages incluant l'accueil, 1440/768/390 px, filtres, lightbox, contact, matchs, routes admin anonymes, favicon de repli et FR/AR ; aucun débordement ni erreur JS. Résultats dans `test-results/checks.json` |
| `npm run diagnose:supabase` | Échec réseau `EACCES` sur Auth, REST et RPC ; résultat attendu du diagnostic dans cet environnement restreint |
| Recherche dans les bundles navigateur | Aucun identifiant de variable `SUPABASE_SERVICE_ROLE_KEY` ni occurrence `service_role` dans les fichiers JS de `.next-production/static` |

Les premières tentatives contact/navigateur ont échoué au démarrage et avec
des erreurs de modules `.next`. Elles ne sont pas comptabilisées comme réussies ;
les commandes ont été relancées après correction des dossiers de sortie.

Non vérifiés sur Supabase : mot de passe du compte réel, confirmation email,
session réelle après rafraîchissement/expiration, rôle effectif, RLS exécutée,
CRUD, Storage, logo/favicon remplacés, invitations/SMTP et contact distant.
Les formulaires et l'aperçu authentifiés ne sont pas déclarés validés par un
test navigateur connecté. Le script de mutations distantes n'a pas été lancé :
il exige un projet jetable et des comptes de test configurés.

## F. Actions restantes

1. Vérifier l'historique de votre base. Si 001 à 006 sont déjà installées,
   appliquer uniquement 007 ; sinon suivre `sql/README.md`.
2. Exécuter `sql/diagnose-admin.sql` avec l'UUID du compte concerné.
3. Si ce compte doit administrer le site et n'a pas de rôle autorisé, exécuter
   `sql/grant-admin.sql` avec ce même UUID. Confirmer l'email et définir son
   mot de passe via Supabase/invitation si nécessaire.
4. Renseigner la clé serveur localement pour invitations/contact, les URL Auth
   et SMTP. Ne jamais transmettre la clé ou le mot de passe dans une conversation.
5. Relancer le serveur avec `npm run dev` ou `npm run build` puis `npm start`.
6. Depuis un environnement ayant accès au projet, vérifier login, reload,
   logout, sauvegarde/relecture du contenu, upload, publication et identité.
   Exécuter les tests RLS et `test:supabase` sur un projet de test jetable.

Référence technique : [Supabase — SSR et cookies de session](https://supabase.com/docs/guides/auth/server-side/creating-a-client).
