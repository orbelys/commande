# Commande — interface mobile de la Suite PSE

Télécommande web pour piloter l'application Electron **Suite PSE** depuis un
téléphone : voir la séance en cours, avancer d'une étape, valider, enregistrer,
choisir une classe ou un cours.

> **État actuel : étape 1.** Le site fonctionne entièrement en local avec des
> **données fictives**. Le lien réel avec Electron (Firebase) n'est pas encore
> branché : il est *simulé*, pour pouvoir concevoir et tester l'interface.

---

## 1. Lancer le site en local

Une seule fois, pour installer les dépendances :

```bash
cd /Users/brahms/Documents/commande && npm install
```

Puis, à chaque fois que vous voulez travailler :

```bash
cd /Users/brahms/Documents/commande && npm run dev
```

Le navigateur s'ouvre sur **http://localhost:5173**. Toute modification d'un
fichier est visible immédiatement, sans rechargement manuel.

Pour arrêter le serveur : `Ctrl + C` dans le Terminal.

### Tester sur votre iPhone (même réseau Wi-Fi)

```bash
cd /Users/brahms/Documents/commande && npm run dev:lan
```

Vite affiche alors une adresse « Network » du type `http://192.168.x.x:5173`.
Ouvrez-la dans Safari sur le téléphone.

### Autres commandes

| Commande | Effet |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run dev:lan` | Idem, accessible depuis le téléphone |
| `npm run build` | Version optimisée dans `dist/` (pour la mise en ligne, plus tard) |
| `npm run preview` | Vérifier la version optimisée en local |
| `npm run typecheck` | Contrôler le code sans rien construire |

---

## 2. Technologie retenue

| Choix | Raison |
|---|---|
| **Vite** | Démarrage instantané, rechargement à chaud, build optimisé. |
| **React** | Interface découpée en composants réutilisables : pas de fichier HTML géant. |
| **TypeScript** | Le format des commandes envoyées à Electron est typé et vérifié. |
| **React Router** | Vraies adresses (`/cours`, `/classes`…), navigation naturelle sur mobile. |
| **CSS Modules + variables CSS** | Styles isolés par composant, thème clair/sombre centralisé, aucune bibliothèque lourde. |

---

## 3. Structure du projet

```
commande/
├── index.html                  Page hôte (une seule, l'app est une SPA)
├── package.json                Dépendances et commandes npm
├── vite.config.ts              Configuration du serveur et du build
├── .env.example                Modèle de configuration (à copier en .env.local)
├── public/icon.svg             Icône
└── src/
    ├── main.tsx                Point d'entrée
    ├── App.tsx                 Table des routes
    ├── styles/
    │   ├── tokens.css          Couleurs, espaces, rayons, thème sombre
    │   └── global.css          Remise à zéro et styles de base
    ├── components/
    │   ├── layout/             Coque : barre haute, indicateur d'état, nav basse
    │   └── ui/                 Briques réutilisables : Button, Card, Badge, ListRow…
    ├── features/               Une page = un dossier
    │   ├── dashboard/          Tableau de bord (accueil)
    │   ├── cours/              Télécommande de la séance + bibliothèque
    │   ├── classes/            Choix de la classe active
    │   ├── commandes/          Journal des commandes envoyées
    │   ├── progression/        Suivi de la progression
    │   ├── documents/          Ouverture d'un document dans Electron
    │   └── sync/               État du lien avec Electron
    ├── services/bridge/        ★ Pont avec Electron (voir §4)
    ├── hooks/                  useBridge, useSeance
    ├── lib/format.ts           Affichage des dates et durées en français
    └── data/demo.ts            Données FICTIVES de démonstration
```

### Ajouter une page

1. Créer `src/features/ma-page/MaPage.tsx` ;
2. ajouter une ligne dans `src/App.tsx` ;
3. (facultatif) ajouter une tuile dans le tableau de bord ou un onglet dans
   `src/components/layout/BottomNav.tsx`.

---

## 4. Le pont avec Electron (`src/services/bridge/`)

C'est la pièce importante de l'architecture. **Aucune page ne parle directement
à Firebase ou à Electron** : toutes passent par une interface unique.

```
Page  →  useBridge()  →  Transport  →  (aujourd'hui) MockTransport
                                    →  (demain)      FirebaseTransport
```

| Fichier | Rôle |
|---|---|
| `types.ts` | **Le contrat** : forme de l'instantané publié par Electron et liste des commandes possibles. C'est ce fichier qu'il faudra reproduire côté Electron. |
| `commands.ts` | Fabrique une commande complète (identifiant unique, horodatage, libellé). |
| `BridgeContext.ts` | Le contexte React (séparé du composant, pour un rechargement à chaud propre). |
| `BridgeProvider.tsx` | Garde l'état (connexion, instantané, historique des commandes) et le distribue à toute l'application. |
| `MockTransport.ts` | **Simulation** : joue le rôle d'Electron sans réseau. Applique les commandes sur un instantané local et le republie. |
| `FirebaseTransport.ts` | Emplacement réservé, avec le mode d'emploi en commentaire. Rien à écrire ailleurs le jour venu. |
| `createTransport.ts` | Le seul endroit où l'on choisit l'implémentation. |

### Modèle d'échange prévu

```
Electron  ──publie──▶  instantané (état courant)   ──▶  téléphone
téléphone ──envoie──▶  commande (id unique)        ──▶  Electron
Electron  ──accuse──▶  commande.statut = appliquée + nouvel instantané
```

Electron reste la **source de vérité**. Le téléphone ne modifie jamais les
données directement : il envoie des commandes idempotentes (rejouables sans
risque grâce à leur identifiant unique).

### Commandes déjà définies

`classe.selectionner`, `cours.selectionner`, `seance.demarrer`,
`seance.etape.suivante`, `seance.etape.precedente`, `seance.pause.basculer`,
`seance.corrige.basculer`, `seance.valider`, `seance.enregistrer`,
`progression.marquer`, `document.ouvrir`.

---

## 5. Quand viendra Firebase (pas maintenant)

1. `npm install firebase`
2. `cp .env.example .env.local` puis renseigner les valeurs
   (`.env.local` est ignoré par Git).
3. Écrire le corps des méthodes de `FirebaseTransport.ts` (le mode d'emploi est
   dans le fichier).
4. Passer `VITE_TRANSPORT=firebase` dans `.env.local`.

**Aucune page n'aura à être modifiée.**

---

## 6. Sécurité

- Aucun mot de passe, clé privée, jeton GitHub ou identifiant dans le code.
- Aucune donnée d'élève réelle : `src/data/demo.ts` ne contient que des groupes
  fictifs (« Groupe A », « Groupe B »…).
- Les futurs secrets passeront par `.env.local`, ignoré par Git
  (voir `.gitignore`).

---

## 7. Mise en ligne (étape ultérieure)

Rien n'est configuré pour GitHub pour l'instant. Le moment venu, le dépôt
`Orbelys/commande` sera relié via GitHub Desktop, et `vite.config.ts` prévoit
déjà une variable `VITE_BASE` pour servir le site depuis un sous-dossier.

Deux points à traiter à ce moment-là (pas avant) :

- **Sous-dossier** : sur GitHub Pages l'adresse sera `…/commande/`, donc il
  faudra construire avec `VITE_BASE=/commande/ npm run build`.
- **Adresses directes** : un hébergement statique renvoie une erreur 404 si l'on
  ouvre directement `/cours`. La parade habituelle est de copier `index.html`
  en `404.html` dans `dist/`. En local, le serveur de développement gère déjà
  ce cas.
