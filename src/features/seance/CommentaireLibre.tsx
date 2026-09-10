import { useId, useState } from 'react'
import Button from '../../components/ui/Button'
import { useBridge } from '../../hooks/useBridge'
import { useHorloge } from '../../hooks/useHorloge'
import { VERSION_CONTRAT, type Command, type Seance } from '../../services/bridge/types'
import styles from './CommentaireLibre.module.css'

type Brouillon = { texte: string; commande: Command | null }

export default function CommentaireLibre({ code, membre }: { code: string; membre?: Seance }) {
  const { snapshot, session, commandes, envoyer, status } = useBridge()
  const maintenant = useHorloge(1000).getTime()
  const id = useId()
  // Session, seance et eleve separes, sans conserver de texte dans le navigateur apres rechargement.
  const cle = JSON.stringify([session?.uid, snapshot?.deviceId, membre?.classeId, membre?.id, code])
  const [brouillons, setBrouillons] = useState<Record<string, Brouillon>>({})
  const brouillon = brouillons[cle] ?? { texte: '', commande: null }
  const retour = brouillon.commande ? commandes.find(c => c.id === brouillon.commande!.id) ?? brouillon.commande : null
  const attente = !!retour && ['en_attente', 'envoyee', 'en_cours'].includes(retour.statut) && maintenant <= Date.parse(retour.expiresAt ?? retour.creeeA) + 10_000
  const confirme = retour?.statut === 'appliquee'
  const echec = retour && !attente && !confirme
  const texte = confirme ? '' : brouillon.texte
  const age = maintenant - Date.parse(snapshot?.majA ?? '')
  const codeValide = !!membre && !!snapshot?.classes.find(c => c.id === membre.classeId)?.codes.includes(code)
  const dispo = status === 'online' && snapshot?.version === VERSION_CONTRAT && !!snapshot.deviceId && age >= -5000 && age <= 90_000 && snapshot.capacites.progression && codeValide
  if (!code) return null
  if (!membre) return <p role="alert">Classe de cet élève ambiguë. Choisis une séance avec une seule classe.</p>

  return <form className={styles.formulaire} onSubmit={e => {
    e.preventDefault()
    if (!dispo || attente || !texte.trim() || texte.length > 2000) return
    const commande = envoyer('eleve.besoins', {
      seanceId: membre.id, classeId: membre.classeId, code, date: membre.date,
      besoins: '[]', amenagements: '[]', note: texte.trim(),
    })
    setBrouillons(tous => ({ ...tous, [cle]: { texte, commande } }))
  }}>
    <label htmlFor={id}><strong>Commentaire libre</strong><span>{code} · {membre.classeNom}</span></label>
    <textarea id={id} rows={3} value={texte} maxLength={2000} disabled={attente}
      onChange={e => setBrouillons(tous => ({ ...tous, [cle]: { texte: e.target.value, commande: null } }))} />
    <Button type="submit" variante="principal" pleineLargeur disabled={!dispo || attente || !texte.trim()}>
      {attente ? 'Enregistrement…' : 'Enregistrer le commentaire'}
    </Button>
    {confirme && <p role="status" className={styles.succes}>Commentaire enregistré dans Electron.</p>}
    {echec && <p role="alert" className={styles.erreur}>{retour.erreur || 'Enregistrement non confirmé. Vérifie dans Electron avant de réessayer.'}</p>}
    {!dispo && <p role="status">Liaison indisponible. Ton texte reste dans ce champ.</p>}
  </form>
}
