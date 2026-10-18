# Installation et réparation Supabase

Ne jamais réexécuter les migrations initiales sur une base déjà installée.
Consulter l'historique des migrations et le schéma avant toute exécution. Aucun
script ci-dessous ne supprime de table ou de données existantes.

## Base neuve

Exécuter chaque fichier entier dans Supabase → SQL Editor, dans cet ordre :

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_content_tables.sql`
3. `supabase/migrations/003_sports_tables.sql`
4. `supabase/migrations/004_storage_policies.sql`
5. `supabase/migrations/005_rls_policies.sql`
6. `supabase/migrations/006_functions_triggers.sql`
7. `supabase/migrations/007_branding_and_publication.sql`
8. `supabase/migrations/008_team_management.sql` (équivalent : `sql/team_management.sql` ;
   catégories, joueurs, staff, buckets photos et RLS de l'équipe ; réexécutable).
9. `supabase/seed.sql` (contenus initiaux ; les lignes existantes sont conservées).

## Base déjà installée jusqu'à 007 (gestion de l'équipe)

Exécuter `sql/team_management.sql` (identique à
`supabase/migrations/008_team_management.sql`) une seule fois dans Supabase →
SQL Editor, avec le compte propriétaire. Il crée `team_categories`, ajoute
`category_id`, `playing_role`, `height_cm`, `preferred_foot`, `is_vice_captain`
aux joueurs, horodate `staff_members`, configure RLS, les buckets `players` et
`staff`, puis réordonne les catégories. Réexécutable : aucun joueur, membre du
staff ni photo existant n'est perdu.

## Base déjà installée jusqu'à 006

Exécuter uniquement `007_branding_and_publication.sql`, une seule fois.
Elle ajoute les références facultatives des logos header/footer et ajuste la
publication des trophées liés à une saison masquée. Elle conserve les données,
les rôles et les politiques d'administration existants.

## Compte Auth existant bloqué

1. Copier son UUID depuis Authentication → Users.
2. Remplacer l'UUID dans `sql/diagnose-admin.sql`, puis exécuter ce script en lecture seule.
3. Si le rôle manque et que ce compte doit administrer le site, remplacer
   `target_id` dans `sql/grant-admin.sql`, puis exécuter le fichier entier avec
   le compte propriétaire du projet. Il attribue explicitement `super_admin`
   à cet UUID uniquement ; aucun compte ni mot de passe n'est créé.
4. Vérifier que l'adresse est confirmée et que le mot de passe a été défini.
   Pour une invitation, ouvrir le lien reçu et définir le mot de passe.
5. Se connecter sur `/admin/login`. La clé service_role n'est pas nécessaire
   pour ce login ; elle sert aux invitations et aux messages de contact.

Configurer Site URL et les redirections autorisées vers `/admin/auth/confirm`,
SMTP et le fournisseur Email dans Supabase Auth. Voir `supabase/README.md`
pour le modèle de lien `token_hash` ; les invitations en fragment URL sont
également prises en charge. Ne jamais envoyer de clé ou mot de passe dans un ticket.

## Contrôles

`npm run diagnose:supabase` effectue seulement des lectures anonymes et ne
révèle aucun secret. Un résultat réseau `EACCES` signifie que l'environnement
ne peut pas contacter Supabase ; il ne prouve pas un problème de rôle.

`npm run test:auth` vérifie les branches Auth avec des clients simulés.
Les tests RLS et les mutations réelles restent distincts : utiliser
`supabase/tests/permissions.sql` et `npm run test:supabase` uniquement sur
un projet jetable configuré selon `supabase/README.md`.
