import type { Command, CommandPayload, CommandType } from './types'

const LIBELLES: Record<CommandType, string> = {
  'classe.selectionner': 'Sélectionner la classe',
  'cours.selectionner': 'Sélectionner le cours',
  'seance.demarrer': 'Démarrer la séance',
  'seance.etape.suivante': 'Étape suivante',
  'seance.etape.precedente': 'Étape précédente',
  'seance.pause.basculer': 'Pause / reprise',
  'seance.corrige.basculer': 'Afficher / masquer le corrigé',
  'seance.valider': 'Valider l’étape',
  'seance.enregistrer': 'Enregistrer la séance',
  'progression.marquer': 'Mettre à jour la progression',
  'document.ouvrir': 'Ouvrir le document',
}

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `cmd_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`
}

/** Fabrique une commande complete, prête à être envoyée et tracée. */
export function createCommand(type: CommandType, payload: CommandPayload = {}): Command {
  return {
    id: newId(),
    type,
    libelle: LIBELLES[type],
    payload,
    creeeA: new Date().toISOString(),
    statut: 'en_attente',
  }
}

export function libelleCommande(type: CommandType): string {
  return LIBELLES[type]
}
