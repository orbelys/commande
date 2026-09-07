import { VERSION_CONTRAT, type Snapshot, type Command, type CommandPayload, type CommandType } from './types'

const LIBELLES: Record<CommandType, string> = {
  'projection.ouvrir': 'Ouvrir la fenêtre élèves',
  'projection.etape.suivante': 'Étape suivante',
  'projection.etape.precedente': 'Étape précédente',
  'projection.etape.aller': 'Aller à une étape',
  'projection.corrige.basculer': 'Afficher / masquer le corrigé',
  'projection.focus.basculer': 'Mode focus',
  'projection.document.afficher': 'Afficher / masquer un document',
  'projection.minuteur.demarrer': 'Lancer le minuteur',
  'projection.minuteur.pause': 'Mettre le minuteur en pause',
  'projection.minuteur.reprendre': 'Reprendre le minuteur',
  'projection.minuteur.arreter': 'Arrêter le minuteur',
  'projection.roue.tourner': 'Tourner la roue',
  'projection.roue.reinitialiser': 'Réinitialiser la roue',
  'projection.roue.cacher': 'Cacher la roue',
  'seance.statut': 'Changer le statut de la séance',
  'seance.remise': 'Marquer la remise du support',
  'seance.memo': 'Écrire le mémo de reprise',
  'seance.absents': 'Pointer les absents',
  'classe.rattrape': 'Marquer un support rattrapé',
  'action.creer': 'Créer une action',
  'action.terminer': 'Terminer une action',
  'note.rapide': 'Note rapide',
}

function nouvelId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `cmd_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`
}

/** Fabrique une commande complète, prête à être envoyée et tracée. */
export function createCommand(type: CommandType, payload: CommandPayload = {}, snapshot?: Snapshot | null): Command {
  const command: Command = {
    id: nouvelId(),
    type,
    libelle: LIBELLES[type],
    payload,
    creeeA: new Date().toISOString(),
    statut: 'en_attente',
    protocol: VERSION_CONTRAT,
    deviceId: snapshot?.deviceId ?? '',
    projectionSessionId: snapshot?.projection?.sessionId ?? '',
    expiresAt: new Date(Date.now() + (type.startsWith('projection.') ? 20_000 : 300_000)).toISOString(),
  }
  if (type.startsWith('projection.') && snapshot?.projection) command.expected = snapshot.projection.etape
  const seance = snapshot?.seances.find(s => s.id === payload.seanceId)
  if (seance && type.startsWith('seance.')) {
    const field = type.split('.')[1] as 'statut' | 'remise' | 'memo' | 'absents'
    command.expected = field === 'absents' ? [...seance.absents].sort().join(',') : seance[field]
  }
  if (type === 'projection.corrige.basculer') command.payload = { ...payload, visible: !snapshot?.projection?.corrigeVisible }
  if (type === 'projection.focus.basculer') command.payload = { ...payload, visible: !snapshot?.projection?.focus }
  return command
}

export function libelleCommande(type: CommandType): string {
  return LIBELLES[type]
}
