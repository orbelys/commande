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
 * SÉCURITÉ : aucun mot de passe n'est écrit ici ni stocké en clair. Il est
 * saisi une seule fois dans le panneau de connexion ; ensuite, c'est la
 * session Firebase (jeton renouvelable) qui prend le relais.
 *
 * UTILISATION : rien à taper. Une pastille apparaît en bas à gauche de la
 * fenêtre ; on clique dessus pour se connecter la première fois.
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

  /* Configuration du projet Firebase « devoirs-pse » — les mêmes valeurs
   * publiques que PSE/psr/firebase_psr.js. Ce ne sont pas des secrets : la
   * sécurité vient des règles Firestore. Le mot de passe, lui, n'est JAMAIS
   * écrit ici : il est saisi à chaque démarrage. */
  var CONFIG_PAR_DEFAUT = {
    apiKey: 'AIzaSyAWdCMvOiAJln3eT9LIAQD3RWJUD0lQcLI',
    authDomain: 'devoirs-pse.firebaseapp.com',
    projectId: 'devoirs-pse',
    storageBucket: 'devoirs-pse.appspot.com',
    messagingSenderId: '614730413904',
    appId: '1:614730413904:web:a5dd478af5de30f6bede55'
  };

  var fs = null;    // module Firestore
  var db = null;
  var uid = null;
  var nomPoste = 'Suite PSE';  /* précisé au démarrage */
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

  /* PSE_PROG.setSlot(…,'statut',…) route ces trois statuts vers la fenêtre de
   * reprise (progression-core.js : requestSlotStatus). Depuis le téléphone,
   * cela ferait surgir une boîte de dialogue sur l'ordinateur de la classe :
   * on refuse, proprement. */
  var STATUTS_A_DIALOGUE = ['À terminer', 'Reporté', 'Non réalisé'];

  var HANDLERS = {
    'projection.ouvrir': function () { P().openProjection(); },
    'projection.etape.suivante': function () { P().next(); },
    'projection.etape.precedente': function () { P().prev(); },
    'projection.etape.aller': function (p) { P().gotoStep(Number(p.etape)); },
    'projection.corrige.basculer': function () { P().toggleReveal(); },
    'projection.focus.basculer': function () { P().toggleFocus(); },
    'projection.document.afficher': function (p) { P().docToggle(Number(p.idx), p.visible !== false); },

    'seance.statut': function (p) {
      var statut = String(p.statut);
      if (STATUTS_A_DIALOGUE.indexOf(statut) >= 0) {
        throw new Error('« ' + statut +' » se choisit sur l\'ordinateur (fenêtre de reprise)');
      }
      ecrireCreneau(p, 'statut', statut);
    },
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

  var sdk = null;   // { auth, authM, fsM }

  async function chargerSdk() {
    if (sdk) return sdk;
    var SDK = 'https://www.gstatic.com/firebasejs/10.12.2/';
    var appM = await import(SDK + 'firebase-app.js');
    var authM = await import(SDK + 'firebase-auth.js');
    var fsM = await import(SDK + 'firebase-firestore.js');
    var app = appM.getApps().length ? appM.getApp() : appM.initializeApp(CONFIG_PAR_DEFAUT);
    fs = fsM;
    db = fsM.getFirestore(app);
    sdk = { auth: authM.getAuth(app), authM: authM, fsM: fsM };
    return sdk;
  }

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

  /* Une fois le compte connecté : publier, écouter les commandes, republier. */
  var enMarche = false;
  async function activer(utilisateur) {
    uid = utilisateur.uid;
    nomPoste = nomPosteAuto();
    pastille('connecte', utilisateur.email || '');
    if (enMarche) { await publier(); return; }
    enMarche = true;

    await publier();

    fs.onSnapshot(
      fs.query(fs.collection(db, COL_COMMANDES, uid, SOUS_FILE), fs.where('statut', '==', 'envoyee')),
      async function (snap) {
        var travail = [];
        snap.forEach(function (d) { travail.push(traiterCommande(d.ref, d.data())); });
        if (!travail.length) return;
        await Promise.all(travail);
        if (window.StorageService && window.StorageService.flush) window.StorageService.flush();
        await publier();
      }
    );

    window.addEventListener('pse-store-sync', publierBientot);
    setInterval(function () { publier().catch(function () {}); }, 5 * 60000);
  }

  /**
   * Démarrage automatique, appelé au chargement de la page.
   * Si une session Firebase existe déjà sur ce poste, la liaison repart seule :
   * le mot de passe n'est demandé qu'une fois, au tout premier lancement.
   */
  async function demarrerAuto() {
    var s;
    try {
      s = await chargerSdk();
    } catch (e) {
      pastille('erreur', String((e && e.message) || e));
      return;
    }
    s.authM.onAuthStateChanged(s.auth, function (u) {
      if (u) activer(u).catch(function (e) { pastille('erreur', String(e && e.message || e)); });
      else { uid = null; pastille('deconnecte', ''); }
    });
  }

  /** Connexion par identifiants (première fois seulement). */
  async function connecter(email, motDePasse) {
    var s = await chargerSdk();
    await s.authM.signInWithEmailAndPassword(s.auth, email, motDePasse);
  }

  async function deconnecter() {
    var s = await chargerSdk();
    await s.authM.signOut(s.auth);
    uid = null;
    pastille('deconnecte', '');
  }

  /* ══ 6. Pastille et panneau de connexion ══════════════════
   * Aucune console : un bouton visible en bas à gauche de la fenêtre. */

  var LIBELLES_ETAT = {
    connecte: '📱 Télécommande active',
    deconnecte: '📱 Télécommande — se connecter',
    erreur: '📱 Télécommande — problème'
  };
  var COULEURS_ETAT = {
    connecte: '#1a7f52',
    deconnecte: '#5c6470',
    erreur: '#b3261e'
  };

  function pastille(etat, detail) {
    var el = document.getElementById('pse-mobile-pastille');
    if (!el) {
      el = document.createElement('button');
      el.id = 'pse-mobile-pastille';
      el.type = 'button';
      el.setAttribute('style',
        'position:fixed;left:14px;bottom:58px;z-index:99998;border:0;border-radius:999px;' +
        'padding:9px 15px;color:#fff;font:600 13px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;' +
        'box-shadow:0 3px 14px rgba(0,0,0,.28);cursor:pointer;opacity:.93');
      el.onclick = function () {
        if (uid) {
          if (confirm('Télécommande connectée' + (el.dataset.detail ? ' (' + el.dataset.detail + ')' : '') +
                      '.\n\nVoulez-vous vous déconnecter ?')) deconnecter();
        } else {
          ouvrirConnexion();
        }
      };
      document.body.appendChild(el);
    }
    el.dataset.detail = detail || '';
    el.textContent = LIBELLES_ETAT[etat] || LIBELLES_ETAT.deconnecte;
    el.style.background = COULEURS_ETAT[etat] || COULEURS_ETAT.deconnecte;
    el.title = detail || '';
  }

  function ouvrirConnexion() {
    if (document.getElementById('pse-mobile-cnx')) return;
    var fond = document.createElement('div');
    fond.id = 'pse-mobile-cnx';
    fond.setAttribute('style',
      'position:fixed;inset:0;z-index:99999;background:rgba(15,23,42,.55);' +
      'display:flex;align-items:center;justify-content:center;' +
      'font:15px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif');
    fond.innerHTML =
      '<form style="background:#fff;color:#14181f;padding:22px;border-radius:14px;' +
      'width:min(400px,92vw);box-shadow:0 10px 40px rgba(0,0,0,.3);display:grid;gap:12px">' +
      '<strong style="font-size:17px">Télécommande sur le téléphone</strong>' +
      '<div style="font-size:13px;color:#5c6470;line-height:1.45">Le même compte que sur le téléphone. ' +
      'À taper une seule fois : la liaison repartira ensuite toute seule.</div>' +
      '<input id="pse-mobile-mail" type="email" placeholder="Adresse e-mail" autocomplete="username" required ' +
      'style="padding:11px;border:1px solid #d7dce3;border-radius:8px;font:inherit">' +
      '<input id="pse-mobile-mdp" type="password" placeholder="Mot de passe" autocomplete="current-password" required ' +
      'style="padding:11px;border:1px solid #d7dce3;border-radius:8px;font:inherit">' +
      '<div id="pse-mobile-msg" style="font-size:13px;color:#b3261e;min-height:18px"></div>' +
      '<div style="display:flex;gap:10px;justify-content:flex-end">' +
      '<button type="button" id="pse-mobile-annuler" style="padding:10px 16px;border:1px solid #d7dce3;' +
      'background:#fff;border-radius:8px;font:inherit;cursor:pointer">Annuler</button>' +
      '<button type="submit" id="pse-mobile-ok" style="padding:10px 18px;border:0;background:#1f5fd6;' +
      'color:#fff;border-radius:8px;font:inherit;font-weight:600;cursor:pointer">Connecter</button>' +
      '</div></form>';
    document.body.appendChild(fond);

    var msg = fond.querySelector('#pse-mobile-msg');
    fond.querySelector('#pse-mobile-annuler').onclick = function () { fond.remove(); };
    fond.querySelector('form').onsubmit = async function (e) {
      e.preventDefault();
      var bouton = fond.querySelector('#pse-mobile-ok');
      bouton.disabled = true;
      msg.style.color = '#5c6470';
      msg.textContent = 'Connexion…';
      try {
        await connecter(fond.querySelector('#pse-mobile-mail').value.trim(),
                        fond.querySelector('#pse-mobile-mdp').value);
        fond.remove();   // la suite se fait toute seule via onAuthStateChanged
      } catch (err) {
        msg.style.color = '#b3261e';
        msg.textContent = messageClair(err);
        bouton.disabled = false;
      }
    };
    setTimeout(function () { var c = fond.querySelector('#pse-mobile-mail'); if (c) c.focus(); }, 50);
  }

  function messageClair(e) {
    var code = (e && e.code) || '';
    if (code === 'auth/invalid-credential' || code === 'auth/wrong-password')
      return 'Adresse ou mot de passe incorrect.';
    if (code === 'auth/user-not-found') return 'Aucun compte pour cette adresse.';
    if (code === 'auth/network-request-failed') return 'Pas de réseau.';
    if (code === 'permission-denied') return 'Refusé par les règles Firestore.';
    return String((e && e.message) || e);
  }

  function nomPosteAuto() {
    return 'Suite PSE — ' + (navigator.platform || 'poste');
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

  /* Le pont s'installe tout seul : pastille visible, reconnexion automatique. */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { pastille('deconnecte', ''); demarrerAuto(); });
  } else {
    pastille('deconnecte', '');
    demarrerAuto();
  }

  window.PSE_MOBILE = {
    ouvrirConnexion: ouvrirConnexion,
    connecter: connecter,
    deconnecter: deconnecter,
    publier: publier,
    construireInstantane: construireInstantane,
    appliquer: appliquer,
    capacites: capacites
  };
})();
