# Audit final A.J.S TAGANT

Date : 18 octobre 2026.

Les corrections ont été réalisées dans le projet existant, sans reconstruction, modification des variables locales, suppression de données ni écriture dans Supabase distant. L'identité graphique et les mises en page desktop ont été conservées ; les adaptations compactes ciblent les petits écrans.

## Corrections et optimisation

- Correction du contrat généré : `gallery_images.category_id` référence désormais `gallery_categories`, et non `team_categories` (`scripts/generate-db-contract.mjs` et contrat généré).
- Calcul de l'âge des joueurs selon leur anniversaire complet ; traduction des statuts capitaine et vice-capitaine.
- Unification du choix de stockage du formulaire entre page, accueil et API (`lib/contact/config.ts`). Compatibilité avec les anciens sujets courts et messages conservée.
- Images optimisées uniquement pour les sources locales et Supabase publiques autorisées ; sources externes, signées et SVG conservées sans optimisation incompatible (`lib/utils/images.ts`, ClubMedia, galerie et bureau). Originaux préservés.
- Conservation de la source commune des images Histoire entre FR et AR, couverte par les tests de non-régression.
- Aperçu du dashboard chargé à la demande ; JavaScript initial de sa page d'édition passé d'environ 168 à 156 kB dans les builds locaux.
- Requêtes des listes de référence limitées aux champs nécessaires à la collection ouverte. Suppression de la requête bureau devenue inutile sur l'accueil.
- Authentification dédupliquée par cache limité à la requête React ; schémas Zod statiques réutilisés. Aucun cache global de session utilisateur.
- Préconnexion des polices, tailles adaptatives des images et chargement différé des images secondaires.

## Sécurité

