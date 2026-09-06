# Commande — interface mobile de la Suite PSE

Télécommande web pour piloter l'application Electron **Suite PSE** depuis un
téléphone : voir la journée, piloter le cours projeté en classe, mettre à jour
la progression, cocher les actions à faire.

> **État actuel.** Le site fonctionne de bout en bout en local avec des
> **données fictives** (transport « simulation »). Le transport Firebase est
> écrit et prêt ; la configuration du projet existant `devoirs-pse` est déjà en
> place dans `.env.local`. Il reste à activer l'authentification et à compléter
> les règles Firestore (§5). Le module à greffer dans la Suite PSE est fourni
> dans `electron/`, avec sa notice.

---

## 1. Lancer le site en local

Une seule fois, pour installer les dépendances :

```bash
npm install
```

Puis, à chaque session de travail :

```bash
cd /Users/brahms/Documents/GitHub/commande && npm run dev
```

Le navigateur s'ouvre sur **http://localhost:5173**. Toute modification d'un
fichier est visible immédiatement. Pour arrêter : `Ctrl + C`.

### Tester sur l'iPhone (même réseau Wi-Fi)

```bash
cd /Users/brahms/Documents/GitHub/commande && npm run dev:lan
```

Vite affiche une adresse « Network » du type `http://192.168.x.x:5173` :
ouvrez-la dans Safari sur le téléphone.

### Autres commandes

| Commande | Effet |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run dev:lan` | Idem, accessible depuis le téléphone |
| `npm run build` | Version optimisée dans `dist/` |
| `npm run preview` | Vérifier la version optimisée |
| `npm run typecheck` | Contrôler le code sans rien construire |

---

## 2. Technologie retenue

| Choix | Raison |
|---|---|
| **Vite** | Démarrage instantané, rechargement à chaud, build optimisé. |
| **React** | Interface découpée en composants : pas de fichier HTML géant. |
| **TypeScript** | Le contrat échangé avec Electron est typé et vérifié. |
| **React Router** | Vraies adresses (`/projection`, `/progression`…). |
| **CSS Modules + variables CSS** | Styles isolés, thème clair/sombre centralisé, aucune bibliothèque lourde. |
| **Firebase (chargé à la demande)** | Le SDK n'est téléchargé par le navigateur que si le transport réel est actif. |

---

## 3. Structure

```
commande/
├── index.html                  Page hôte (application à page unique)
├── firestore.rules.a-inserer   Règles à INSÉRER dans celles de devoirs-pse
├── .env.example                Modèle de configuration → .env.local
├── electron/
│   ├── pse-mobile-bridge.js    Module à charger dans la Suite PSE
│   └── PATCH-suite-pse.md      Les trois ajouts à faire côté Suite PSE
└── src/
    ├── App.tsx                 Table des routes
    ├── styles/                 tokens.css (couleurs, espaces) + global.css
    ├── components/
    │   ├── layout/             Coque : barre haute, indicateur, nav basse
    │   └── ui/                 Button, Card, Badge, ListRow, EmptyState…
    ├── features/               Une page = un dossier
    │   ├── dashboard/          Tableau de bord : cours projeté, journée, à faire
    │   ├── projection/         Télécommande du cours projeté
    │   ├── progression/        Séances : statut, remise, mémo de reprise
    │   ├── documents/          Afficher / masquer les documents projetés
    │   ├── classes/            Classes et séances à venir
    │   ├── commandes/          Journal des commandes envoyées
    │   └── sync/               État du lien, connexion, capacités du poste
    ├── services/bridge/        ★ Le pont (voir §4)
    ├── hooks/                  useBridge, useProjection
    ├── lib/format.ts           Dates et durées en français
    └── data/demo.ts            Données FICTIVES de démonstration
```

Ajouter une page : créer `src/features/ma-page/MaPage.tsx`, ajouter une ligne
dans `src/App.tsx`, et si besoin une tuile ou un onglet dans `BottomNav.tsx`.

---

## 4. Le pont (`src/services/bridge/`)

Aucune page ne parle directement à Firebase : toutes passent par une interface
unique. Changer de transport ne change aucune page.

```
Page → useBridge() → Transport → MockTransport      (simulation)
                              → FirebaseTransport   (réel)
