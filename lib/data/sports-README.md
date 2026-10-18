# Calendrier et classement — étape 3

> Mise à jour : les tables et le dashboard sont implémentés dans les Prompts 4–5. Voir [supabase/README.md](../../supabase/README.md) pour l’installation et les tests réels. Les données de démonstration ci-dessous sont réservées à la prévisualisation explicite.

`SportsRepository.getSportsContent()` est une source interchangeable, actuellement alimentée par `sports-demo.ts`. Les rencontres et scores de démonstration sont signalés sur la page et chaque carte. Aucune ligne de classement et aucun trophée fictif ne sont créés.

Les types `Season`, `Competition`, `Team`, `Match`, `MatchResult`, `StandingsRow` et `Trophy` figurent dans `lib/types/sports.ts`. Les enregistrements administrables ont des identifiants stables, `sort_order`, `is_visible` et `is_demo`.

- Les filtres saison et compétition agissent sur le calendrier, les résultats, le tableau, les indicateurs du hero et le palmarès.
- Les scores sont nullables. Un indicateur V/N/D n’est calculé que pour un match terminé, avec les deux scores connus, qui implique A.J.S TAGANT. L’indicateur tient compte du domicile et de l’extérieur ; un zéro connu est conservé.
- Les rencontres reportées ou annulées affichent leur statut et aucun résultat V/N/D. Les matchs en direct affichent le score si les deux valeurs sont disponibles.
- Les prochains matchs sont triés par date, les directs en premier ; les dates inconnues viennent ensuite. Les résultats sont triés par date décroissante. L’ordre administré départage les dates identiques ou absentes.
- Les heures sont formatées explicitement avec le fuseau du contenu, actuellement `Africa/Casablanca`. Stocker les dates avec un décalage UTC en base.
- Le classement est saisi manuellement : rang, matchs, victoires, nuls, défaites, buts et points. La différence de buts est calculée. La ligne du club est identifiée par `club_team_id`, pas par une comparaison de nom.
- Les zones colorées sont activées seulement si `qualification_positions` ou `relegation_positions` sont renseignées dans la compétition. Aucune règle de points, de départage ou de qualification n’est supposée.
- Les URL de billetterie et de diffusion doivent être configurées en HTTP(S) pour afficher leurs liens. Les logos distants demandent l’ajout du domaine autorisé à `next/image` si le domaine diffère du Storage configuré.

L’étape Supabase ajoutera les tables, relations et politiques de sécurité, ainsi que le dashboard de saisie manuelle. Aucune API de fédération n’a été inventée ni appelée.
