# Audio et accessibilite de la telecommande

Ajout autorise par Brahim, sans modification des Documents.

## Telephone

- Bouton Lire la question / Pause / Reprendre suivant l'etat publie par Electron.
- Bouton Arreter la lecture distinct.
- Menu Accessibilite replie : taille du texte, Fond de classe, Reinitialiser.
- Taille envoyee comme valeur absolue entre 70 et 200 %, pas comme bascule.
- Controles bloques pendant une commande en attente ou une vraie perte de liaison.
- Un ancien projecteur sans ces capacites garde les nouvelles commandes desactivees.

## Electron

Deux ressources seulement : `projection.html` et `pse-mobile-bridge.js`.
Les six commandes supplementaires utilisent la file existante, le meme compte,
les controles de session/etape/expiration et les confirmations deja en place.
Pas de nouvelles collections ni de modification des regles Firebase.

La synthese vocale s'effectue sur le Mac. Le telephone ne transmet pas de texte
arbitraire : Electron lit uniquement l'enonce de sa question actuelle. Aucune
commande distante de lecture du corrige n'est ajoutee. La lecture manuelle du
corrige, deja presente sur l'ordinateur, reste disponible.

La confirmation de lecture attend l'evenement de demarrage du moteur vocal.
L'absence de demarrage ou une erreur de voix sont signalees. Une nouvelle question,
le rechargement du cours ou la fermeture du presentateur interrompent la lecture.
Les evenements tardifs d'une ancienne lecture sont ignores.

Le Focus reste actif pendant la lecture et les reglages. Son agrandissement est
limite par la place disponible : A+ ne peut pas depasser la taille tenant a l'ecran.
Fond de classe reprend le reglage natif : taille 145 %, contraste et interligne.
Reinitialiser restaure les reglages d'origine du projecteur.

Les controles Documents, leur stockage et leur affichage ne sont pas modifies.

## Verification et installation

Tests isoles du pont, navigateur mobile et Electron ; donnees fictives, aucune
ecriture cloud de test. Voix systeme du Mac effectivement demarree dans l'instance
Electron de test. L'audibilite sur les enceintes de la classe reste a verifier
sur place. Aucun test ne garantit le reseau du telephone reel.

L'installation native exige Electron ferme, une sauvegarde de l'application
actuelle, une verification des changements concurrents et une signature macOS
valide. Les traces privees sont dans le dossier de travail `audio-accessibility`.
Actualiser la telecommande et relancer Electron apres installation des deux
ressources. La publication telephone seule n'active pas les fonctions sur un
ancien moteur de projection.
