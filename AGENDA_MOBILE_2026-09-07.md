# Agenda mobile : Jour, Semaine et suivi du present

## Fonctionnement

L'Accueil du telephone propose des vues Jour et Semaine, un calendrier, des fleches precedent/suivant et un retour a Aujourd'hui. A chaque ouverture de cet ecran, la date locale actuelle est selectionnee. Le suivi horaire se rafraichit toutes les dix secondes, au retour au premier plan et au reveil du telephone. Le passage a minuit change automatiquement la date si le suivi du present est actif. Une date choisie manuellement reste stable pendant la consultation.

Le creneau courant est mis en evidence ; les cours annules ou reportes ne sont pas annonces en cours. En vue Jour avec suivi du present, les creneaux termines sont regroupes dans une zone depliable. La vue Semaine conserve toutes les lignes. Les heures de fin restent facultatives, sans duree inventee. Les intitules longs reviennent a la ligne.

## Donnees disponibles

Le pont Electron publie la semaine precedente, l'actuelle et la suivante (21 jours, du lundi au dimanche) dans un champ optionnel `agenda` du meme instantane `postes/{uid}`. Il reutilise le filtrage existant des cours et rendez-vous, sans envoyer les notes, extraits de source ou liens de l'import. Les regles et chemins Firestore ne changent pas. Le protocole reste en version 5 ; le champ `journee` historique est conserve pour les anciens telephones.

Le calendrier affiche les bornes disponibles. Une journee vide recue est distincte d'une journee non recue. Un budget conservateur borne le volume supplementaire ; une omission faute de place est signalee comme periode partielle. La publication privilegie les dates proches du present.

Il s'agit d'une consultation glissante des dates passees/futures disponibles dans les imports et calendriers locaux, pas d'une archive permanente de l'annee ni d'un historique fige des anciennes versions de PRONOTE. L'emploi du temps est aussi recent que le dernier import dans Electron.

Le cache Firestore existant permet de consulter les donnees deja recues pendant une interruption de connexion ; leur anciennete est indiquee. Aucun fonctionnement du chargement initial du site sans reseau n'est garanti. Les commandes gardent leurs protections de connexion et d'expiration.

## Livraison et tests

Le pont correspondant est installe dans Electron, avec sauvegarde complete et verification de signature. La source du pont est dans `electron/pse-mobile-bridge.js` ; le fichier de l'application et la source EDITEUR ont ete alignes. Les donnees utilisateur n'ont pas ete modifiees par l'installation.

- 89 controles isoles du pont, des horaires et du transport.
- 70 controles navigateur des pages et de la projection existantes.
- 35 controles dedies a l'agenda : bornes, semaine precedente/suivante, minuit, reveil, cache, ancien pont et ecrans 320/390/768/1280 px.
- 14 controles Electron isoles, dont la publication des trois semaines.
- 19 tests reproductibles : `node scripts/test-agenda-navigation.cjs`.
- TypeScript et builds de simulation/production reussis ; captures Jour/Semaine examinees.

Tous ces essais utilisent des donnees fictives, sans commande sur les donnees reelles ni test d'ecriture Firebase. Reste la recette sur l'iPhone physique apres reouverture d'Electron et actualisation du site. Aucune promesse de fiabilite a 100 %.