```

| Fichier | Rôle |
|---|---|
| `types.ts` | **Le contrat.** Forme de l'instantané publié par la Suite PSE et liste des commandes. À respecter des deux côtés. |
| `commands.ts` | Fabrique une commande (identifiant unique, horodatage, libellé). |
| `BridgeContext.ts` / `BridgeProvider.tsx` | État partagé : connexion, compte, instantané, historique. |
| `MockTransport.ts` | Simulation : applique les commandes sur un instantané local. |
| `FirebaseTransport.ts` | Réel : Authentication + Firestore, en temps réel. |
| `firebaseConfig.ts` | Lecture de la configuration et emplacements des données. |
| `createTransport.ts` | Le seul endroit où l'implémentation est choisie. |

### Modèle d'échange

```
Suite PSE ──publie──▶ postes/{uid}                  (instantané)
téléphone ──écrit───▶ commandes/{uid}/file/{cmdId}  (commande)
Suite PSE ──répond──▶ la même commande, statut = appliquée, puis republie
```

La Suite PSE reste la **source de vérité**. Le téléphone ne modifie jamais les
données directement : il envoie des commandes portant un identifiant unique,
que la Suite PSE mémorise — recevoir deux fois la même commande ne la joue
qu'une fois.

### Ce que le poste sait faire

Chaque instantané publie un bloc `capacites` (projection, progression, agenda,
actions). Le téléphone désactive tout seul les boutons dont la fonction n'est
pas disponible sur le poste, au lieu d'envoyer des commandes qui échoueraient.
L'onglet *Synchronisation* affiche cet état.

### Commandes définies

`projection.ouvrir`, `projection.etape.suivante`, `projection.etape.precedente`,
`projection.etape.aller`, `projection.corrige.basculer`,
`projection.focus.basculer`, `projection.document.afficher`,
`seance.statut`, `seance.remise`, `seance.memo`,
`action.creer`, `action.terminer`, `note.rapide`.

---

## 5. Activer Firebase

**Le projet existe déjà : `devoirs-pse`.** C'est celui qui fait tourner
mapse.fr (résultats d'élèves, quiz en direct, exercices…). Sa configuration est
déjà renseignée dans `.env.local` — inutile de créer quoi que ce soit.

Il manque deux choses, et elles touchent un projet **en service** : à faire à
froid, pas un jour de cours.

### a. Activer l'authentification par e-mail

Aujourd'hui, aucune page de mapse.fr n'utilise l'authentification Firebase :
les élèves sont identifiés par un `userCode`. La télécommande, elle, a besoin
d'un vrai compte — elle lit la progression et pilote la classe.

1. Console Firebase → projet `devoirs-pse` → **Authentication** → *Sign-in
   method* → activer **E-mail / mot de passe**.
2. Onglet *Users* → **Add user** → créer votre compte enseignant.

Cet ajout est sans effet sur l'existant : les pages élèves continuent d'écrire
sans authentification, exactement comme avant.

### b. Ajouter les règles des deux nouvelles collections

⚠️ **Ne remplacez pas vos règles actuelles.** Le fichier
`firestore.rules.a-inserer` contient un bloc à **insérer** dans les règles
existantes, et un point de vigilance à lire : si vos règles comportent un
fourre-tout ouvert (`match /{document=**} { allow read, write: if true; }`),
la télécommande resterait accessible à n'importe qui — le fichier explique
comment fermer cela sans casser mapse.fr.

### c. Basculer le site

Dans `.env.local`, remplacer `VITE_TRANSPORT=mock` par
`VITE_TRANSPORT=firebase`, puis relancer `npm run dev`. L'onglet
*Synchronisation* affiche alors un formulaire de connexion.

Les nouvelles collections (`postes`, `commandes`) n'entrent en collision avec
aucune de celles déjà utilisées par mapse.fr.

## 6. Côté Suite PSE

Le dossier `electron/` contient le module qui publie l'instantané et applique
les commandes, ainsi que la notice d'installation :

- `pse-mobile-bridge.js` — à copier dans `EDITEUR/`, à charger depuis
  `cours.html` et `capa.html` (ce sont elles qui ouvrent la fenêtre de
  projection).
- `PATCH-suite-pse.md` — les trois ajouts à faire, dont deux petits ajouts de
  méthodes (`P.etat()` dans `projection.html`, `slotsForDate` et `setSlot` dans
  `progression-core.js`).

Le module se contrôle **sans réseau** avant tout branchement, depuis la console
de la fenêtre `cours.html` :

```js
window.PSE_MOBILE.capacites()
window.PSE_MOBILE.construireInstantane()
```

Rappel : une modification dans `EDITEUR/` n'arrive dans l'application qu'après
`npm run dist:local`.

---

## 7. Confidentialité et sécurité

- Aucun mot de passe, clé privée, jeton ou identifiant dans le code.
- **Aucun nom d'élève ne circule.** L'instantané ne contient que des intitulés
  de cours, de classes, de créneaux et d'actions — pas de MOPPS, pas de donnée
  de santé, pas d'aménagement, pas d'adresse. Cette règle est écrite en tête du
  module Electron : ne pas ajouter de champ nominatif sans la revoir.
- `src/data/demo.ts` ne contient que des groupes fictifs (« Groupe A »…).
- Les identifiants Firebase de la Suite PSE doivent passer par `safeStorage`
  d'Electron, jamais par un fichier en clair.

---

## 8. Mise en ligne (étape ultérieure)

Le dépôt privé est `orbelys/commande`. Deux points à traiter le moment venu :

- **Sous-dossier** : sur GitHub Pages l'adresse sera `…/commande/`, donc
  construire avec `VITE_BASE=/commande/ npm run build`.
- **Adresses directes** : un hébergement statique renvoie une erreur 404 si l'on
  ouvre directement `/progression`. La parade habituelle est de copier
  `index.html` en `404.html` dans `dist/`. En local, le serveur de développement
  gère déjà ce cas.
