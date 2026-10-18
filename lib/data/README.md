# Contrat des pages — Prompt 2

> Mise à jour Prompts 4–5 : l’implémentation Supabase et le dashboard sont maintenant présents. L’installation réelle et ses tests sont décrits dans [supabase/README.md](../../supabase/README.md). Les notes de préparation ci-dessous décrivent le contrat initial ; les politiques et tables sont désormais dans les six migrations.

`repository.ts` expose des méthodes serveur indépendantes pour l’accueil, l’histoire, l’équipe, la galerie et le bureau. Les composants reçoivent leurs données en props. `pages-demo.ts` contient uniquement des présentations provisoires, sans faits sportifs vérifiés.

## Passage au dépôt Supabase

Implémenter `ContentRepository & PagesRepository` avec le SDK serveur lors de l’étape dédiée, sans modifier les composants. Les contrats se trouvent dans `lib/types/site.ts` et `lib/types/pages.ts`.

Les collections destinées au dashboard disposent de `id`, `sort_order`, `is_visible` et `is_demo`. `visibleInOrder` masque les entrées invisibles et trie une copie sans modifier la collection d’origine.

Modèle prévu :

| Collection | Données principales |
| --- | --- |
| Histoire | Hero, texte d’origine, citation, photographie, document des statuts |
| Étapes | Date nullable, titre, description, ordre |
| Valeurs | Titre, description, clé d’icône |
| Joueurs | Nom, poste, numéro nullable, photo, nationalité, capitaine, saison |
| Statistiques | Joueur, saison, matchs, buts, passes, clean sheets |
| Staff | Nom nullable, fonction personnalisable, portrait, biographie |
| Bureau | Nom nullable, fonction personnalisable, président, biographie, mandat |
| Catégories | Identifiant stable, libellé, ordre, visibilité |
| Galerie | Catégorie, image, titre, description nullable, date nullable |

Les statistiques sont associées à un joueur et une saison ; prévoir une contrainte d’unicité sur ce couple dans la future migration. Une valeur inconnue doit rester `null` ou absente. Un zéro confirmé est affiché ; une valeur manquante est masquée. Les clean sheets ne s’affichent que pour les gardiens. Les indicateurs de hero inconnus affichent « À confirmer ». `is_demo` doit rester vrai tant que les données n’ont pas été validées.

## Médias Storage

Renseigner `NEXT_PUBLIC_SUPABASE_URL` et fournir les URL publiques ou signées dans `image.src`. `next.config.ts` autorise uniquement les URL de ce projet sous `/storage/v1/object/**`. Redémarrer / reconstruire Next après changement de domaine. Aucune clé service-role n’est nécessaire dans les composants et aucune requête Supabase n’est encore effectuée.

Les URL de médias nulles affichent un emplacement explicite. Les photographies réelles utilisent `next/image`, avec chargement différé et tailles responsive. Les photos et catégories masquées ne sont pas présentées dans la galerie ni dans la lightbox. La lightbox parcourt les photos déjà affichées dans le filtre courant ; le bouton « Voir plus » étend cette liste.

Le lien `galerie?categorie=<id>` permet d’ouvrir directement une catégorie. Le lien des supporters utilise actuellement l’identifiant de démonstration des matchs ; le remplacer par l’identifiant stable lors du chargement des données officielles.

Aucun dashboard, schéma SQL métier ou accès d’administration n’est implémenté dans cette étape.
