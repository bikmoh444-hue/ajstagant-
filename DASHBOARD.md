# Dashboard simple — AJT TAGANT

L'administration est regroupée en huit rubriques, avec une page d'entrée
« Mon site » qui donne accès à chacune par une carte.

| Rubrique | Contenu |
| --- | --- |
| Accueil | Grande bannière, photos, présentation, résumé historique, titres, boutons, objectifs, ordre et visibilité |
| Histoire | Textes, photo, chronologie et valeurs |
| Équipe | Présentation, joueurs, staff, statistiques et saisons |
| Matchs & Classement | Matchs, résultats, classement, équipes, compétitions, saisons et palmarès |
| Galerie | Photos, import multiple, albums et textes |
| Bureau directeur | Membres, portraits, rôles et présentation |
| Contact | Présentation, coordonnées, réseaux sociaux et messages reçus |
| Paramètres | Nom FR/AR, slogan, logo principal, favicon, image de partage, footer et menu |

Une seule rubrique est affichée à la fois. Les documents ont un éditeur direct
avec boutons Français/العربية et Enregistrer, sans identifiants ni JSON brut.
Les anciennes routes avancées restent disponibles pour préserver les fonctions
existantes. La gestion des administrateurs est rangée dans « Gérer les accès ».
Les protections Auth/RLS restent obligatoires.

## Contenu de départ

Depuis `/admin`, le bouton **Préparer le contenu** enregistre dans Supabase :

- sept documents éditoriaux FR/AR, en complétant les champs vides ou provisoires ;
- un logo et un favicon de départ si ces références sont vides ;
- les illustrations locales du terrain, du collectif et de l'entraînement ;
- la navigation et les sections manquantes ;
- des objectifs, valeurs et étapes de présentation si leurs tables sont vides ;
- des fiches exemples de joueurs, de staff et de bureau si ces tables sont vides ;
- une saison, une compétition, un adversaire, un match et un classement exemples
  si aucune rencontre n'existe.

Les personnes et rencontres exemples sont **masquées**. Remplacer les données
avant publication. Aucun résultat, palmarès, nom de personne réelle, compte
administrateur ou mot de passe n'est inventé.

Les illustrations sont des SVG de présentation, et non des photographies
officielles. Elles se trouvent dans `public/images/starter/`. Les nouvelles
photos téléversées avec les formulaires continuent d'utiliser Supabase Storage.
Les contenus personnalisés, les liens existants et les indicateurs de visibilité
existants sont conservés. La préparation peut être relancée après interruption.

Cette préparation nécessite une session admin valide et les tables existantes.
Aucune migration supplémentaire n'a été ajoutée pour cette simplification.
Les contraintes et champs ajoutés par les migrations précédentes restent requis
par les fonctions correspondantes du projet.

## Vérifications

`npm run test:admin` vérifie les huit rubriques, les documents FR/AR, le rendu des
composants et l'action d'initialisation avec une base simulée : conservation des
textes/logo personnalisés, absence de doublons à la seconde exécution, exemples
masqués et refus sans autorisation.

`node scripts/check-admin.mjs --browser` ajoute des captures Chromium du rendu
statique à 1440/768/390 px. Cela ne remplace pas un test de session authentifiée
contre Supabase. Les aperçus statiques générés ne sont pas des routes publiques
de l'application et ne contournent pas son authentification.

L'accès distant à Supabase est restreint dans l'environnement de travail : les
nouveaux contenus n'ont pas été écrits dans votre instance pendant cette tâche.
Le bouton de préparation permet de les enregistrer depuis votre navigateur,
une fois connecté avec un rôle autorisé.

Contrôles exécutés : TypeScript, lint, tests d'administration avec base simulée,
tests Auth simulés, tests publics des sept pages sur trois tailles et captures
statiques de Mon site/Accueil avec des viewports réels de 1440, 768 et 390 px.
Les captures admin ne présentent aucun débordement horizontal.
