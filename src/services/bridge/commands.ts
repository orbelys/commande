import type { Command, CommandPayload, CommandType } from './types'

const LIBELLES: Record<CommandType, string> = {
  'projection.ouvrir': 'Ouvrir la fenêtre élèves',
  'projection.etape.suivante': 'Étape suivante',
  'projection.etape.precedente': 'Étape précédente',
  'projection.etape.aller': 'Aller à une étape',
  'projection.corrige.basculer': 'Afficher / masquer le corrigé',
  'projection.focus.basculer': 'Mode focus',
  'projection.document.afficher': 'Afficher / masquer un document',
  'seance.statut': 'Changer le statut de la séance',
  'seance.remise': 'Marquer la remise du support',
  'seance.memo': 'Écrire le mémo de reprise',
  'action.creer': 'Créer une action',
  'action.terminer': 'Terminer une action',
  'note.rapide': 'Note rapide',
}

function nouvelId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `cmd_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`
}

/** Fabrique une commande complète, prête à être envoyée et tracée. */
export function createCommand(type: CommandType, payload: CommandPayload = {}): Command {
  return {
    id: nouvelId(),
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
