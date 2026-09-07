# Agenda et progression mobile : correctifs du 7 septembre 2026

## Causes et corrections

- Le pont attendait le premier `setDoc` avant d'installer son battement et ses abonnements. Un rejet laissait `enMarche` actif, sans reprise. Les reprises sont maintenant installees avant cet envoi ; les publications suivantes retablissent l'indication de liaison.
- Certains anciens evenements portaient toute la plage dans le debut. La frise mobile reconnait cette forme, y compris dans un ancien instantane en cache. Le calendrier Electron dispose du meme correctif en lecture, sans migration des donnees.
- Une fin absente ne permet pas d'affirmer qu'un rendez-vous est encore en cours. Elle reste facultative et s'affiche comme non precisee.
- Une journee en cache garde sa date reelle ; elle n'est plus presentee systematiquement comme celle d'aujourd'hui.
- Le libelle « Ordinateur en veille » deduisait une cause physique de l'age des donnees. Il devient « Liaison a verifier ». Le seuil de fraicheur et les protections d'envoi restent inchanges.
- Les seances terminees etaient sous toutes les seances futures. Progression filtre maintenant par date, avec precedent, suivant et retour a aujourd'hui. La periode disponible reste J-1 a J+6 autour de la date de l'instantane, bornes visibles. Aucun historique plus ancien n'est promis.

## Perimetre

Protocole 5 conserve : pas de nouvelle collection, pas de changement de regles Firebase, pas d'extension du volume de donnees publiees. Les corrections du telephone restent compatibles avec le pont v5 precedent. Aucune fusion automatique des rendez-vous aux titres differents : leur equivalence doit etre confirmee.

Le correctif du pont est dans `electron/pse-mobile-bridge.js`. Son installation dans l'application Electron est une operation distincte, a effectuer application fermee ; la copie signee est preparee dans le dossier local de travail `remote-followup`. Ne pas remplacer une application ouverte ou des ressources qui auraient change depuis la preparation.

## Verification

- TypeScript et les deux builds Vite reussis.
- 76 controles isoles : pont, transport, reprise apres premier envoi rejete/suspendu, nettoyage, anciennes heures, fins facultatives et dates.
- 70 controles navigateur : navigation quotidienne, bornes, ecrans 360/390/1280 px, projection et confirmations des commandes, formulaire Firebase protege avant connexion.
- 12 controles Electron avec profil fictif et reseau bloque : projection et calendrier natif.
- Tests reproductibles des helpers : `node scripts/test-agenda.cjs` (23 controles, sans reseau ni donnees reelles).

Les tests n'ont envoye aucune commande aux donnees reelles. Restent a confirmer sur l'iPhone : rechargement de la nouvelle version, choix hier/demain, statut d'une seance et retour dans Electron, puis coupure/reprise du reseau en conditions de classe. Aucun engagement de fiabilite a 100 %.
