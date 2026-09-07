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

  var VERSION_CONTRAT = 3;
  var COL_POSTES = 'postes';
  var COL_COMMANDES = 'commandes';
  var SOUS_FILE = 'file';
  var CLE_APPLIQUEES = 'pse-mobile-commandes-appliquees-v1';
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

  /* ══ 1. Lien avec la fenêtre de projection ═══════════════
   *
   * Electron ouvre la projection dans une fenêtre séparée, dans un autre
   * processus : impossible d'appeler son window.P directement, même en
   * étant de même origine. On dialogue donc par messages, comme le fait
   * déjà le reste de l'application.
   *
   * La fenêtre de projection publie son état toutes les 2 secondes ; on
   * garde le dernier reçu, ainsi que sa provenance pour lui répondre.
   * Passé 8 secondes sans nouvelle, on la considère fermée.
   *
   * NE JAMAIS utiliser window.open('', nom) pour la retrouver : quand elle
   * n'existe pas, cet appel en CRÉE une, vide.
   */
  var PERIME_MS = 8000;
  var etatProjete = null;
  var etatRecuA = 0;
  var cibleProjection = null;

  window.addEventListener('message', function (e) {
    var m = e.data || {};
    if (m.type !== 'mobile-etat') return;
    etatProjete = m.etat || null;
    etatRecuA = Date.now();
    cibleProjection = e.source || cibleProjection;
    publierBientot();
  });

  function projectionVivante() {
    return !!etatProjete && (Date.now() - etatRecuA) < PERIME_MS;
  }

  function envoyerProjection(message) {
    if (!projectionVivante() || !cibleProjection) {
      throw new Error('Aucune projection en cours');
    }
    cibleProjection.postMessage(Object.assign({ type: 'mobile-cmd' }, message), '*');
  }

  /* ══ 2. Capacités réellement disponibles ══════════════════
   * Publiées dans l'instantané : le téléphone grise les boutons dont la
   * fonction n'existe pas sur ce poste, au lieu d'envoyer dans le vide. */
  function capacites() {
    return {
      projection: projectionVivante(),
      progression: !!(window.PSE_PROG &&
        typeof window.PSE_PROG.slotsForDate === 'function' &&
        typeof window.PSE_PROG.setSlot === 'function'),
      agenda: coursDuJour(isoAujourdhui()).length > 0 ||
        !!(window.PSE_AGENDA && typeof window.PSE_AGENDA.journee === 'function'),
      actions: !!(window.PSE_REUNIONS && typeof window.PSE_REUNIONS.data === 'function')
    };
  }

  /* ══ 3. Construction de l'instantané ══════════════════════ */

  function etatProjection() {
    if (!projectionVivante()) return null;
    return normaliserProjection(etatProjete);
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
      minuteur: e.minuteur ? {
        actif: !!e.minuteur.actif,
        enPause: !!e.minuteur.enPause,
        restant: Number(e.minuteur.restant) || 0
      } : { actif: false, enPause: false, restant: 0 },
      documents: (e.documents || []).map(function (d, i) {
        return {
          idx: typeof d.idx === 'number' ? d.idx : i,
          label: String(d.label || ('Document ' + (i + 1))),
          visible: d.visible !== false
        };
      })
    };
  }

  /* PSE_AGENDA.journee(iso) rend
       { jour, aFaire, horaires, journee: <sans horaire>, total }
     Les événements sans horaire sont bien sous la clé « journee », pas
     « sansHeure ». Et la classe est dans « classes » (tableau), pas « classe ».
     L'emploi du temps vient de l'import ICS Pronote (pse-personal-edt-v1) :
     il est aussi à jour que le dernier import, pas en direct. */
  var ETATS_LISIBLES = { tenu: 'Réalisé', annule: 'Annulé', reporte: 'Reporté' };

  function nomClasses(e) {
    var c = e && e.classes;
    if (Array.isArray(c)) {
      return c.map(function (x) {
        return typeof x === 'string' ? x : String((x && (x.nom || x.id)) || '');
      }).filter(Boolean).join(', ');
    }
    return String((e && e.classe) || '');
  }

  /* ── Emploi du temps personnel ────────────────────────────
   * La Suite PSE conserve l'export ICS de Pronote dans la clé
   * pse-personal-edt-v1 (cache.raw). On le lit ici directement : le module
   * PSE_ICS auquel agenda-import-shared.js fait appel n'existe pas dans le
   * projet, donc cette branche échouait en silence.
   *
   * À retenir : l'emploi du temps est aussi frais que le dernier import ICS.
   * Ce n'est pas une liaison en direct avec Pronote.
   */
  var CLE_EDT = 'pse-personal-edt-v1';

  function deplierIcs(texte) {
    // Une ligne ICS peut être coupée : la suite commence par une espace.
    return String(texte || '').replace(/\r\n/g, '\n').replace(/\n[ \t]/g, '');
  }

  /* Pronote exporte en UTC (suffixe Z) et sans VTIMEZONE : 073000Z, c'est
     09:30 à Paris l'été. Sans cette conversion, toutes les heures du téléphone
     seraient décalées, et « en cours » se déclencherait au mauvais moment. */
  function icsDate(valeur) {
    var v = String(valeur || '').trim();
    var m = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?)?(Z)?/.exec(v);
    if (!m) return null;
    var p2 = function (n) { return String(n).padStart(2, '0'); };
    if (m[4] && m[7] === 'Z') {
      var d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +(m[6] || 0)));
      return {
        jour: d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()),
        heure: p2(d.getHours()) + ':' + p2(d.getMinutes())
      };
    }
    return { jour: m[1] + '-' + m[2] + '-' + m[3], heure: m[4] ? m[4] + ':' + m[5] : '' };
  }

  /* Les intitulés Pronote de réunions listent parfois tous les participants
     (« CONCERTATION - MARTIN A., DUPONT B., … »). Ces noms de collègues n'ont
     rien à faire sur un téléphone ni dans le cloud : on ne garde que l'objet. */
  function sansListeDeNoms(titre) {
    var s = String(titre || '');
    var coupe = s.split(' - ');
    if (coupe.length > 1) {
      var suite = coupe.slice(1).join(' - ');
      var virgules = (suite.match(/,/g) || []).length;
      var ressembleAUneListe = virgules >= 2 && /[A-ZÉÈÀÂÎÔÛÇ]{2,}[^,]*,/.test(suite);
      if (ressembleAUneListe) return coupe[0].trim();
    }
    return s.length > 90 ? s.slice(0, 88).trim() + '…' : s;
  }

  function icsTexte(v) {
    return String(v || '')
      .replace(/\\n/gi, ' ')
      .replace(/\\,/g, ',')
      .replace(/\;/g, ';')
      .trim();
  }

  function coursDuJour(iso) {
    var brut = safe(function () {
      return (JSON.parse(window.StorageService.get(CLE_EDT) || '{}').cache || {}).raw || '';
    });
    if (!brut) return [];

    var out = [];
    deplierIcs(brut).split('\n').reduce(function (courant, ligne) {
      if (ligne.indexOf('BEGIN:VEVENT') === 0) return {};
      if (ligne.indexOf('END:VEVENT') === 0) {
        if (courant && courant.jour === iso) out.push(courant);
        return null;
      }
      if (!courant) return courant;
      var sep = ligne.indexOf(':');
      if (sep < 0) return courant;
      var cle = ligne.slice(0, sep).split(';')[0].toUpperCase();
      var val = ligne.slice(sep + 1);
      if (cle === 'DTSTART') { var d = icsDate(val); if (d) { courant.jour = d.jour; courant.debut = d.heure; } }
      else if (cle === 'DTEND') { var f = icsDate(val); if (f) courant.fin = f.heure; }
      else if (cle === 'SUMMARY') courant.titre = icsTexte(val);
      else if (cle === 'LOCATION') courant.lieu = icsTexte(val);
      else if (cle === 'UID') courant.uid = icsTexte(val);
      else if (cle === 'STATUS') courant.statut = icsTexte(val);
      return courant;
    }, null);

    return out
      .sort(function (a, b) { return String(a.debut).localeCompare(String(b.debut)); })
      .map(function (e, i) {
        return {
          id: 'edt:' + (e.uid || (iso + ':' + i)),
          type: 'cours',
          debut: e.debut || '',
          fin: e.fin || '',
          titre: sansListeDeNoms(e.titre) || 'Cours',
          lieu: e.lieu || '',
          classeNom: '',
          statut: /CANCEL/i.test(e.statut || '') ? 'Annulé' : ''
        };
      });
  }

  function journee(iso) {
    var cours = coursDuJour(iso);
    if (!window.PSE_AGENDA || typeof window.PSE_AGENDA.journee !== 'function') return cours;
    var j = safe(function () { return window.PSE_AGENDA.journee(iso); }) || {};
    var lignes = (j.horaires || []).concat(j.journee || []);
    var evenements = lignes
      .filter(function (e) { return e && e.meConcerne !== false; })
      .map(function (e) {
        var etat = String(e.etatSeance || '');
        return {
          id: 'ev:' + e.id,
          type: e.genre === 'cours' ? 'cours' : 'evenement',
          debut: e.heure || '',
          fin: e.heureFin || '',
          titre: sansListeDeNoms(e.titre),
          lieu: String(e.lieu || ''),
          classeNom: nomClasses(e),
          statut: e.annule ? 'Annulé' : (ETATS_LISIBLES[etat] || '')
        };
      });

    // Les cours déjà présents dans l'agenda ne sont pas doublés.
    var vus = {};
    evenements.forEach(function (e) { vus[e.debut + '|' + e.titre] = 1; });
    return evenements
      .concat(cours.filter(function (c) { return !vus[c.debut + '|' + c.titre]; }))
      .sort(function (a, b) { return String(a.debut).localeCompare(String(b.debut)); });
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
    'projection.ouvrir': function () { envoyerProjection({ cmd: 'open' }); },
    'projection.etape.suivante': function () { envoyerProjection({ cmd: 'next' }); },
    'projection.etape.precedente': function () { envoyerProjection({ cmd: 'prev' }); },
    'projection.etape.aller': function (p) { envoyerProjection({ cmd: 'goto', step: Number(p.etape) }); },
    'projection.corrige.basculer': function () { envoyerProjection({ cmd: 'reveal' }); },
    'projection.focus.basculer': function () { envoyerProjection({ cmd: 'focus' }); },
    'projection.document.afficher': function (p) {
      envoyerProjection({ cmd: 'doc', idx: Number(p.idx), show: p.visible !== false });
    },
    'projection.minuteur.demarrer': function (p) {
      envoyerProjection({ cmd: 'timer', secs: Number(p.secondes) || 0 });
    },
    'projection.minuteur.pause': function () { envoyerProjection({ cmd: 'timer-pause' }); },
    'projection.minuteur.reprendre': function () { envoyerProjection({ cmd: 'timer-reprendre' }); },
    'projection.minuteur.arreter': function () { envoyerProjection({ cmd: 'timer-stop' }); },

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

  /**
   * Charge Firebase. Les pages de la Suite PSE sont servies en file:// :
   * Chromium refuse alors d'importer un module depuis Internet. On charge donc
   * le paquet embarqué (vendor/firebase-bundle.js, livré avec l'application),
   * et on ne retombe sur le CDN que si ce fichier manque — cas d'une page
   * ouverte depuis un vrai site.
   */
  async function chargerSdk() {
    if (sdk) return sdk;
    var m;
    try {
      m = await import('./vendor/firebase-bundle.js');
    } catch (eLocal) {
      try {
        var SDK = 'https://www.gstatic.com/firebasejs/10.12.2/';
        var a = await import(SDK + 'firebase-app.js');
        var b = await import(SDK + 'firebase-auth.js');
        var c = await import(SDK + 'firebase-firestore.js');
        m = Object.assign({}, a, b, c);
      } catch (eCdn) {
        throw new Error('Firebase introuvable : ni le paquet embarqué ' +
          '(vendor/firebase-bundle.js) ni le CDN n\'ont pu être chargés.');
      }
    }
    var app = m.getApps().length ? m.getApp() : m.initializeApp(CONFIG_PAR_DEFAUT);
    fs = m;
    db = m.getFirestore(app);
    sdk = { auth: m.getAuth(app), authM: m, fsM: m };
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
    var texte = LIBELLES_ETAT[etat] || LIBELLES_ETAT.deconnecte;
    if (etat === 'erreur' && detail) texte += ' — ' + String(detail).slice(0, 70);
    el.textContent = texte;
    el.style.maxWidth = etat === 'erreur' ? '520px' : 'none';
    el.style.textAlign = 'left';
    el.style.lineHeight = '1.35';
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
