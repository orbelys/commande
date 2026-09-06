/* ─────────────────────────────────────────────────────────────
 * pse-mobile-bridge.js — CÔTÉ SUITE PSE (Electron)
 *
 * Fait le pont entre la Suite PSE et le téléphone (dépôt orbelys/commande) :
 *   1. publie un instantané de l'état courant dans Firestore ;
 *   2. lit les commandes envoyées par le téléphone et les applique ;
 *   3. republie après chaque changement.
 *
 * À charger dans la fenêtre qui ouvre la projection (cours.html / capa.html),
 * car c'est elle qui détient la référence de la fenêtre « presenter ».
 *
 * CONTRAT : identique à src/services/bridge/types.ts du site mobile.
 * Toute modification doit être faite des deux côtés.
 *
 * CONFIDENTIALITÉ : cet instantané ne contient AUCUN nom d'élève, aucune
 * donnée de santé, aucun aménagement, aucune adresse. Uniquement des
 * intitulés de cours, de classes et de créneaux. Ne pas ajouter de champ
 * nominatif sans revoir cette règle.
 *
 * SÉCURITÉ : aucune clé n'est écrite ici. La configuration Firebase et les
 * identifiants sont passés en argument de PSE_MOBILE.demarrer(), depuis un
 * stockage sûr (safeStorage d'Electron).
 * ───────────────────────────────────────────────────────────── */
