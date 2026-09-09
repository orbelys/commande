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
 * CONFIDENTIALITÉ : aucune liste nominative ni identité tirée par la roue.
 * Les codes élèves sont pseudonymes. Titres, mémos, notes et actions restent
 * des textes libres synchronisés : ne pas y saisir de données sensibles.
 * Ne pas ajouter de champ nominatif sans revoir ce contrat.
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

  var VERSION_CONTRAT = 5;
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
  var arreters = [], authArreter = null, generation = 0;
  var fileTravail = Promise.resolve(), enAttente = new Set();
  var commandeActive = null;
  function deviceId() {
    var id = window.StorageService.get('pse-mobile-device-v1');
    if (!id) {
      id = crypto.randomUUID();
      window.StorageService.set('pse-mobile-device-v1', id);
    }
    return id;
  }
  function arreterEcoutes() {
    generation++;
    arreters.splice(0).forEach(function (f) { f(); });
    clearTimeout(timerPub);
    enMarche = false;
    uid = null;
  }
  function estChef() {
    var bail = lireJson(CLE_CHEF);
    return suisChef && bail && bail.id === monId && Date.now() - bail.at < BAIL_MS;
  }

  /* ══ 0. Une seule fenêtre aux commandes ═══════════════════
   *
   * Les espaces de la Suite PSE se chargent dans la MÊME fenêtre : passer sur
   * « Mon EDT » remplace cours.html, et le pont disparaissait avec. Le pont est
   * donc chargé par toutes les pages principales — mais si toutes publiaient et
   * appliquaient les commandes, « étape suivante » avancerait de deux crans.
   *
   * D'où cette règle : une seule fenêtre est « chef » à un instant donné. Elle
   * seule se connecte à Firebase, publie et applique. Le relais passe tout seul
   * en moins de 15 secondes si elle est fermée.
   */
  var CLE_CHEF = 'pse-mobile-chef';
  var CLE_PROJECTION = 'pse-mobile-projection';
  var CLE_RELAIS = 'pse-mobile-relais';
  var BAIL_MS = 15000;
  var BATTEMENT_MS = 5000;

  var monId = 'w' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  var suisChef = false;

  function lireJson(cle) {
    return safe(function () { return JSON.parse(window.StorageService.get(cle) || 'null'); });
  }
  function ecrireJson(cle, valeur) {
    safe(function () { window.StorageService.set(cle, JSON.stringify(valeur)); });
  }

  function revendiquerRole() {
    var bail = lireJson(CLE_CHEF);
    var perime = !bail || !bail.at || (Date.now() - bail.at) > BAIL_MS;
    var etaitChef = suisChef;

    if (perime || bail.id === monId) {
      ecrireJson(CLE_CHEF, { id: monId, at: Date.now(), page: nomPage() });
      suisChef = true;
    } else {
      suisChef = false;
    }

    if (suisChef && !etaitChef) demarrerAuto();
    if (!suisChef && etaitChef) {
      arreterEcoutes();
      if (authArreter) authArreter();
      authArreter = null;
      pastille('relais', '');
    }
    if (!suisChef) pastille('relais', 'pilotée par ' + ((bail && bail.page) || 'une autre fenêtre'));
    return suisChef;
  }

  function nomPage() {
    var m = /([^/]+)\.html/.exec(String(location.pathname || ''));
    return m ? m[1] : 'suite';
  }

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
  var attentesProjection = new Map();
  function origineLocale(e) {
    return !!e.source && (e.origin === location.origin ||
      (location.protocol === 'file:' && e.origin === 'null'));
  }

  window.addEventListener('message', function (e) {
    var m = e.data || {};
    if (!origineLocale(e)) return;
    if (m.type === 'mobile-ack') {
      if (e.source !== cibleProjection) return;
      var attente = attentesProjection.get(m.id);
      if (attente) attente(m);
      else {
        var r = lireJson(CLE_RELAIS);
        if (r && r.id === m.id && r.pour === monId && !r.ack) {
          r.ack = { id: m.id, ok: m.ok === true, erreur: String(m.erreur || '') };
          ecrireJson(CLE_RELAIS, r);
        }
      }
      return;
    }
    if (m.type !== 'mobile-etat') return;
    etatProjete = m.etat || null;
    etatRecuA = Date.now();
    cibleProjection = e.source || cibleProjection;
    // La fenêtre qui tient la projection n'est pas forcément le chef :
    // elle dépose l'état dans le store, que le chef relit.
    ecrireJson(CLE_PROJECTION, { etat: etatProjete, at: etatRecuA, par: monId });
    publierBientot();
  });

  /** État de projection connu, le mien ou celui déposé par une autre fenêtre. */
  function projectionConnue() {
    if (etatProjete && (Date.now() - etatRecuA) < PERIME_MS) return etatProjete;
    var depot = lireJson(CLE_PROJECTION);
    if (depot && depot.at && (Date.now() - depot.at) < PERIME_MS) return depot.etat || null;
    return null;
  }

  function projectionVivante() {
    return !!projectionConnue();
  }

  function envoyerProjection(message) {
    if (!projectionVivante()) throw new Error('Aucune projection en cours');
    var id = commandeActive.id;
    var msg = Object.assign({ type: 'mobile-cmd', id: id,
      sessionId: commandeActive.projectionSessionId, expiresAt: commandeActive.expiresAt,
      expected: commandeActive.expected }, message);
    return new Promise(function (resolve, reject) {
      var fini = false;
      var timer = setTimeout(function () { terminer({ ok: false, erreur: 'Projection sans confirmation. Vérifie l’écran avant de réessayer.' }); }, 8000);
      function terminer(r) {
        if (fini) return;
        fini = true; clearTimeout(timer); attentesProjection.delete(id);
        if (r.ok) resolve(); else reject(new Error(r.erreur));
      }
      attentesProjection.set(id, terminer);
      try {
        if (cibleProjection && etatProjete && Date.now() - etatRecuA < PERIME_MS)
          cibleProjection.postMessage(msg, '*');
        else {
          // Une seule commande est en vol : le prochain relais attend l'accusé.
          ecrireJson(CLE_RELAIS, { id: id, cmd: msg, at: Date.now(), pour: (lireJson(CLE_PROJECTION) || {}).par || '' });
          if (window.StorageService.flush) window.StorageService.flush();
        }
      } catch (e) { terminer({ ok: false, erreur: String(e.message || e) }); }
    });
  }

  /* Côté fenêtre qui tient la projection : exécuter les consignes relayées. */
  var dernierRelais = '';
  function verifierRelais() {
    var r = lireJson(CLE_RELAIS);
    if (!r || !r.id) return;
    if (r.ack && attentesProjection.has(r.id)) { attentesProjection.get(r.id)(r.ack); return; }
    if (!cibleProjection || r.pour !== monId || r.id === dernierRelais || r.ack) return;
    if (Date.now() - r.at > 10000) return;
    dernierRelais = r.id;
    safe(function () {
      cibleProjection.postMessage(Object.assign({ type: 'mobile-cmd' }, r.cmd || {}), '*');
    });
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
    return normaliserProjection(projectionConnue());
  }

  function normaliserProjection(e) {
    return {
      sessionId: String(e.sessionId || ''),
      fenetreOuverte: e.fenetreOuverte !== false,
      coursTitre: String(e.coursTitre || 'Cours projeté'),
      classeNom: String(e.classeNom || ''),
      etape: typeof e.etape === 'number' ? e.etape : -1,
      nbEtapes: (e.sommaire || []).length,
      corrigeVisible: !!e.corrigeVisible,
      corrigeDisponible: !!e.corrigeDisponible,
      focus: !!e.focus,
      audio: e.audio ? {disponible:!!e.audio.disponible,statut:['lecture','pause'].indexOf(e.audio.statut)>=0?e.audio.statut:'repos',cible:e.audio.cible==='corrige'?'corrige':'question',lisible:!!e.audio.lisible,erreur:String(e.audio.erreur||'').slice(0,300)} : null,
      accessibilite: e.accessibilite ? {taille:Number(e.accessibilite.taille)||1,contraste:!!e.accessibilite.contraste,interligne:!!e.accessibilite.interligne} : null,
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
      }),
      roue: e.roue ? {
        configuree: !!e.roue.configuree,
        classe: String(e.roue.classe || ''),
        dansLaRoue: Number(e.roue.dansLaRoue) || 0,
        total: Number(e.roue.total) || 0,
        dejaTires: Number(e.roue.dejaTires) || 0,
        dernier: e.roue.dernier ? 'Élève tiré' : ''
      } : { configuree: false, classe: '', dansLaRoue: 0, total: 0, dejaTires: 0, dernier: '' },
      ressources: (e.ressources || []).map(function (r, i) {
        return { idx: typeof r.idx === 'number' ? r.idx : i, titre: String(r.titre || ('Ressource ' + (i + 1))), type: String(r.type || '') };
      }),
      ressourceActive: typeof e.ressourceActive === 'number' ? e.ressourceActive : -1
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
    var out = [], abs = absences();
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
          // « 1/3 » : avancement du module tel qu'affiché dans la progression.
          sequence: x.sequence ? {
            current: Number(x.sequence.current) || 0,
            total: Number(x.sequence.total) || 0,
            placed: Number(x.sequence.placed) || 0,
            done: Number(x.sequence.done) || 0,
            label: String(x.sequence.label || '')
          } : null,
          sequenceLabel: (x.sequence && x.sequence.label) ? String(x.sequence.label) : '',
          phase: s.phase || '',
          objectif: s.objectif || '',
          statut: s.statut || 'Prévu',
          remise: s.remise || '',
          memo: s.memo || '',
          absents: abs[[x.cls, x.wkey, slotId].join('|')] || []
        });
      });
    }
    return out;
  }

  /* ══ Absences et rattrapages ══════════════════════════════
   * Seuls les CODES du publipostage circulent — jamais un nom, jamais un
   * prénom. Ce sont les mêmes quatre caractères que sur les documents
   * distribués : le téléphone sert à pointer ce qui reste dans la main.
   */
  var CLE_ABSENCES = 'pse-mobile-absences';
  var CLE_RATTRAPAGES = 'pse-mobile-rattrapages';
  /* Relevés de besoins & aménagements posés depuis le téléphone, par classe puis
   * par code élève. RESTE LOCAL : jamais republié dans l'instantané (le téléphone
   * ne rapatrie rien). Lu par la Suite PSE (Classes & élèves) — affichage seul. */
  var CLE_BESOINS = 'pse-besoins-eleves-v1';

  function codesParClasse() {
    var res = safe(function () { return window.studentCodesAPI.readAllSync(); });
    var entrees = (res && res.ok && Array.isArray(res.entries)) ? res.entries : [];
    var parClasse = {};
    entrees.forEach(function (e) {
      var code = String((e && e.userCode) || '').trim();
      if (!code) return;
      var cl = String((e && e.classe) || '').trim();
      if (!parClasse[cl]) parClasse[cl] = [];
      parClasse[cl].push({ code: code, ordre: Number(e.order) || 0 });
    });
    Object.keys(parClasse).forEach(function (cl) {
      parClasse[cl] = parClasse[cl]
        .sort(function (a, b) { return a.ordre - b.ordre || a.code.localeCompare(b.code); })
        .map(function (x) { return x.code; });
    });
    return parClasse;
  }

  function absences() { return lireJson(CLE_ABSENCES) || {}; }
  function rattrapages() { return lireJson(CLE_RATTRAPAGES) || {}; }

  function poserAbsents(seanceId, codes) {
    if (!lireCreneau(creneau({ seanceId: seanceId }))) throw new Error('Séance introuvable');
    var classe = classes().find(function (c) { return c.id === String(seanceId).split('|')[0]; });
    if (!classe || codes.some(function (c) { return classe.codes.indexOf(c) < 0; })) throw new Error('Code élève inconnu dans cette classe');
    codes = Array.from(new Set(codes));
    var toutes = absences();
    var avant = toutes[seanceId] || [];
    toutes[seanceId] = codes;
    ecrireJson(CLE_ABSENCES, toutes);

    // Un absent doit son support : il entre dans la dette de sa classe.
    var classeId = String(seanceId).split('|')[0];
    var dettes = rattrapages();
    var liste = dettes[classeId] || [];
    codes.forEach(function (c) { if (avant.indexOf(c) < 0 && liste.indexOf(c) < 0) liste.push(c); });
    // Un code décoché ici, et absent nulle part ailleurs, sort de la dette.
    avant.filter(function (c) { return codes.indexOf(c) < 0; }).forEach(function (c) {
      var ailleurs = Object.keys(toutes).some(function (id) {
        return id !== seanceId && String(id).split('|')[0] === classeId &&
          (toutes[id] || []).indexOf(c) >= 0;
      });
      if (!ailleurs) liste = liste.filter(function (x) { return x !== c; });
    });
    dettes[classeId] = liste;
    ecrireJson(CLE_RATTRAPAGES, dettes);
  }

  function marquerRattrape(classeId, code) {
    var classe = classes().find(function (c) { return c.id === classeId; });
    if (!classe || classe.codes.indexOf(code) < 0) throw new Error('Code élève inconnu dans cette classe');
    var dettes = rattrapages();
    dettes[classeId] = (dettes[classeId] || []).filter(function (x) { return x !== code; });
    ecrireJson(CLE_RATTRAPAGES, dettes);
  }

  /* Classes : intitulés, effectifs et codes — jamais la liste nominative.
   *
   * PIÈGE : trois listes coexistent, avec des identifiants différents.
   *   • progression (pse-prog-config) : id « B1AGORA1 », nom « B1AGO1 »
   *   • carnet de classes            : id « cls0 »,     nom « B1AGO1 »
   *   • fichier de codes             : classe « B1AGO1 »
   * Les séances portent l'identifiant de la PROGRESSION : c'est donc lui qui
   * fait foi ici, sinon le téléphone ne relie jamais une séance à sa classe.
   * Le nom sert de pont vers les deux autres listes.
   */
  function classes() {
    var cfgProg = safe(function () {
      return JSON.parse(window.StorageService.get('pse-prog-config') || '{}');
    }) || {};
    var listeProg = Array.isArray(cfgProg.classes) ? cfgProg.classes : [];

    var carnet = safe(function () {
      return JSON.parse(window.StorageService.get('pse-classes-v1') || '[]');
    }) || [];
    if (!Array.isArray(carnet)) carnet = carnet.classes || [];
    var effectifs = {};
    carnet.forEach(function (c) {
      var nom = String((c && c.nom) || '').trim();
      if (nom) effectifs[nom] = Array.isArray(c.eleves) ? c.eleves.length : 0;
    });

    var codes = codesParClasse();
    var dettes = rattrapages();

    return listeProg.map(function (c) {
      var id = String(c.id || '');
      var nom = String(c.nom || id).trim();
      return {
        id: id,
        nom: nom,
        diplome: String(c.niv || c.diplome || ''),
        effectif: effectifs[nom] || 0,
        codes: codes[nom] || codes[id] || [],
        aRattraper: dettes[id] || []
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
    var instantane = {
      version: VERSION_CONTRAT,
      deviceId: deviceId(),
      majA: new Date().toISOString(),
      poste: nomPoste,
      date: iso,
      capacites: capacites(),
      statuts: STATUTS_PROGRESSION.slice(),
      projection: etatProjection(),
      journee: journee(iso),
      seances: seances(iso, 1, 6),
      classes: classes(),
      actions: actions(iso)
    };
    // Trois semaines bornées ; garder une marge sous la limite du document cloud.
    var budget = Math.max(0, Math.min(250000, 750000 - JSON.stringify(instantane).length * 3));
    instantane.agenda = agendaPeriode(iso, instantane.journee, budget);
    return instantane;
  }

  function agendaPeriode(iso, aujourdHui, budget) {
    var jourSemaine = (new Date(iso + 'T12:00:00').getDay() + 6) % 7;
    var debut = decalerIso(iso, -jourSemaine - 7);
    var dates = [], jours = [], incomplet = false;
    for (var i = 0; i < 21; i++) dates.push({ date: decalerIso(debut, i), distance: Math.abs(i - jourSemaine - 7) });
    dates.sort(function (a, b) { return a.distance - b.distance || a.date.localeCompare(b.date); });
    dates.forEach(function (d) {
      var lot = { date: d.date, evenements: d.date === iso ? aujourdHui : journee(d.date) };
      // Trois octets par unité UTF-16 majorent aussi les caractères accentués.
      var taille = JSON.stringify(lot).length * 3;
      if (taille > budget) { incomplet = true; return; }
      budget -= taille;
      jours.push(lot);
    });
    jours.sort(function (a, b) { return a.date.localeCompare(b.date); });
    return { debut: debut, fin: decalerIso(debut, 20), jours: jours, incomplet: incomplet };
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
    if (!lireCreneau(c)) throw new Error('Séance introuvable');
    window.PSE_PROG.setSlot(c.cls, c.wkey, c.slotId, champ, valeur, false);
    var apres = lireCreneau(c);
    if (!apres || String(apres[champ] || '') !== String(valeur)) throw new Error('Modification non enregistrée sur ce créneau');
  }

  /* Relit le statut réellement enregistré pour un créneau (date = lundi wkey +
   * (jour-1)). Sert à confirmer au téléphone que la clôture a bien pris. */
  function lireCreneau(c) {
    var jour = parseInt(String(c.slotId).split('|')[0], 10) || 1;
    var d = decalerIso(c.wkey, jour - 1);
    var lot = safe(function () { return window.PSE_PROG.slotsForDate(d); }) || [];
    for (var i = 0; i < lot.length; i++) {
      var x = lot[i], s = x.slot || {};
      if (String(x.cls) === String(c.cls) &&
          [s.day, s.start, s.end || ''].join('|') === c.slotId) {
        return s;
      }
    }
    return null;
  }
  function lireStatutCreneau(c) {
    var s = lireCreneau(c);
    return s ? String(s.statut || '') : null;
  }

  /* Les 7 statuts gérés par la progression (progression-core.js : STATUTS).
   * Le téléphone doit tous pouvoir les poser, pour que ça se synchronise. */
  var STATUTS_PROGRESSION = ['Prévu', 'En cours', 'À terminer', 'Réalisé', 'Reporté', 'Annulé', 'Non réalisé'];
  /* Ces trois statuts, via setSlot(…,'statut',…), ouvriraient la fenêtre de
   * reprise sur l'ordinateur de la classe. Depuis le téléphone on écrit
   * directement le statut (sans déplacement de séance) via setSlotStatusOnly :
   * le report/décalage éventuel se règle ensuite sur l'ordinateur. */
  var STATUTS_A_DIALOGUE = ['À terminer', 'Reporté', 'Non réalisé'];

  var HANDLERS = {
    'projection.ouvrir': function () { return envoyerProjection({ cmd: 'open' }); },
    'projection.etape.suivante': function () { return envoyerProjection({ cmd: 'next' }); },
    'projection.etape.precedente': function () { return envoyerProjection({ cmd: 'prev' }); },
    'projection.etape.aller': function (p) { return envoyerProjection({ cmd: 'goto', step: Number(p.etape) }); },
    'projection.corrige.basculer': function (p) { return envoyerProjection({ cmd: 'reveal', visible: p.visible }); },
    'projection.focus.basculer': function (p) { return envoyerProjection({ cmd: 'focus', visible: p.visible }); },
    'projection.document.afficher': function (p) {
      return envoyerProjection({ cmd: 'doc', idx: Number(p.idx), show: p.visible !== false });
    },
    'projection.minuteur.demarrer': function (p) {
      return envoyerProjection({ cmd: 'timer', secs: Number(p.secondes) || 0 });
    },
    'projection.minuteur.pause': function () { return envoyerProjection({ cmd: 'timer-pause' }); },
    'projection.minuteur.reprendre': function () { return envoyerProjection({ cmd: 'timer-reprendre' }); },
    'projection.minuteur.arreter': function () { return envoyerProjection({ cmd: 'timer-stop' }); },
    'projection.audio.lire': function () { return envoyerProjection({ cmd:'audio-lire' }); },
    'projection.audio.pause': function () { return envoyerProjection({ cmd:'audio-pause' }); },
    'projection.audio.reprendre': function () { return envoyerProjection({ cmd:'audio-reprendre' }); },
    'projection.audio.arreter': function () { return envoyerProjection({ cmd:'audio-stop' }); },
    'projection.accessibilite.taille': function (p) { return envoyerProjection({ cmd:'a11y-taille',taille:p.taille }); },
    'projection.accessibilite.prereglage': function (p) { return envoyerProjection({ cmd:'a11y-prereglage',nom:p.nom }); },
    'projection.roue.tourner': function () { return envoyerProjection({ cmd: 'roue-spin' }); },
    'projection.roue.reinitialiser': function () { return envoyerProjection({ cmd: 'roue-reset' }); },
    'projection.roue.cacher': function () { return envoyerProjection({ cmd: 'roue-hide' }); },
    'projection.ressource.afficher': function (p) { return envoyerProjection({ cmd: 'ressource', index: Number(p.index) }); },
    'projection.ressource.fermer': function () { return envoyerProjection({ cmd: 'ressource-fermer' }); },

    'seance.statut': function (p) {
      var statut = String(p.statut);
      if (STATUTS_PROGRESSION.indexOf(statut) < 0) {
        throw new Error('Statut inconnu : « ' + statut + ' »');
      }
      var c = creneau(p);
      if (STATUTS_A_DIALOGUE.indexOf(statut) >= 0) {
        // Écriture directe du statut, sans ouvrir la fenêtre de reprise.
        if (!capacites().progression) throw new Error('Progression non disponible sur ce poste');
        if (!window.PSE_PROG || typeof window.PSE_PROG.setSlotStatusOnly !== 'function') {
          throw new Error('« ' + statut + ' » se choisit sur l\'ordinateur (fenêtre de reprise)');
        }
        window.PSE_PROG.setSlotStatusOnly(c.cls, c.wkey, c.slotId, statut);
      } else {
        ecrireCreneau(p, 'statut', statut);
      }
      // Confirme que le statut a bien été posé, sinon renvoie une vraie erreur
      // au téléphone (au lieu d'un faux « appliqué » qui ne change rien).
      var apres = lireStatutCreneau(c);
      if (apres === null) {
        throw new Error('Séance introuvable sur ce créneau — clôture impossible.');
      }
      if (apres !== statut) {
        throw new Error('Séance pas encore renseignée sur l\'ordinateur (choisis d\'abord le module / la séance). Statut inchangé.');
      }
    },
    'seance.remise': function (p) {
      if (['', 'a_faire', 'partiel', 'remis'].indexOf(p.remise) < 0) throw new Error('Remise inconnue');
      ecrireCreneau(p, 'remise', p.remise);
    },
    'seance.memo': function (p) { ecrireCreneau(p, 'memo', String(p.memo || '')); },
    'seance.absents': function (p) {
      var codes = String(p.codes || '').split(',').map(function (c) { return c.trim(); })
        .filter(Boolean);
      poserAbsents(String(p.seanceId || ''), codes);
    },
    /* Relevé de besoins & aménagements d'un élève. On RANGE, c'est tout :
     * aucune validation, aucun publipostage, aucune modification de la fiche
     * élève ni de la progression. La Suite PSE (Classes & élèves) l'affiche. */
    'eleve.besoins': function (p) {
      var classeId = String(p.classeId || '');
      var code = String(p.code || '').trim();
      var classe = classes().find(function (c) { return c.id === classeId; });
      if (!classe || classe.codes.indexOf(code) < 0) throw new Error('Code élève inconnu dans cette classe');
      var besoins = safe(function () { return JSON.parse(p.besoins || '[]'); }) || [];       // [{domaine, item}]
      var amenagements = safe(function () { return JSON.parse(p.amenagements || '[]'); }) || []; // [string]
      var note = String(p.note || '').trim();
      if (!(besoins.length || amenagements.length || note)) return;   // rien à ranger
      var store = lireJson(CLE_BESOINS) || {};
      if (!store[classeId]) store[classeId] = {};
      if (!store[classeId][code]) store[classeId][code] = [];
      store[classeId][code].push({
        date: String(p.date || ''),
        seanceId: String(p.seanceId || ''),
        besoins: besoins,
        amenagements: amenagements,
        note: note,
        at: new Date().toISOString(),
        source: 'telephone'
      });
      ecrireJson(CLE_BESOINS, store);
    },
    'classe.rattrape': function (p) {
      marquerRattrape(String(p.classeId || ''), String(p.code || ''));
    },

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

  async function appliquer(commande) {
    var h = Object.prototype.hasOwnProperty.call(HANDLERS, commande.type) && HANDLERS[commande.type];
    if (!h) return { ok: false, erreur: 'Commande inconnue : ' + commande.type };
    try {
      commandeActive = commande;
      await h(commande.payload || {});
      return { ok: true };
    } catch (e) {
      return { ok: false, erreur: String((e && e.message) || e) };
    } finally {
      commandeActive = null;
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

  function verifierCommande(c) {
    if (!c || c.protocol !== VERSION_CONTRAT) throw new Error('Version de télécommande incompatible : actualise le téléphone');
    if (c.owner !== uid || c.deviceId !== deviceId()) throw new Error('Commande destinée à un autre poste ou compte');
    if (!Object.prototype.hasOwnProperty.call(HANDLERS, c.type)) throw new Error('Commande inconnue');
    var creation = Date.parse(c.creeeA), expiration = Date.parse(c.expiresAt);
    var projection = c.type.indexOf('projection.') === 0;
    var duree = projection ? 20000 : 300000;
    if (!Number.isFinite(creation) || !Number.isFinite(expiration) || creation > Date.now() + 5000 ||
        expiration <= Date.now() || expiration - creation > duree || expiration <= creation)
      throw new Error('Commande périmée : vérifie l’état actuel puis réessaie');
    if (projection) {
      var e = projectionConnue();
      if (!e || !c.projectionSessionId || e.sessionId !== c.projectionSessionId) throw new Error('Le cours projeté a changé');
      if (c.expected !== e.etape) throw new Error('L’étape a changé : actualise avant de réessayer');
    }
    if (c.type.indexOf('seance.') === 0) {
      var p = c.payload || {}, champ = c.type.split('.')[1], slot = lireCreneau(creneau(p));
      if (!slot) throw new Error('Séance introuvable');
      var actuel = champ === 'absents' ? (absences()[p.seanceId] || []).slice().sort().join(',') : String(slot[champ] || '');
      if (champ === 'statut' && !actuel) actuel = 'Prévu';
      if (c.expected !== actuel) throw new Error('Séance modifiée depuis un autre écran : actualise avant de réessayer');
    }
  }

  async function traiterCommande(ref) {
    if (!estChef() || !uid) return;
    var gen = generation;
    var commande = await fs.runTransaction(db, async function (tx) {
      var doc = await tx.get(ref);
      if (!doc.exists()) return null;
      var c = doc.data();
      if (c.statut !== 'envoyee' || !estChef() || gen !== generation) return null;
      if (c.deviceId && c.deviceId !== deviceId()) return null;
      try {
        if (c.id !== ref.id) throw new Error('Identifiant de commande incohérent');
        verifierCommande(c);
      } catch (e) {
        tx.update(ref, { statut: 'echouee', erreur: String(e.message || e) });
        return null;
      }
      tx.update(ref, { statut: 'en_cours', executant: monId, priseA: new Date().toISOString() });
      return c;
    });
    if (!commande) return;
    var res;
    if (!estChef() || gen !== generation) res = { ok: false, erreur: 'Connexion interrompue avant exécution' };
    else {
      try {
        verifierCommande(commande);
        res = dejaAppliquees().indexOf(commande.id) >= 0 ? { ok: true } : await appliquer(commande);
        if (res.ok) {
          memoriser(commande.id);
          if (window.StorageService.flush) await window.StorageService.flush();
        }
      } catch (e) { res = { ok: false, erreur: String(e.message || e) }; }
    }
    await fs.updateDoc(ref, { statut: res.ok ? 'appliquee' : 'echouee',
      erreur: res.ok ? null : res.erreur, appliqueeA: new Date().toISOString() });
  }

  async function publier() {
    if (!uid || !estChef()) return;
    var gen = generation;
    try {
      await fs.setDoc(fs.doc(db, COL_POSTES, uid), construireInstantane());
      if (gen === generation && estChef() && !erreurEcoute) pastille('connecte', '');
    } catch (e) {
      if (gen === generation && estChef()) pastille('erreur', String(e.message || e));
      throw e;
    }
  }

  function publierBientot() {
    clearTimeout(timerPub);
    timerPub = setTimeout(function () { publier().catch(function () {}); }, DEBOUNCE_PUBLICATION);
  }

  /* Une fois le compte connecté : publier, écouter les commandes, republier. */
  var enMarche = false;
  var erreurEcoute = false;
  async function activer(utilisateur, tentative) {
    if (!estChef()) return;
    if (enMarche && uid === utilisateur.uid) return;
    arreterEcoutes();
    uid = utilisateur.uid;
    var gen = generation;
    nomPoste = nomPosteAuto();
    erreurEcoute = false;
    enMarche = true;
    var reprise = null;
    var echecs = Number(tentative) || 0;
    arreters.push(function () { clearTimeout(reprise); });

    arreters.push(fs.onSnapshot(
      fs.query(fs.collection(db, COL_COMMANDES, uid, SOUS_FILE), fs.where('statut', '==', 'envoyee')),
      function (snap) {
        if (gen !== generation || !estChef()) return;
        erreurEcoute = false;
        echecs = 0;
        var travail = [];
        snap.forEach(function (d) { travail.push(d); });
        travail.sort(function (a, b) { return String(a.data().creeeA).localeCompare(String(b.data().creeeA)) || a.id.localeCompare(b.id); });
        travail.forEach(function (d) {
          if (enAttente.has(d.id)) return;
          enAttente.add(d.id);
          fileTravail = fileTravail.then(async function () {
            if (gen === generation && estChef()) { await traiterCommande(d.ref); await publier(); }
          }).catch(function (e) { pastille('erreur', String(e.message || e)); })
            .finally(function () { enAttente.delete(d.id); });
        });
      }, function (e) {
        if (gen !== generation || !estChef()) return;
        erreurEcoute = true;
        pastille('erreur', String(e.message || e));
        // Une erreur terminale ferme onSnapshot : le battement seul ne le restaure pas.
        if (reprise !== null) return;
        reprise = setTimeout(function () {
          reprise = null;
          if (gen !== generation || !estChef()) return;
          arreterEcoutes();
          activer(utilisateur, Math.min(echecs + 1, 4)).catch(function () {});
        }, Math.min(60000, 5000 * Math.pow(2, echecs)));
      }
    ));

    window.addEventListener('pse-store-sync', publierBientot);
    arreters.push(function () { window.removeEventListener('pse-store-sync', publierBientot); });
    /* Installer les reprises avant le premier envoi, qui peut échouer ou rester
     * en attente hors ligne. Une erreur initiale ne doit pas couper le battement. */
    var battement = setInterval(function () { publier().catch(function () {}); }, 25000);
    arreters.push(function () { clearInterval(battement); });
    /* Retour au premier plan / réveil : republication immédiate, sans attendre. */
    var republierMaintenant = function () { publier().catch(function () {}); };
    window.addEventListener('focus', republierMaintenant);
    var visible = function () {
      if (!document.hidden) republierMaintenant();
    };
    document.addEventListener('visibilitychange', visible);
    arreters.push(function () { window.removeEventListener('focus', republierMaintenant); document.removeEventListener('visibilitychange', visible); });
    await publier();
  }

  /**
   * Démarrage automatique, appelé au chargement de la page.
   * Si une session Firebase existe déjà sur ce poste, la liaison repart seule :
   * le mot de passe n'est demandé qu'une fois, au tout premier lancement.
   */
  async function demarrerAuto() {
    if (authArreter || !estChef()) return;
    var gen = generation;
    var s;
    try {
      s = await chargerSdk();
    } catch (e) {
      pastille('erreur', String((e && e.message) || e));
      return;
    }
    if (authArreter || !estChef() || gen !== generation) return;
    authArreter = s.authM.onAuthStateChanged(s.auth, function (u) {
      if (u) activer(u).catch(function (e) { pastille('erreur', String(e && e.message || e)); });
      else { arreterEcoutes(); pastille('deconnecte', ''); }
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
    relais: '📱 Télécommande — autre fenêtre',
    connecte: '📱 Télécommande active',
    deconnecte: '📱 Télécommande — se connecter',
    erreur: '📱 Télécommande — problème'
  };
  var COULEURS_ETAT = {
    relais: '#4f46e5',
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
        if (uid) ouvrirDiagnostic();
        else ouvrirConnexion();
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

  /* Panneau de contrôle : ce que ce poste voit et publie réellement.
     Sert à répondre sans deviner quand le téléphone paraît vide. */
  function ouvrirDiagnostic() {
    if (document.getElementById('pse-mobile-diag')) return;
    var s = safe(construireInstantane) || {};
    var c = s.capacites || {};
    var oui = function (v) { return v ? '✅' : '❌'; };
    var brutEdt = safe(function () {
      return (JSON.parse(window.StorageService.get(CLE_EDT) || '{}').cache || {}).raw || '';
    }) || '';

    var lignes = [
      ['Compte', (safe(function () { return sdk.auth.currentUser.email; })) || uid || '—'],
      ['Journée publiée', (s.journee || []).length + ' ligne(s)'],
      ['Séances publiées', (s.seances || []).length],
      ['Classes', (s.classes || []).length],
      ['Actions', (s.actions || []).length],
      ['— Sources —', ''],
      ['Store de fichiers', oui(!!window.storeAPI)],
      ['Emploi du temps (ICS)', brutEdt ? Math.round(brutEdt.length / 1024) + ' Ko' : '❌ vide'],
      ['PSE_PROG (progression)', oui(!!(window.PSE_PROG && window.PSE_PROG.slotsForDate))],
      ['PSE_AGENDA', oui(!!window.PSE_AGENDA)],
      ['PSE_REUNIONS', oui(!!window.PSE_REUNIONS)],
      ['— Capacités —', ''],
      ['Projection', oui(c.projection)],
      ['Progression', oui(c.progression)],
      ['Agenda', oui(c.agenda)],
      ['Actions', oui(c.actions)]
    ];

    var fond = document.createElement('div');
    fond.id = 'pse-mobile-diag';
    fond.setAttribute('style',
      'position:fixed;inset:0;z-index:99999;background:rgba(15,23,42,.55);' +
      'display:flex;align-items:center;justify-content:center;' +
      'font:14px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif');
    fond.innerHTML =
      '<div style="background:#fff;color:#14181f;padding:22px;border-radius:14px;' +
      'width:min(460px,94vw);max-height:86vh;overflow:auto;box-shadow:0 10px 40px rgba(0,0,0,.3)">' +
      '<strong style="font-size:17px">Télécommande — état du poste</strong>' +
      '<table style="width:100%;margin:14px 0;border-collapse:collapse">' +
      lignes.map(function (l) {
        if (!l[1] && String(l[0]).indexOf('—') === 0) {
          return '<tr><td colspan="2" style="padding:10px 0 4px;font-size:12px;font-weight:700;' +
            'letter-spacing:.06em;color:#8a94a6">' + echapper(l[0].replace(/—/g, '').trim().toUpperCase()) + '</td></tr>';
        }
        return '<tr><td style="padding:3px 0;color:#5c6470">' + echapper(String(l[0])) +
          '</td><td style="padding:3px 0;text-align:right;font-weight:600">' + echapper(String(l[1])) + '</td></tr>';
      }).join('') +
      '</table>' +
      '<div style="display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap">' +
      '<button id="pse-diag-deco" style="padding:9px 14px;border:1px solid #d7dce3;background:#fff;' +
      'border-radius:8px;font:inherit;cursor:pointer">Se déconnecter</button>' +
      '<button id="pse-diag-pub" style="padding:9px 14px;border:0;background:#1f5fd6;color:#fff;' +
      'border-radius:8px;font:inherit;font-weight:600;cursor:pointer">Republier maintenant</button>' +
      '<button id="pse-diag-ok" style="padding:9px 14px;border:1px solid #d7dce3;background:#fff;' +
      'border-radius:8px;font:inherit;cursor:pointer">Fermer</button>' +
      '</div></div>';
    document.body.appendChild(fond);

    fond.querySelector('#pse-diag-ok').onclick = function () { fond.remove(); };
    fond.querySelector('#pse-diag-deco').onclick = function () { fond.remove(); deconnecter(); };
    fond.querySelector('#pse-diag-pub').onclick = function (e) {
      e.target.textContent = 'Publication…';
      publier().then(function () { e.target.textContent = '✓ Publié'; })
        .catch(function (err) { e.target.textContent = 'Échec : ' + ((err && err.message) || err); });
    };
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
  function installer() {
    pastille('deconnecte', '');
    revendiquerRole();
    setInterval(revendiquerRole, BATTEMENT_MS);
    setInterval(verifierRelais, 1000);
    // Rendre la main proprement en fermant la fenêtre : le relais est immédiat.
    window.addEventListener('beforeunload', function () {
      if (suisChef) safe(function () { window.StorageService.remove(CLE_CHEF); });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installer);
  } else {
    installer();
  }

  window.PSE_MOBILE = {
    ouvrirConnexion: ouvrirConnexion,
    diagnostic: ouvrirDiagnostic,
    connecter: connecter,
    deconnecter: deconnecter,
    publier: publier,
    construireInstantane: construireInstantane,
    appliquer: appliquer,
    capacites: capacites
  };
})();
