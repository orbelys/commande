import type { Snapshot } from '../services/bridge/types'

/**
 * Donnees ENTIÈREMENT FICTIVES, utilisées uniquement pour la démonstration
 * hors ligne. Aucun élève réel, aucune donnée personnelle.
 */

function jour(decalage: number): string {
  const d = new Date()
  d.setDate(d.getDate() + decalage)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

export function snapshotDemo(): Snapshot {
  return {
    majA: new Date().toISOString(),
    appareil: 'Poste de démonstration',
    seance: {
      coursId: 'c-01',
      classeId: 'cl-01',
      etape: 3,
      demarreeA: new Date(Date.now() - 22 * 60_000).toISOString(),
      enPause: false,
      corrigeVisible: false,
    },
    classes: [
      { id: 'cl-01', nom: 'Groupe A', niveau: 'CAP 1re année', effectif: 14 },
      { id: 'cl-02', nom: 'Groupe B', niveau: 'CAP 2e année', effectif: 12 },
      { id: 'cl-03', nom: 'Groupe C', niveau: 'Seconde', effectif: 24 },
      { id: 'cl-04', nom: 'Groupe D', niveau: 'Première', effectif: 21 },
    ],
    cours: [
      { id: 'c-01', titre: 'Le sommeil et le rythme biologique', module: 'Module A1', classeId: 'cl-01', nbEtapes: 8, duree: 55 },
      { id: 'c-02', titre: 'Alimentation et équilibre', module: 'Module A2', classeId: 'cl-01', nbEtapes: 6, duree: 55 },
      { id: 'c-03', titre: 'Les conduites addictives', module: 'Module A3', classeId: 'cl-02', nbEtapes: 7, duree: 55 },
      { id: 'c-04', titre: 'Prévention des risques au poste', module: 'Module B2', classeId: 'cl-03', nbEtapes: 9, duree: 110 },
      { id: 'c-05', titre: 'Gestes de premiers secours', module: 'Module C1', classeId: 'cl-04', nbEtapes: 5, duree: 55 },
    ],
    progression: [
      { id: 'p-01', classeId: 'cl-01', intitule: 'Module A1 — sommeil', statut: 'en_cours', date: jour(0) },
      { id: 'p-02', classeId: 'cl-01', intitule: 'Module A2 — alimentation', statut: 'a_venir', date: jour(7) },
      { id: 'p-03', classeId: 'cl-02', intitule: 'Module A3 — addictions', statut: 'fait', date: jour(-6) },
      { id: 'p-04', classeId: 'cl-03', intitule: 'Module B2 — risques', statut: 'en_cours', date: jour(1) },
      { id: 'p-05', classeId: 'cl-04', intitule: 'Module C1 — secours', statut: 'a_venir', date: jour(12) },
    ],
    documents: [
      { id: 'd-01', titre: 'Fiche de révision — sommeil', type: 'fiche', classeId: 'cl-01', maj: jour(-2) },
      { id: 'd-02', titre: 'Évaluation A2 — équilibre alimentaire', type: 'evaluation', classeId: 'cl-01', maj: jour(-9) },
      { id: 'd-03', titre: 'Cours complet — addictions', type: 'cours', classeId: 'cl-02', maj: jour(-14) },
      { id: 'd-04', titre: 'Ressource — schéma du poste de travail', type: 'ressource', classeId: null, maj: jour(-30) },
    ],
  }
}
