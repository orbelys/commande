import type { Snapshot, Seance, StatutSeance } from '../services/bridge/types'
import { VERSION_CONTRAT } from '../services/bridge/types'

/**
 * Données ENTIÈREMENT FICTIVES pour la simulation hors ligne.
 * Aucun élève réel, aucune donnée personnelle, aucun contenu de cours réel.
 */

function jourIso(decalage = 0): string {
  const d = new Date()
  d.setDate(d.getDate() + decalage)
  return d.toISOString().slice(0, 10)
}

/** Lundi de la semaine contenant la date donnée. */
function lundi(iso: string): string {
  const d = new Date(iso + 'T12:00:00')
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return d.toISOString().slice(0, 10)
}

function seance(
  classeId: string,
  classeNom: string,
  date: string,
  debut: string,
  fin: string,
  champs: Partial<Seance> & { statut: StatutSeance },
): Seance {
  const jour = new Date(date + 'T12:00:00').getDay()
  const slotId = `${jour}|${debut}|${fin}`
  return {
    id: `${classeId}|${lundi(date)}|${slotId}`,
    classeId,
    classeNom,
    wkey: lundi(date),
    slotId,
    date,
    debut,
    fin,
    salle: 'B12',
    module: 'A1',
    moduleLabel: 'Module A1 — rythmes de vie',
    seance: 'Séance 3',
    phase: 'Apports',
    objectif: '',
    remise: '',
    memo: '',
    ...champs,
  }
}

export function snapshotDemo(): Snapshot {
  const aujourdhui = jourIso(0)

  return {
    version: VERSION_CONTRAT,
    majA: new Date().toISOString(),
    poste: 'Poste de démonstration',
    date: aujourdhui,
    capacites: { projection: true, progression: true, agenda: true, actions: true },

    projection: {
      fenetreOuverte: true,
      coursTitre: 'Le sommeil et le rythme biologique',
      classeNom: 'Groupe A',
      etape: 2,
      nbEtapes: 8,
      corrigeVisible: false,
      corrigeDisponible: true,
      focus: false,
      sommaire: [
        { idx: 0, label: 'Question 1 — repérer', corrigeDisponible: true },
        { idx: 1, label: 'Question 2 — expliquer', corrigeDisponible: true },
        { idx: 2, label: 'Question 3 — analyser le document', corrigeDisponible: true },
        { idx: 3, label: 'Question 4 — comparer', corrigeDisponible: true },
        { idx: 4, label: 'Question 5 — justifier', corrigeDisponible: false },
        { idx: 5, label: 'Question 6 — proposer', corrigeDisponible: true },
        { idx: 6, label: 'Question 7 — conclure', corrigeDisponible: true },
        { idx: 7, label: 'Bilan de séance', corrigeDisponible: false },
      ],
      documents: [
        { idx: 0, label: 'Document 1 — courbe du sommeil', visible: true },
        { idx: 1, label: 'Document 2 — témoignages', visible: true },
        { idx: 2, label: 'Document 3 — repères horaires', visible: false },
      ],
    },

    journee: [
      { id: 'ev:1', type: 'cours', debut: '08:00', fin: '09:00', titre: 'PSE — Groupe A', lieu: 'B12', classeNom: 'Groupe A', statut: 'Fait' },
      { id: 'ev:2', type: 'cours', debut: '10:00', fin: '12:00', titre: 'PSE — Groupe C', lieu: 'B12', classeNom: 'Groupe C', statut: 'En cours' },
      { id: 'ev:3', type: 'evenement', debut: '13:00', fin: '14:00', titre: 'Réunion d’équipe', lieu: 'Salle des profs', classeNom: '', statut: '' },
      { id: 'ev:4', type: 'cours', debut: '14:00', fin: '15:00', titre: 'PSE — Groupe B', lieu: 'B14', classeNom: 'Groupe B', statut: 'Prévu' },
    ],

    seances: [
      seance('cl-01', 'Groupe A', aujourdhui, '08:00', '09:00', {
        statut: 'Fait',
        objectif: 'Repérer les rythmes biologiques',
        remise: 'fait',
      }),
      seance('cl-03', 'Groupe C', aujourdhui, '10:00', '12:00', {
        statut: 'En cours',
        objectif: 'Analyser une courbe de sommeil',
        remise: 'a_faire',
        memo: '',
      }),
      seance('cl-02', 'Groupe B', aujourdhui, '14:00', '15:00', {
        statut: 'Prévu',
        module: 'A2',
        moduleLabel: 'Module A2 — alimentation',
        seance: 'Séance 1',
        objectif: 'Introduire l’équilibre alimentaire',
        salle: 'B14',
      }),
      seance('cl-01', 'Groupe A', jourIso(1), '08:00', '09:00', {
        statut: 'Prévu',
        seance: 'Séance 4',
        objectif: 'Conclure sur les repères horaires',
      }),
      seance('cl-04', 'Groupe D', jourIso(-1), '09:00', '10:00', {
        statut: 'À terminer',
        module: 'B2',
        moduleLabel: 'Module B2 — risques au poste',
        seance: 'Séance 2',
        objectif: 'Repérer les situations dangereuses',
        memo: 'Arrêté question 4, document 3 non fini',
        salle: 'Atelier',
      }),
    ],

    classes: [
      { id: 'cl-01', nom: 'Groupe A', diplome: 'CAP', effectif: 14 },
      { id: 'cl-02', nom: 'Groupe B', diplome: 'CAP', effectif: 12 },
      { id: 'cl-03', nom: 'Groupe C', diplome: 'Bac pro', effectif: 24 },
      { id: 'cl-04', nom: 'Groupe D', diplome: 'Bac pro', effectif: 21 },
    ],

    actions: [
      { id: 'a-01', texte: 'Photocopier le document 3 pour le Groupe C', echeance: aujourdhui, statut: 'a_faire', retard: false },
      { id: 'a-02', texte: 'Préparer l’évaluation du module A2', echeance: jourIso(4), statut: 'a_faire', retard: false },
      { id: 'a-03', texte: 'Relancer le service de reprographie', echeance: jourIso(-3), statut: 'a_faire', retard: true },
      { id: 'a-04', texte: 'Envoyer la progression au coordonnateur', echeance: jourIso(-5), statut: 'fait', retard: false },
    ],
  }
}
