# Télécommande : correctifs du 7 septembre 2026

## Livraison coordonnée, protocole 5

Correctifs préparés après l'audit, avec publication et installation autorisées.
Aucune modification des règles Firebase, aucune écriture de test dans le compte
réel. Le protocole 5 nécessite une mise à jour coordonnée téléphone
et application ; une version incompatible est refusée, pas exécutée au hasard.

## Corrections

- Identité du poste, session de projection, état attendu et expiration dans
  chaque commande. Projection : 20 secondes ; autres commandes : 5 minutes.
- Acquisition transactionnelle Firestore et traitement séquentiel. Une commande
  prise par un exécuteur n'est pas rejouée automatiquement après une interruption.
- Accusé du présentateur puis de la fenêtre élèves, identifiant dédupliqué,
  délais d'attente, refus des étapes/documents/durées invalides. L'aperçu intégré
  ne compte plus comme une fenêtre élèves ouverte.
- Vérification du destinataire du relais, identifiant propre au lieu des seules
  millisecondes, attente de confirmation avant la commande suivante.
- Nettoyage des écoutes et timers lors des changements de fenêtre responsable.
- Connexion/déconnexion/reconnexion idempotentes côté téléphone, cache distingué
  du serveur, fraîcheur limitée à 90 secondes et bouton de relance de la liaison.
- Historique rechargé depuis Firestore. Une confirmation manquante est indiquée
  « À vérifier », sans prétendre que l'action a forcément échoué ou réussi.
- Mémo et remise relus après écriture ; séance absente ou état devenu différent
  refusés. Le champ mémo reste utilisable après un échec.
- L'affichage demandé d'un document quitte Focus et défile vers ce document.
- Aucun prénom tiré par la roue dans l'état mobile ; avertissement explicite
  concernant les textes libres qui, eux, sont synchronisés.
- Séances futures exclues de « Déjà passées ». Validation des codes d'absence ;
  réenregistrer les mêmes absents ne recrée plus un rattrapage déjà soldé.
- Simulation de la roue complétée. Paquet Firebase autonome reconstruit avec
  `runTransaction`, nécessaire en Electron `file://`.

## Vérification

Tests exclusivement fictifs et isolés : analyse TypeScript, compilation Vite,
48 assertions du pont/transport avec SDK simulé, 60 contrôles navigateur
(360, 390 et 1280 pixels), 10 contrôles Electron en `file://` et sans réseau.
Les captures du document projeté et du téléphone ont été examinées. Les tests
du SDK simulé ne constituent pas une recette Firebase de production.

Les sauvegardes, tests et reçus d'installation restent sur le poste local ;
aucune donnée utilisateur ni sauvegarde d'application n'est publiée.

## Procédure de mise en service et recette terrain

1. Fermer proprement les projections et sauvegarder les cours en cours d'édition.
2. Sauvegarder l'application signée et vérifier que les sources n'ont pas changé
   depuis cette livraison. Installer ensemble `pse-mobile-bridge.js`,
   `projection.html`, `progression-core.js`, `vendor/firebase-bundle.js` ;
   préserver les autres ressources. Vérifier à nouveau la signature macOS.
3. Publier la version correspondante de `docs/` sur GitHub Pages. Actualiser
   Safari : Synchronisation doit indiquer téléphone 5 / poste 5.
4. Tester avec un cours fictif : ouvrir les élèves, suivant, corrigé, Focus,
   document, minuteur, roue ; puis mémo/statut sur une séance de test autorisée.
5. Tester une vraie coupure réseau, le verrouillage du téléphone, le sommeil
   du Mac et le bureau étendu. Garder les commandes locales disponibles.

## Limites non masquées

- Pas de garantie de fiabilité à 100 %, ni de recette sur le vidéoprojecteur
  physique ou Safari/iPhone réel durant cette intervention.
- La confirmation atteste que la fenêtre élèves a traité les messages ; elle
  ne mesure ni la sortie HDMI ni ce que le vidéoprojecteur physique affiche.
- Horloges téléphone/Mac à régler automatiquement. Pas d'horodatage serveur
  faisant autorité pour l'expiration dans cette révision.
- Un compte publie toujours un instantané de poste unique : deux Mac simultanés
  peuvent faire alterner l'affichage. Le ciblage empêche un autre Mac d'exécuter
  l'ordre ; la sélection multi-postes reste à concevoir.
- Le bail entre fenêtres reste un bail local, pas un service central du processus
  principal. Une interruption après prise de commande impose une vérification
  humaine ; aucune relance automatique d'un effet potentiellement déjà réalisé.
- Les mémos/remises sont relus via l'API native de progression. Son `flush()`
  actuel ne fournit pas de promesse de fin d'écriture disque : cette révision
  ne garantit pas la persistance en cas de disque plein ou d'arrêt brutal.
  Les alertes de stockage existantes sur le Mac restent à surveiller.
- Fenêtre des séances publiée inchangée (J-1 à J+6). La liste historique des
  séances anciennes à clôturer reste à ajouter séparément.
- Les rattrapages restent agrégés par classe/code, pas par support distinct.
  Leur modèle n'a pas été migré sans validation.
- Les règles cloud existantes restent inchangées. Elles protègent la télécommande
  par compte, pas par rôle « téléphone »/« poste » ; leur validation de schéma,
  la conservation des commandes et les autres collections publiques nécessitent
  un chantier distinct avant de parler de sécurité globale validée.
- Aucun ajout d'audio mobile, d'import de SMS, de rappels ou de calendrier dans
  ce correctif. Aucun cours, liste d'élèves ou planification réelle modifié.
