# Installation Supabase — AJT TAGANT

## État et prérequis

Le code comprend la connexion, le dashboard et les migrations. Les migrations et les politiques doivent être appliquées sur votre projet avant de lancer le site avec des variables Supabase. Il n’existe aucun compte ou mot de passe administrateur par défaut. Le dossier `references/` ne contient toujours pas les captures Stitch.

Dans l’environnement de réalisation, le serveur Docker et PostgreSQL ne sont pas disponibles, les téléchargements réseau npm sont refusés et la lecture distante Supabase échoue au niveau réseau. Les tests RLS réels et les opérations authentifiées sur votre projet restent donc à exécuter. Les tests locaux de contrats et d’interface ne constituent pas une validation distante.

## 1. Dépendances et variables

Installer Node.js 22 ou 24, puis à la racine :

```sh
npm ci
```

Copier `.env.example` vers `.env.local` et renseigner localement :

| Variable | Usage |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL de votre projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé anon publique du projet, soumise à RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | Serveur uniquement : contact et invitations Auth |
| `NEXT_PUBLIC_SITE_URL` | Origine du site, sans slash final |
| `CONTACT_STORAGE_MODE` | `supabase` en production ; `local` seulement pour un développement temporaire |
| `CONTACT_PUBLIC_ORIGIN` | Origine publique exacte derrière un reverse proxy TLS |
| `CONTACT_TRUST_PROXY` | `true` uniquement si le proxy remplace `x-forwarded-for` |
| `CONTACT_RATE_LIMIT_SECRET` | Secret aléatoire serveur pour hacher les clés de quota |

Ne jamais préfixer la clé de service par `NEXT_PUBLIC_`. Ne jamais committer `.env.local`. Un projet configuré qui ne répond pas ne bascule pas silencieusement sur des données fictives. `AJT_DATA_SOURCE=demo` est réservé aux contrôles locaux explicites ; ne pas l’activer en production.

## 2. Base Supabase vide

Créer un nouveau projet dans Supabase. Dans SQL Editor, exécuter **séparément et dans l’ordre** les fichiers complets :

1. `migrations/001_initial_schema.sql` — configuration, navigation, pages et rôles.
2. `migrations/002_content_tables.sql` — histoire, joueurs, staff, bureau, galerie, messages et médias.
3. `migrations/003_sports_tables.sql` — saisons, compétitions, équipes, statistiques, matchs, classement et trophées.
4. `migrations/004_storage_policies.sql` — six buckets et politiques Storage.
5. `migrations/005_rls_policies.sql` — droits publics et administrateurs.
6. `migrations/006_functions_triggers.sql` — contraintes de liens, horodatages, activité, points calculés, rôles, ordre, références médias et quota partagé.
7. `seed.sql` — paramètres, navigation, sections et textes provisoires FR/AR.

Chaque migration est transactionnelle. Ne pas réexécuter une migration déjà appliquée : utiliser le suivi de migrations de Supabase CLI ou noter chaque exécution SQL. Le seed utilise des clauses anti-doublon et ne remplace pas les contenus existants.

Le seed ne crée **aucun** joueur, dirigeant, match, résultat, ligne de classement, trophée ou compte administrateur fictif. Les informations manquantes restent absentes.