/* global window, document */
(function () {
  'use strict';

  var VERSION_CONTRAT = 2;
  var COL_POSTES = 'postes';
  var COL_COMMANDES = 'commandes';
  var SOUS_FILE = 'file';
  var CLE_APPLIQUEES = 'pse-mobile-commandes-appliquees-v1';
  var NOM_FENETRE_PRESENTER = 'projection_presenter';
  var DEBOUNCE_PUBLICATION = 1200;

  var fs = null;    // module Firestore
  var db = null;
  var uid = null;
  var nomPoste = 'Suite PSE';
  var timerPub = null;

  /* ══ 1. Accès à la fenêtre de projection ══════════════════
   * window.open('', nom) rend la fenêtre déjà ouverte sans y naviguer.
   * Les deux fenêtres sont de même origine : on peut appeler son API
   * window.P directement, sans postMessage. */
  function presenter() {
    try {
      var w = window.open('', NOM_FENETRE_PRESENTER);
      if (!w || w.closed || !w.P) return null;
      return w;
    } catch (e) {
      return null;
    }
  }

  /* ══ 2. Capacités réellement disponibles ══════════════════
   * Publiées dans l'instantané : le téléphone grise les boutons dont la
   * fonction n'existe pas sur ce poste, au lieu d'envoyer dans le vide. */
  function capacites() {
    return {
      projection: !!presenter(),
      progression: !!(window.PSE_PROG &&
        typeof window.PSE_PROG.slotsForDate === 'function' &&
        typeof window.PSE_PROG.setSlot === 'function'),
      agenda: !!(window.PSE_AGENDA && typeof window.PSE_AGENDA.journee === 'function'),
      actions: !!(window.PSE_REUNIONS && typeof window.PSE_REUNIONS.data === 'function')
    };
  }

  /* ══ 3. Construction de l'instantané ══════════════════════ */

  function etatProjection() {
    var w = presenter();
    if (!w) return null;

    // Chemin normal : projection.html expose P.etat() (voir PATCH-projection.md).
    if (typeof w.P.etat === 'function') {
      var e = safe(function () { return w.P.etat(); });
      if (e) return normaliserProjection(e);
    }

    // Chemin dégradé : la fenêtre est ouverte mais n'expose pas encore son
    // état. On publie le minimum pour que le téléphone reste utilisable.
    return {
      fenetreOuverte: true,
      coursTitre: safe(function () { return w.coursTitre(); }) || 'Cours projeté',
      classeNom: '',
      etape: -1,
      nbEtapes: 0,
      corrigeVisible: false,
      corrigeDisponible: false,
      focus: false,
      sommaire: [],
      documents: []
    };
  }

  function normaliserProjection(e) {
    return {
      fenetreOuverte: e.fenetreOuverte !== false,
      coursTitre: String(e.coursTitre || 'Cours projeté'),
      classeNom: String(e.classeNom || ''),
      etape: typeof e.etape === 'number' ? e.etape : -1,
      nbEtapes: (e.sommaire || []).length,
      corrigeVisible: !!e.corrigeVisible,
      corrigeDisponible: !!e.corrigeDisponible,
      focus: !!e.focus,
      sommaire: (e.sommaire || []).map(function (s, i) {
        return {
          idx: typeof s.idx === 'number' ? s.idx : i,
          label: String(s.label || ('Étape ' + (i + 1))),
          corrigeDisponible: !!s.corrigeDisponible
        };
      }),
      documents: (e.documents || []).map(function (d, i) {
        return {
          idx: typeof d.idx === 'number' ? d.idx : i,
          label: String(d.label || ('Document ' + (i + 1))),
          visible: d.visible !== false
        };
      })
    };
  }

  function journee(iso) {
    if (!window.PSE_AGENDA || typeof window.PSE_AGENDA.journee !== 'function') return [];
    var j = safe(function () { return window.PSE_AGENDA.journee(iso); }) || {};
    var lignes = (j.horaires || []).concat(j.sansHeure || []);
    return lignes.map(function (e) {
      return {
        id: 'ev:' + e.id,
        type: e.genre === 'cours' ? 'cours' : 'evenement',
        debut: e.heure || '',
        fin: e.heureFin || '',
        titre: String(e.titre || ''),
        lieu: String(e.lieu || ''),
        classeNom: String(e.classe || ''),
        statut: String(e.etatSeance || '')
      };
    });
  }

  /* Séances de progression sur une fenêtre de jours autour d'aujourd'hui.
   * Demande PSE_PROG.slotsForDate(iso) — voir PATCH-progression.md. */
  function seances(iso, avant, apres) {
    if (!capacites().progression) return [];
    var out = [];
    for (var d = -avant; d <= apres; d++) {
      var jour = decalerIso(iso, d);
      var lot = safe(function () { return window.PSE_PROG.slotsForDate(jour); }) || [];
      lot.forEach(function (x) {
        var s = x.slot || {};
        var slotId = [s.day, s.start, s.end || ''].join('|');
        out.push({
          id: [x.cls, x.wkey, slotId].join('|'),
          classeId: String(x.cls || ''),
          classeNom: String(x.className || x.cls || ''),
          wkey: String(x.wkey || ''),
          slotId: slotId,
          date: jour,
          debut: s.start || '',
          fin: s.end || '',
          salle: s.salle || '',
          module: s.module || '',
          moduleLabel: x.moduleLabel || '',
          seance: s.seance || '',
          phase: s.phase || '',
          objectif: s.objectif || '',
          statut: s.statut || 'Prévu',
          remise: s.remise || '',
          memo: s.memo || ''
        });
      });
    }
    return out;
  }

  /* Classes : intitulés et effectifs uniquement, jamais la liste des élèves. */
  function classes() {
    var brut =
      safe(function () { return window.PSE_CL && window.PSE_CL.all && window.PSE_CL.all(); }) ||
      safe(function () { return JSON.parse(window.StorageService.get('pse-classes-v1') || '[]'); }) ||
      [];
    if (!Array.isArray(brut)) return [];
    return brut.map(function (c) {
      return {
        id: String(c.id || ''),
        nom: String(c.nom || c.id || ''),
        diplome: String(c.diplome || ''),
        effectif: Array.isArray(c.eleves) ? c.eleves.length : 0
      };
    });
  }

  function actions(iso) {
    if (!capacites().actions) return [];
    var brut = safe(function () { return (window.PSE_REUNIONS.data() || {}).actions; }) || [];
    return brut
      .filter(function (a) {
        if (a.supprimeLe) return false;
        // On ne remonte pas les actions faites il y a plus de trois jours.
        if (a.statut === 'fait' && a.majLe && Date.now() - Date.parse(a.majLe) > 3 * 86400000) return false;
        return true;
      })
      .map(function (a) {
        return {
          id: String(a.id),
          texte: String(a.texte || ''),
          echeance: a.echeance || null,
          statut: a.statut === 'fait' ? 'fait' : 'a_faire',
          retard: a.statut !== 'fait' && !!a.echeance && a.echeance < iso
        };
      });
  }

  function construireInstantane(dateIso) {
    var iso = dateIso || isoAujourdhui();
    return {
      version: VERSION_CONTRAT,
      majA: new Date().toISOString(),
      poste: nomPoste,
      date: iso,
      capacites: capacites(),
      projection: etatProjection(),
      journee: journee(iso),
      seances: seances(iso, 1, 6),
      classes: classes(),
      actions: actions(iso)
    };
  }

  /* ══ 4. Application des commandes ═════════════════════════ */

  function P() {
    var w = presenter();
    if (!w) throw new Error('Aucune fenêtre de projection ouverte');
    return w.P;
  }

  function creneau(payload) {
    var morceaux = String(payload.seanceId || '').split('|');
    if (morceaux.length < 3) throw new Error('Identifiant de séance invalide');
    return { cls: morceaux[0], wkey: morceaux[1], slotId: morceaux.slice(2).join('|') };
  }

  function ecrireCreneau(payload, champ, valeur) {
    if (!capacites().progression) throw new Error('Progression non disponible sur ce poste');
    var c = creneau(payload);
    window.PSE_PROG.setSlot(c.cls, c.wkey, c.slotId, champ, valeur, false);
  }

  var HANDLERS = {
    'projection.ouvrir': function () { P().openProjection(); },
    'projection.etape.suivante': function () { P().next(); },
    'projection.etape.precedente': function () { P().prev(); },
    'projection.etape.aller': function (p) { P().gotoStep(Number(p.etape)); },
    'projection.corrige.basculer': function () { P().toggleReveal(); },
    'projection.focus.basculer': function () { P().toggleFocus(); },
    'projection.document.afficher': function (p) { P().docToggle(Number(p.idx), p.visible !== false); },

    'seance.statut': function (p) { ecrireCreneau(p, 'statut', String(p.statut)); },
    'seance.remise': function (p) { ecrireCreneau(p, 'remise', String(p.remise)); },
    'seance.memo': function (p) { ecrireCreneau(p, 'memo', String(p.memo || '')); },

    'action.terminer': function (p) {
      var d = window.PSE_REUNIONS.data();
      var a = (d.actions || []).filter(function (x) { return x.id === p.actionId; })[0];
      if (!a) throw new Error('Action introuvable');
      a.statut = p.fait === false ? 'a_faire' : 'fait';
      a.majLe = new Date().toISOString();
      window.PSE_REUNIONS.sauver();
    },
    'action.creer': function (p) {
      window.PSE_REUNIONS.creerAction({
        texte: String(p.texte || ''),
        echeance: p.echeance || null,
        source: 'telephone'
      });
    },
    'note.rapide': function (p) {
      var r = window.PSE_REUNIONS.noteFlash();
      r.html = '<p>' + echapper(String(p.texte || '')) + '</p>';
      r.tags = (r.tags || []).concat(['telephone']);
      r.majLe = new Date().toISOString();
      window.PSE_REUNIONS.sauver();
    }
  };

  function appliquer(commande) {
    var h = HANDLERS[commande.type];
    if (!h) return { ok: false, erreur: 'Commande inconnue : ' + commande.type };
    try {
      h(commande.payload || {});
      return { ok: true };
    } catch (e) {
      return { ok: false, erreur: String((e && e.message) || e) };
    }
  }

  /* Idempotence : on mémorise les identifiants déjà appliqués, donc recevoir
   * deux fois la même commande ne la joue qu'une fois. */
  function dejaAppliquees() {
    return safe(function () {
      return JSON.parse(window.StorageService.get(CLE_APPLIQUEES) || '[]');
    }) || [];
  }
  function memoriser(id) {
    var liste = dejaAppliquees();
    if (liste.indexOf(id) >= 0) return;
    liste.push(id);
    if (liste.length > 400) liste = liste.slice(-400);
    window.StorageService.set(CLE_APPLIQUEES, JSON.stringify(liste));
  }

  /* ══ 5. Firebase ══════════════════════════════════════════ */

  async function traiterCommande(ref, commande) {
    var vues = dejaAppliquees();
    var res = vues.indexOf(commande.id) >= 0 ? { ok: true } : appliquer(commande);
    if (res.ok) memoriser(commande.id);
    await fs.updateDoc(ref, {
      statut: res.ok ? 'appliquee' : 'echouee',
      erreur: res.ok ? null : res.erreur,
      appliqueeA: new Date().toISOString()
    });
  }

  async function publier() {
    if (!uid) return;
    await fs.setDoc(fs.doc(db, COL_POSTES, uid), construireInstantane());
  }

  function publierBientot() {
    clearTimeout(timerPub);
    timerPub = setTimeout(function () { publier().catch(function () {}); }, DEBOUNCE_PUBLICATION);
  }

  /**
   * Démarre le pont.
   * @param {object} config       configuration Firebase (apiKey, authDomain, projectId, appId)
   * @param {object} identifiants { email, motDePasse } — jamais écrits dans le code
   * @param {object} options      { poste: 'Nom du poste' }
   */
  async function demarrer(config, identifiants, options) {
    var SDK = 'https://www.gstatic.com/firebasejs/10.12.2/';
    var appM = await import(SDK + 'firebase-app.js');
    var authM = await import(SDK + 'firebase-auth.js');
    var fsM = await import(SDK + 'firebase-firestore.js');
    fs = fsM;

    nomPoste = (options && options.poste) || nomPoste;
    var app = appM.getApps().length ? appM.getApp() : appM.initializeApp(config);
    var auth = authM.getAuth(app);
    db = fsM.getFirestore(app);

    var cred = await authM.signInWithEmailAndPassword(auth, identifiants.email, identifiants.motDePasse);
    uid = cred.user.uid;

    // a) publication initiale
    await publier();

    // b) commandes en temps réel
    fsM.onSnapshot(
      fsM.query(
        fsM.collection(db, COL_COMMANDES, uid, SOUS_FILE),
        fsM.where('statut', '==', 'envoyee')
      ),
      async function (snap) {
        var travail = [];
        snap.forEach(function (d) { travail.push(traiterCommande(d.ref, d.data())); });
        if (!travail.length) return;
        await Promise.all(travail);
        if (window.StorageService && window.StorageService.flush) window.StorageService.flush();
        await publier();
      }
    );

    // c) toute écriture locale dans la Suite PSE ⇒ republier
    window.addEventListener('pse-store-sync', publierBientot);

    // d) filet de sécurité : republication régulière (changement de jour,
    //    ouverture ou fermeture de la fenêtre de projection…)
    setInterval(function () { publier().catch(function () {}); }, 5 * 60000);

    return { uid: uid, capacites: capacites() };
  }

  /* ══ utilitaires ══════════════════════════════════════════ */
  function safe(fn) { try { return fn(); } catch (e) { return null; } }
  function echapper(t) {
    return String(t || '').replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function isoAujourdhui() {
    var d = new Date(), p = function (n) { return String(n).padStart(2, '0'); };
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
  }
  function decalerIso(iso, n) {
    var d = new Date(iso + 'T12:00:00');
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
  }

  window.PSE_MOBILE = {
    demarrer: demarrer,
    publier: publier,
    construireInstantane: construireInstantane,
    appliquer: appliquer,
    capacites: capacites
  };
})();
