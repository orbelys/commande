# Liaison intermittente : diagnostic et correction

## Cause reproduite

Le controle de fraicheur dans `usePoste` comparait `snapshot.majA` au dernier
tick d'une horloge React actualisee toutes les 30 secondes. Electron publie
plus souvent pendant une projection. Une nouvelle publication pouvait donc
sembler venir de plus de cinq secondes dans le futur : le telephone declarait
alors la liaison invalide et desactivait les commandes.

Chaque utilisation du hook avait son propre tick. L'en-tete et la page Projection,
montes a des moments differents, pouvaient afficher simultanement une liaison
active et des boutons desactives. Ce scenario a ete reproduit avant correction,
avec une connexion simulee parfaitement stable. Ce n'etait donc pas uniquement
un probleme de cache ou de connexion dans ce scenario.

## Correction ciblee

- Comparaison a `Date.now()` a chaque rendu ; l'horloge conserve son role de
  declencheur periodique en l'absence de nouvelles donnees.
- Maintien des protections contre une vraie date future, un etat ancien,
  une version incompatible et une connexion hors ligne.
- Motif de blocage affiche dans Projection : connexion, fraicheur, version
  ou confirmation en attente. Erreur de la derniere commande affichee sur place.
- Une commande d'une autre session de projection ou d'un autre poste ne bloque
  plus les commandes du cours actuel.
- Aucun changement Electron, Firebase, donnees utilisateur ou cours.

## Verification

`scripts/test-liaison-browser.cjs` utilise uniquement des donnees fictives et
bloque les acces reseau exterieurs. Il couvre les hooks reels montes en decale,
les publications toutes les deux secondes, l'attente et l'erreur d'une commande,
l'envoi de l'arret du minuteur, les protections et quatre largeurs d'ecran.
L'option `--baseline` sert a reproduire le defaut sur la version non corrigee.
Playwright se charge depuis `PLAYWRIGHT_MODULE` ou le module local `playwright`.

Le moteur de projection installe a la meme empreinte que celui teste en instance
Electron isolee : le lancement et l'arret du minuteur y sont confirmes. Cela ne
constitue pas une verification du trajet Firebase sur l'iPhone reel. Les controles
de session, d'etape et de delai restent actifs : une commande peut encore etre
refusee si l'etape change sur l'ordinateur entre l'affichage et le clic ; son erreur
est desormais visible dans la page Projection.

Apres publication : actualiser la telecommande sur le telephone. Pas de nouvelle
installation Electron necessaire pour ce correctif. Si le probleme persiste,
relever le message precis et le statut dans Commandes, sans multiplier les clics.
