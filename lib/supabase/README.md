# Clients Supabase

`client.ts` : navigateur ; `server.ts` : session SSR avec cookies ; `public.ts` : lectures anonymes indépendantes de la session admin ; `service.ts` : clé serveur limitée au contact et aux invitations. `database.ts` décrit les tables et RPC.

Les repositories sont dans `lib/data/supabase-repository.ts`. Une base configurée ne retombe pas sur des données de démonstration lors d’une erreur. Le middleware rafraîchit les sessions admin ; chaque route et mutation vérifie l’utilisateur Auth puis le rôle en base.

L’installation, les migrations, les rôles et les tests réels sont décrits dans [supabase/README.md](../../supabase/README.md). La présence de ces fichiers ne signifie pas que les migrations ont été appliquées à un projet distant.
