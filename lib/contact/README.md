# Contact — étape 3

> Mise à jour Prompts 4–5 : le mode `supabase` écrit les messages via la RPC serveur `submit_contact` et applique un quota atomique partagé en PostgreSQL. La clé service_role reste exclusivement sur le serveur. Le dashboard permet de lire et traiter les messages. Le mode local est réservé aux tests ou au développement temporaire. Voir [supabase/README.md](../../supabase/README.md) pour la configuration actuelle ; les paragraphes ci-dessous décrivent l’adaptateur local initial.

`app/api/contact/route.ts` accepte uniquement du JSON et valide les données avec le même schéma Zod que le formulaire. Les longueurs, le téléphone facultatif, l’email et le champ honeypot sont vérifiés côté serveur. La taille du corps est limitée pendant sa lecture. Les origines étrangères explicites sont refusées.

L’origine est comparée à l’hôte demandé par le navigateur, car l’URL interne de Next peut utiliser `localhost`. Pour un reverse proxy TLS, renseigner `CONTACT_PUBLIC_ORIGIN` avec l’origine publique exacte (exemple : `https://club.example`). Les en-têtes `x-forwarded-host` ne sont pas utilisés.

Le quota est de cinq tentatives par fenêtre de quinze minutes, y compris les données invalides. La réponse 429 comprend `Retry-After`. Le quota vit en mémoire dans chaque processus : pour un déploiement multi-instance, le remplacer par un quota partagé dans un service durable lors de l’étape d’infrastructure. Aucune prétention à une protection distribuée n’est faite ici.

Par défaut, les en-têtes d’IP ne sont pas fiables et toutes les requêtes partagent un quota. Activer `CONTACT_TRUST_PROXY=true` uniquement derrière un proxy maîtrisé qui remplace `x-forwarded-for`. Sans cette garantie, laisser `false` pour éviter le contournement par en-tête falsifié. Les IP sont hachées pour les clés mémoire et ne sont pas stockées avec les messages.

## Enregistrement temporaire

- En développement, l’adaptateur local est actif par défaut.
- En production, il est désactivé par défaut et renvoie 503 sans prétendre que le message a été envoyé.
- `CONTACT_STORAGE_MODE=local` active explicitement l’enregistrement dans `.local/contact-messages/<uuid>.json` sur un serveur avec disque persistant. Le formulaire indique ce mode et précise qu’aucun email n’est envoyé.
- Chaque message possède un UUID, une date UTC et un statut `new`. Les fichiers sont hors de `public/` et exclus de Git. Aucune donnée personnelle n’est écrite dans les journaux.
- Une confirmation 201 n’est renvoyée qu’après la réussite de l’écriture. Un échec d’écriture renvoie 500 ; une erreur réseau côté navigateur ne produit jamais de fausse confirmation.

L’adaptateur `ContactMessageRepository.save` est le point de remplacement pour Supabase à l’étape suivante. Ne pas exposer les messages en lecture publique. Prévoir la table, ses RLS, la conservation des messages et l’accès admin à cette étape. L’adaptateur local ne convient pas à un hébergement dont le disque est éphémère.

Le formulaire de l’accueil reste celui du Prompt 1, conformément à la consigne de ne pas modifier les pages précédentes. Le nouveau formulaire se trouve uniquement sur `/contact`.

## Vérifications

`npm run test:domain` contrôle les règles Zod et le quota. Après le build, `npm run test:contact` lance deux serveurs temporaires successifs sur le port 3110 pour contrôler les erreurs, le honeypot, les origines, les tailles, le quota, la persistance locale et le mode désactivé. Seuls les messages synthétiques créés par le test sont supprimés. Aucun email ni message externe n’est transmis.