Alternative avec [Supabase CLI](https://supabase.com/docs/guides/local-development/overview), après installation et authentification de la CLI :

```sh
supabase link --project-ref VOTRE_PROJECT_REF
supabase db push
```

Le seed distant doit ensuite être exécuté explicitement dans SQL Editor. Sur une base existante, sauvegarder les données et vérifier les conflits avant le push. Les noms de fichiers numérotés correspondent aux migrations demandées.

Pour une base locale jetable avec Docker lancé :

```sh
supabase start
supabase db reset
```

**`db reset` efface la base locale : ne l’utiliser que pour une base de test jetable.** Il applique les six migrations puis le seed configuré dans `config.toml`.

> Mise à jour : l'installation comprend désormais la migration `007_branding_and_publication.sql`. Sur une base déjà installée jusqu'à 006, exécuter uniquement cette nouvelle migration. Voir [l'ordre complet et les scripts de diagnostic/attribution de rôle](../sql/README.md).

## 3. Premier super administrateur

Dans Supabase Dashboard → Authentication → Users, créer ou inviter le premier utilisateur Email + Password. Choisir son mot de passe dans l’interface sécurisée ou via le lien d’invitation ; aucun mot de passe ne doit être inscrit dans un script.

Copier son UUID Auth. Dans SQL Editor, avec le compte propriétaire du projet :

```sql
begin;
insert into public.admin_users(user_id, role)
select id, 'super_admin'
from auth.users
where id = 'REMPLACER_PAR_UUID_AUTH'::uuid
on conflict(user_id) do update set role = excluded.role;
commit;
```

Vérifier que l’insertion a bien concerné un utilisateur. Se connecter ensuite sur `/admin/login`. Aucun rôle n’est attribué sur la base d’une adresse email, d’un champ client ou de métadonnées modifiables par l’utilisateur. Chaque accès protégé et mutation vérifie `auth.getUser()` puis le rôle courant dans PostgreSQL.

Le super administrateur attribue ou retire les rôles via `/admin/administrateurs`. L’éditeur gère les contenus, les messages et les médias, sans pouvoir attribuer de rôle ni consulter la liste des administrateurs. La base protège le dernier super administrateur, y compris lors d’une suppression Auth en cascade. Pour supprimer le dernier compte, attribuer d’abord ce rôle à un autre compte autorisé.

## 4. Auth et invitations

Configurer Auth → URL Configuration : Site URL = votre origine publique ; autoriser `/admin/auth/confirm` et le domaine local utilisé. Désactiver les inscriptions publiques si elles ne sont pas nécessaires. Configurer SMTP et les limites Auth pour votre production.

Pour le template d’invitation (et de récupération si utilisé), diriger le lien vers :

```text
{{ .SiteURL }}/admin/auth/confirm?token_hash={{ .TokenHash }}&type=invite
```

La confirmation valide le jeton côté serveur puis ouvre `/admin/set-password`. Le mot de passe doit contenir au moins 12 caractères. Le compte invité reçoit ensuite son rôle **explicitement**, via son UUID Auth, par un super administrateur. L’invitation seule ne donne pas accès au dashboard.

La déconnexion utilise une Server Action POST ; la visite de `/admin/logout` présente un bouton et ne déconnecte pas via GET. Une session absente ou expirée renvoie vers le login. Les cookies de session sont rafraîchis par le middleware limité aux routes admin, conformément au [modèle SSR Supabase](https://supabase.com/docs/guides/auth/server-side/creating-a-client?framework=nextjs).

## 5. Storage et remplacement

Buckets : `club-assets`, `players`, `gallery`, `staff`, `bureau`, `match-assets`. Ils sont publics **uniquement pour des médias destinés à être publics** ; ne jamais y déposer de document confidentiel ou de message de contact. Un bucket public sert ses fichiers indépendamment de la visibilité d’une ligne éditoriale ; masquer une photographie ne rend pas son URL secrète ([documentation Storage](https://supabase.com/docs/guides/storage/buckets/fundamentals)).

Limite : 5 Mo par fichier. Formats : JPEG, PNG, WebP, AVIF et ICO ; pas de SVG téléversé. Les buckets limitent les MIME, la Server Action vérifie également les signatures binaires et génère des chemins aléatoires `user_uuid/file_uuid.ext`. Aucune écriture publique n’est autorisée.

Lors d’un remplacement, télécharger le nouveau fichier puis enregistrer le formulaire. L’ancien fichier reste dans la médiathèque pour éviter une suppression qui casserait d’autres pages. Après retrait de toutes ses références, le supprimer explicitement. La fonction SQL de contrôle inspecte aussi les documents FR/AR. Ne pas remplacer les objets à une URL existante : les URL immuables évitent les anciennes images dans les caches.

## 6. Modèle éditorial et dashboard

- `site_settings` : identité, apparence, coordonnées, réseaux et SEO.
- `page_content` : un document `section_key=config` par page, contenant les branches `fr` et `ar`. L’éditeur présente des champs et groupes, sans exiger d’écriture de JSON brut. Les champs relationnels masqués dans cet éditeur sont gérés dans les collections dédiées.
- `homepage_sections` : ordre et visibilité des dix sections. Boutons monter/descendre persistés par une RPC transactionnelle.
- Joueurs, objectifs, staff, bureau et galerie : collections avec relations et champs de mise en avant. Les sélections de l’accueil utilisent `is_featured`. Le président utilise `is_president`, pas une comparaison de son nom.
- Statistiques : une ligne par joueur/saison. `null` signifie inconnu, zéro signifie une valeur réellement renseignée.
- Classement : saisie manuelle ; différence de buts générée en base. `points_mode=manual` préserve les points officiels ; `calculated` applique les règles de la compétition uniquement lors d’un enregistrement de la ligne.
- Le calendrier public sélectionne les matchs futurs publiés et les directs. Les autres statuts restent dans les résultats ; la victoire est calculée du point de vue d’AJT TAGANT.
- Les messages sont privés. Le public passe par l’endpoint validé ; seule la clé serveur peut invoquer `submit_contact`. Le quota PostgreSQL est atomique et partagé entre instances ; un quota mémoire supplémentaire filtre les tentatives invalides avant l’accès à la base.
- Les modifications invalident le layout public et admin. Les lectures anonymes utilisent `cache:no-store` ; les regroupements React sont limités à la requête. Recharger un onglet public déjà ouvert pour observer la nouvelle version.

Les schémas TypeScript sont générés à partir des colonnes SQL avec `npm run db:types`. Il est aussi possible de comparer le résultat au générateur officiel Supabase sur le projet installé. `npm run db:seed-file` régénère le seed de développement depuis les modèles ; ne pas utiliser cette commande pour écraser les données administrées.

## 7. Tests et contrôle des permissions

```sh
npm run typecheck
npm run lint
npm run build
npm run test:domain
npm run test:security
npm run test:contact
npm run test:e2e
```

Les tests locaux de navigateur utilisent une source de démonstration explicitement isolée et ne valident pas une connexion distante. Ils vérifient notamment le refus des routes admin anonymes, le contact local, les six pages, les filtres, la galerie et le choix FR/AR persistant sur mobile, tablette et desktop.

Sur une base **jetable** après migrations + seed, exécuter `tests/permissions.sql` via SQL Editor ou :

```sh
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/permissions.sql
```

Le script utilise une transaction annulée et refuse une base contenant déjà des administrateurs. Il teste : visibilité publique, absence de messages et de liste admin publics, refus d’écriture anonyme, compte Auth sans rôle, accès éditeur, refus d’escalade, attribution par super administrateur et protection du dernier super administrateur. Ces tests doivent réellement être exécutés avant une mise en production ; leur présence seule ne prouve pas que la base a été testée.

Dans le dashboard réel, contrôler ensuite : login, logo et favicon, Hero FR/AR, ajout et rechargement d’un joueur/statistiques, membre du bureau, galerie et suppression d’un fichier non référencé, match/résultat/classement et réception d’un message. Le contrôle Storage doit inclure un upload réellement accepté et un upload visiteur refusé.

Un test distant est fourni avec `npm run test:supabase`. Il refuse de démarrer sans `AJT_RUN_MUTATION_TESTS=I_CONFIRM_DISPOSABLE_PROJECT`. Sur un projet jetable uniquement, renseigner les variables Supabase et les comptes Auth déjà créés : `AJT_TEST_EDITOR_EMAIL`, `AJT_TEST_EDITOR_PASSWORD`, `AJT_TEST_SUPER_EMAIL`, `AJT_TEST_SUPER_PASSWORD`. Ne pas committer ces variables. Le test vérifie Auth/RLS, les joueurs et statistiques, le bureau, les matchs, les points manuels/calculés, les uploads, les références médias, le Hero, le logo et les contacts. Il restaure les contenus modifiés et supprime ses enregistrements de test dans un bloc `finally`. Ne jamais le lancer pendant des modifications concurrentes ou sur la production. Il ne remplace pas le test SQL des migrations sur base vide et ne vérifie pas l’envoi d’emails d’invitation.

## 8. Déploiement Vercel

1. Importer le dépôt dans Vercel, preset Next.js ; commande `npm run build`.
2. Ajouter les variables de production listées plus haut dans les paramètres Vercel. `SUPABASE_SERVICE_ROLE_KEY` reste sans préfixe public. Ne pas activer `AJT_DATA_SOURCE=demo`.
3. Définir `NEXT_PUBLIC_SITE_URL` et `CONTACT_PUBLIC_ORIGIN` sur le domaine HTTPS final. Adapter les URL Auth Supabase. Vérifier les en-têtes du proxy avant d’activer la confiance IP.
4. Appliquer les migrations et le seed au projet de production avant le déploiement ; créer le premier super administrateur.
5. Déployer, puis exécuter les contrôles manuels de la section précédente. Le disque local n’est pas un stockage persistant sur Vercel : utiliser `CONTACT_STORAGE_MODE=supabase`.
6. Restreindre l’accès aux clés du projet, sauvegarder la base et définir une politique de conservation des messages. Ne pas activer de cache CDN public pour les routes admin ou les réponses avec cookies Auth.

Aucune vraie clé, aucun mot de passe ni aucune identité personnelle n’est inclus dans ces fichiers.