- Examen des gardes administrateur, des rôles `super_admin`/`editor`, actions serveur, validations, politiques SQL et règles Storage existantes.
- Ajout d'en-têtes : interdiction d'intégration dans une frame, `nosniff`, politique de référent et restrictions caméra/micro/géolocalisation. CSP ciblée sur `frame-ancestors`, `base-uri` et `object-src`, sans désactiver les protections existantes.
- Tests des actions d'upload : autorisation, bucket, taille maximale, fichier vide, signature/MIME, SVG interdit, nom UUID et suppression d'une image référencée. Ces tests utilisent un client simulé, pas le Storage réel.
- Nouvelle politique restrictive empêchant la lecture publique des joueurs d'une catégorie masquée, tout en préservant l'accès administrateur.
- Frontière `server-only` du client privilégié contrôlée ; aucun nom de variable publique sensible détecté. Les 49 fichiers client générés ont été inspectés. Aucune clé privée n'étant configurée localement, la recherche de valeurs secrètes réelles ne constitue pas une validation de la configuration de production.
- Versions déjà installées conservées et figées : Next 15.5.28, React/React DOM 19.3.1 et sharp 0.35.5. Vérification ciblée des avis officiels [Next images](https://github.com/vercel/next.js/security/advisories/GHSA-2464-fhr4-w9xw), [Next actions](https://github.com/vercel/next.js/security/advisories/GHSA-p3m5-59mp-jv5r) et [React](https://github.com/react/react/security/advisories/GHSA-xqc2-xf4c-x3h3). Cela ne remplace pas un audit complet des dépendances.

### SQL à appliquer séparément

`sql/final_security_policies.sql` : nécessite les migrations 001 à 008. Tester d'abord sur une base jetable, puis exécuter dans Supabase SQL Editor. Vérifier la lecture anonyme des joueurs des catégories visibles/masquées et l'accès des deux rôles habilités. Le fichier ne supprime aucune table ni donnée ; il remplace uniquement sa politique nommée pour rester réexécutable. Il n'a pas été exécuté sur la base distante.

## Responsive et accessibilité

Principaux fichiers : `app/public-mobile.css`, `app/admin/admin.css`, Header et AdminShell.

- En-tête et menu compacts, fermeture par Échap et clic extérieur, retour du focus au bouton.
- Titres, portraits, cartes, marges et sections réduits sur téléphone ; grilles adaptées aux petites largeurs.
- Champs de 16 px et commandes tactiles d'au moins 44 px dans les règles mobiles concernées.
- Gestion FR/LTR et AR/RTL conservée ; prise en compte de la réduction des animations.
- Vérifications Chromium à 320, 375, 390, 430, 768 et 1440 px : sept pages publiques dans les deux langues, filtres, galerie, matchs, contact, menu et refus d'accès administrateur anonyme. Aucun débordement horizontal détecté.
- Toutes les huit sections du dashboard et les éditeurs ont été vérifiés aux six largeurs au moyen de fixtures des composants réels. Cela valide la mise en page ; cela ne valide pas une session authentifiée contre Supabase réel.
- Contrôles des attributs alternatifs des images, directions de langue, clavier du menu et en-têtes HTTP. Aucun audit exhaustif WCAG ni essai lecteur d'écran effectué.

## Nettoyage confirmé

Composants inutilisés supprimés :

- `components/contact/contact-form.tsx` : ancien formulaire de démonstration désactivé.
- `components/ui/pending-page.tsx` : aucun appelant.

Scripts ponctuels non référencés supprimés dans `.local/` :

`check-backend.mjs`, `contact-home-mode.mjs`, `finish-locale.mjs`, `fix-package-lock.mjs`, `fix-trophies.mjs`, `history-image.mjs`, `localize-components.mjs`, `refine-admin-editor.mjs`, `refine-repository.mjs`, `trophy-icon.mjs`, `update-home.mjs`, `update-metadata.mjs`, `version-favicon.mjs`.

41 anciennes règles CSS sans référence retirées, soit 3 029 octets de source. Les nouvelles adaptations mobiles ajoutent du CSS : ce chiffre ne représente pas une réduction nette du bundle. Toutes les migrations SQL, ressources utilisées, configurations de déploiement et dépendances utiles sont conservées. Aucune dépendance n'a été retirée sans preuve d'inutilité.

## Tests et résultats

| Contrôle | Résultat et portée |
| --- | --- |
| Build Next.js | Réussi, compilation et vérification TypeScript incluses |
| ESLint | Réussi, sans avertissement à la dernière exécution |
| `test:unit` | Réussi : domaine, auth, session, sécurité, actions admin simulées, images Histoire, compatibilité catégories et uploads |
| `test:contact` | Réussi : validation, piège anti-spam, origine, taille, quota, persistance locale et service désactivé |
| `test:e2e` | Réussi : sept pages publiques, six résolutions, FR/AR, interactions ; données explicitement de démonstration |
| `test:admin -- --browser` | Réussi : composants du dashboard et grilles du bureau aux six résolutions, données simulées |
| `test:production` | Réussi : versions cohérentes, en-têtes et contrôles statiques des fichiers client ; zéro valeur privée configurée |
| Audit npm | Non abouti : registre inaccessible depuis cet environnement |
| Tests Supabase réels | Non exécutés : accès réseau et configuration privilégiée indisponibles |
| Lighthouse / Core Web Vitals terrain | Non exécutés ; aucun score attribué |

Artefacts : `test-results/checks.json`, `test-results/production-audit.json` et captures PNG par page/résolution. Les mesures locales de LCP et CLS sont indicatives, sans limitation réseau et sur données de démonstration ; elles ne constituent pas des métriques de production ni une mesure d'INP. Les captures peuvent comporter les placeholders des données de démonstration.

## Points à vérifier avant mise en production

1. Configurer côté serveur la clé de service requise pour le stockage Supabase des messages ; elle est absente localement. Le secret de limitation de débit est également absent localement. Ne jamais utiliser le préfixe `NEXT_PUBLIC_` pour ces secrets.
2. Vérifier les migrations présentes sur la base réelle, notamment les catégories d'équipe, puis tester et appliquer le complément RLS ci-dessus.
3. Exécuter les tests Supabase dans un environnement jetable : authentification des deux rôles, RLS, CRUD, envoi de contact visible au dashboard, uploads et synchronisation publique FR/AR. Aucune donnée de production n'a été utilisée pour des tests destructifs.
4. Vérifier sur l'hébergeur les origines autorisées, URL de redirection Auth et paramètres de proxy. N'activer la confiance dans les en-têtes proxy qu'avec un proxy qui les réécrit. Les tests locaux activent cette option uniquement dans leur processus isolé.
5. Relancer `npm audit` avec accès au registre ; effectuer Lighthouse mobile et contrôles après déploiement avec les images et contenus réels.

Le code et les vérifications locales sont finalisés. La validation de production reste conditionnée aux contrôles distants et de configuration ci-dessus.
