# Greffer le pont dans la Suite PSE

Trois ajouts à faire dans `ATELIER COURS PSE/EDITEUR/`. Aucun n'enlève ni ne
modifie de code existant : ce sont uniquement des ajouts.

> **Avant de toucher à quoi que ce soit** : faites une copie de sauvegarde des
> deux fichiers concernés (`projection.html`, `progression-core.js`), et
> rappelez-vous qu'une modification dans `EDITEUR/` ne change rien dans
> l'application tant que `npm run dist:local` n'a pas été relancé.

---

## Ajout 1 — `projection.html` : publier l'état du cours projeté

Le pont sait déjà **commander** la projection (`P.next()`, `P.prev()`,
`P.toggleReveal()`, `P.docToggle()` existent déjà). Il ne sait pas encore
**lire** où on en est, parce que `step`, `qEls`, `docModel` sont des variables
internes.

Dans l'objet `window.P = {` (vers la ligne 1083), ajoutez cette méthode
— par exemple juste après `next: function(){…},` :

```js
    /* Lu par le téléphone (pse-mobile-bridge.js). Lecture seule. */
    etat:function(){
      var qs=somModel.filter(function(s){ return s.type==='q'; });
      return {
        fenetreOuverte:true,
        coursTitre:coursTitre(),
        classeNom:(window.__projClasseNom||''),
        etape:step,
        corrigeVisible:!!revealed[step],
        corrigeDisponible:!!(qEls[step]&&qEls[step].hasCorr),
        focus:focusOn,
        sommaire:qEls.map(function(q,i){
          return { idx:i,
                   label:(qs[i]&&qs[i].label)||('Question '+(i+1)),
                   corrigeDisponible:!!q.hasCorr };
        }),
        documents:docModel.map(function(d){
          return { idx:d.idx, label:d.label, visible:hiddenDocs[d.idx]!==true };
        })
      };
    },
```

Sans cet ajout, le pont fonctionne quand même, mais en mode dégradé : le
téléphone voit « un cours est projeté » sans connaître l'étape ni les documents.

---

## Ajout 2 — `progression-core.js` : ouvrir la lecture et l'écriture des créneaux

Le module `PSE_PROG` garde `weekSlots()` en interne et n'expose plus `setSlot()`.
Le pont a besoin des deux. Dans l'objet `window.PSE_PROG = {` (vers la ligne
5872), ajoutez :

```js
    /* Créneaux d'une journée, pour le téléphone. Lecture seule. */
    slotsForDate:function(iso){
      var out=[], jour=new Date(iso+'T12:00:00').getDay(), wk=lundiIso(iso);
      classesActives().forEach(function(cl){
        var entry=(plan()[cl.id]||{})[wk]||{};
        weekSlots(cl.id,wk,entry).filter(function(s){ return +s.day===jour; })
          .forEach(function(slot){
            out.push({ cls:cl.id, className:cl.nom, wkey:wk, slot:slot,
                       moduleLabel:libelleModule(slot.module) });
          });
      });
      return out;
    },

    /* Écriture d'un champ de créneau, pour le téléphone. */
    setSlot:function(cls,wkey,slotId,champ,valeur){ /* … voir ci-dessous … */ },
```

⚠️ **À vérifier avant de coller** : les noms `lundiIso`, `classesActives`,
`libelleModule` et la fonction d'écriture d'un créneau sont les noms internes
supposés. Ouvrez `progression-core.js` et remplacez-les par les fonctions qui
existent réellement (une version antérieure du fichier,
`progression-core.AVANT_MARGE_2026-08-10.js`, contient un `PSE_PROG.setSlot`
complet dont on peut reprendre le corps).

Tant que cet ajout n'est pas fait, le pont publie `capacites.progression =
false` et le téléphone affiche « Progression indisponible » au lieu d'envoyer
des commandes qui échoueraient.

---

## Ajout 3 — charger le pont et le démarrer

1. Copier `pse-mobile-bridge.js` dans `EDITEUR/`.
2. Dans `cours.html` **et** `capa.html` (ce sont elles qui ouvrent la fenêtre de
   projection), ajouter avant la fermeture de `</body>` :

   ```html
   <script src="pse-mobile-bridge.js"></script>
   ```

3. Démarrer le pont une fois, avec la configuration Firebase (projet
   **devoirs-pse**, la même que `PSE/psr/firebase_psr.js`) et le compte
   enseignant créé dans Authentication.
   **Les identifiants ne doivent jamais être écrits dans le code** : passez-les
   par `safeStorage` d'Electron (ils sont alors chiffrés par le trousseau du
   Mac), ou demandez-les dans un petit formulaire au premier lancement.

   ```js
   const config = await window.electronAPI.lireConfigMobile();      // à écrire
   const compte = await window.electronAPI.lireIdentifiantsMobile(); // à écrire
   await window.PSE_MOBILE.demarrer(config, compte, { poste: 'MacBook classe' });
   ```

4. Relancer `npm run dist:local` pour que la modification arrive dans
   l'application.

---

## Vérifier sans rien risquer

Avant de démarrer Firebase, on peut contrôler ce que le pont publierait, sans
qu'aucune donnée ne quitte le Mac. Dans la console de la fenêtre `cours.html` :

```js
window.PSE_MOBILE.capacites()            // ce que ce poste sait faire
window.PSE_MOBILE.construireInstantane()  // exactement ce qui partirait
```

Relisez le résultat : il ne doit contenir **aucun nom d'élève**, aucune donnée
de santé, aucun aménagement. Si c'est le cas, le contrat est respecté.
