# Greffe dans la Suite PSE — ce qui a été fait

Appliqué le 6 septembre 2026 dans `ATELIER COURS PSE/EDITEUR/`.
Tout est **additif** : aucune ligne existante n'a été modifiée ni supprimée.
Sauvegardes créées à côté de chaque fichier, sous le nom
`…SAUVEGARDE_avant_telecommande_mobile_2026-09-06_190359.…`.

| Fichier | Ajout |
|---|---|
| `projection.html` | méthode `P.etat()` dans `window.P` — lecture seule de l'état du cours projeté (étape, corrigé, sommaire, documents) |
| `progression-core.js` | méthode `PSE_PROG.slotsForDate(iso)` — créneaux d'une journée, lecture seule |
| `cours.html`, `capa.html` | `<script src="pse-mobile-bridge.js"></script>` avant `</body>` |
| `pse-mobile-bridge.js` | fichier neuf, copié dans `EDITEUR/` |
| `Editeur-PSE-Electron/package.json` | une entrée dans `build.extraResources` pour que le pont soit embarqué |

`PSE_PROG.setSlot()` existait déjà (ligne 6562) : rien à ajouter de ce côté.

---

## Comment s'en servir

1. Mettre l'application à jour. Le chemin rapide, celui du projet :

   ```bash
   cd "/Users/brahms/Documents/ATELIER COURS PSE/Editeur-PSE-Electron"
   npm run sync:local && npm run open:local
   ```

   L'application doit être **quittée** avant : le script refuse de
   synchroniser sous une application en cours, et il a raison.
2. Ouvrir la Suite PSE. Une **pastille grise « 📱 Télécommande — se connecter »**
   apparaît en bas à gauche de la fenêtre du cours.
3. Cliquer dessus, saisir l'adresse et le mot de passe du compte Firebase.
   **Une seule fois** : la session est ensuite retenue par Firebase et la
   liaison repart seule à chaque ouverture.
4. La pastille passe au vert : « 📱 Télécommande active ». Le téléphone se
   remplit.

Cliquer sur la pastille verte propose de se déconnecter.

Aucune console, aucune ligne à taper.

### Vérifier sans réseau, avant toute connexion

Si vous voulez contrôler ce qui serait publié, la fonction reste disponible
pour un développeur : `PSE_MOBILE.construireInstantane()`. Le résultat ne doit
contenir **aucun nom d'élève**, aucune donnée de santé, aucun aménagement.

## Deux points à connaître

### Les statuts qui ouvrent une fenêtre

`PSE_PROG.setSlot(…, 'statut', …)` route « À terminer », « Reporté » et
« Non réalisé » vers la fenêtre de reprise (`requestSlotStatus`), qui demande où
placer le rattrapage. Envoyés depuis le téléphone, ils feraient surgir une boîte
de dialogue sur l'ordinateur en pleine classe.

Ces trois statuts sont donc **volontairement absents du téléphone**, et le pont
les refuse avec un message clair. Le mémo de reprise couvre le besoin courant
(« arrêté question 4 »). Les trois statuts restent disponibles normalement sur
l'ordinateur.

### Firebase est embarqué, pas téléchargé

Vérifié : l'application charge ses pages avec `loadFile`, donc en `file://`.
Chromium refuse alors d'importer un module depuis Internet — la première
tentative affichait « Télécommande — problème ».

Le SDK est donc **livré avec l'application**, dans
`EDITEUR/vendor/firebase-bundle.js` : un fichier unique et autonome (879 Ko),
construit depuis ce dépôt par `npm run build:vendor`. Le pont l'importe en
chemin relatif, et ne retombe sur le CDN que si le fichier manque — cas d'une
page ouverte depuis un vrai site.

Conséquence pratique : la télécommande fonctionne même sans Internet au moment
du démarrage de l'application (il en faudra évidemment pour joindre Firebase).

Après toute mise à jour de la bibliothèque : `npm run build:vendor`, copier
`electron/vendor/firebase-bundle.js` dans `EDITEUR/vendor/`, puis
`npm run sync:local`.

---

## Revenir en arrière

Restaurer les quatre fichiers depuis leurs sauvegardes
`…SAUVEGARDE_avant_telecommande_mobile_…`, supprimer `pse-mobile-bridge.js`,
puis relancer `npm run dist:local`. Rien d'autre n'a été touché.


---

## Le piège qui coûte une soirée

`build.extraResources` du `package.json` est une **liste blanche explicite**,
fichier par fichier. Un nouveau fichier posé dans `EDITEUR/` n'est pas embarqué
tant qu'il n'y figure pas — et l'échec est **silencieux** : la page charge, la
balise `<script>` pointe dans le vide, rien ne s'affiche, aucune erreur visible.

C'est ce qui s'est passé au premier essai : `cours.html` modifié était bien
copié, mais `pse-mobile-bridge.js` n'existait pas dans l'application.

Vérification après chaque synchronisation :

```bash
ls "dist/mac-arm64/Editeur PSE.app/Contents/Resources/editor/pse-mobile-bridge.js"
```
