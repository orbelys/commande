import { useEffect, useRef, useState } from 'react'
import { Plus, X } from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import { useBridge } from '../../hooks/useBridge'
import { useHorloge } from '../../hooks/useHorloge'
import { dateCourte } from '../../lib/format'
import { VERSION_CONTRAT, type Command } from '../../services/bridge/types'
import styles from './ActionsCard.module.css'

export default function ActionsCard() {
  const { snapshot, envoyer, status, commandes } = useBridge()
  const maintenant = useHorloge(1000).getTime()
  const age = maintenant - Date.parse(snapshot?.majA ?? '')
  const dispo = status === 'online' && snapshot?.version === VERSION_CONTRAT && !!snapshot.deviceId && age >= -5000 && age <= 90_000 && snapshot.capacites.actions
  const [formulaire, setFormulaire] = useState(false)
  const [texte, setTexte] = useState('')
  const [date, setDate] = useState('')
  const [creation, setCreation] = useState<Command | null>(null)
  const [modifications, setModifications] = useState<Record<string, Command>>({})
  const [message, setMessage] = useState('')
  const saisie = useRef<HTMLTextAreaElement>(null)
  const resultat = (commande: Command) => commandes.find(c => c.id === commande.id) ?? commande
  const enAttente = (commande: Command) => ['en_attente', 'envoyee', 'en_cours'].includes(commande.statut) && maintenant <= Date.parse(commande.expiresAt ?? commande.creeeA) + 10_000
  const retour = creation ? resultat(creation) : null
  const attendCreation = retour !== null && enAttente(retour)
  const erreurCreation = retour && !attendCreation && retour.statut !== 'appliquee'
  const actions = snapshot?.actions ?? []
  const ouvertes = actions.filter(a => a.statut === 'a_faire')
  const terminees = actions.filter(a => a.statut === 'fait')

  useEffect(() => { if (formulaire) saisie.current?.focus() }, [formulaire])
  useEffect(() => {
    if (retour?.statut !== 'appliquee') return
    setCreation(null); setTexte(''); setDate(''); setFormulaire(false); setMessage('Tâche ajoutée.')
  }, [retour?.statut])

  function ligne(a: typeof actions[number]) {
    const commande = modifications[a.id] ? resultat(modifications[a.id]) : null
    const attente = commande !== null && enAttente(commande)
    const erreur = commande && !attente && commande.statut !== 'appliquee'
    return <div key={a.id} className={styles.ligne}>
      <label className={styles.tache}>
        <input type="checkbox" checked={a.statut === 'fait'} disabled={!dispo || attente}
          aria-label={`${a.statut === 'fait' ? 'Remettre à faire' : 'Terminer'} : ${a.texte}`}
          onChange={e => {
            const c = envoyer('action.terminer', { actionId: a.id, fait: e.target.checked })
            setModifications(precedentes => ({ ...precedentes, [a.id]: c }))
          }} />
        <span><span className={a.statut === 'fait' ? styles.terminee : ''}>{a.texte}</span>
          <small>{a.echeance ? `Pour le ${dateCourte(a.echeance)}` : 'Sans échéance'}{a.retard && a.statut !== 'fait' ? ' · En retard' : ''}</small>
        </span>
      </label>
      {attente && <p role="status">Confirmation en cours…</p>}
      {erreur && <p role="alert" className={styles.erreur}>{commande.erreur || 'Modification non confirmée. Vérifie la tâche avant de réessayer.'}</p>}
    </div>
  }

  return (
    <Card titre="À faire" padding={false} action={
      <button type="button" className={styles.icone} aria-label="Ajouter une tâche" title="Ajouter une tâche" aria-expanded={formulaire}
        onClick={() => { setFormulaire(true); setMessage('') }}><Plus size={22} /></button>
    }>
      <div className={styles.corps}>
        {formulaire && <form className={styles.formulaire} onSubmit={e => {
          e.preventDefault()
          if (!dispo || attendCreation || !texte.trim()) return
          setMessage(''); setCreation(envoyer('action.creer', { texte: texte.trim(), echeance: date || null }))
        }}>
          <div className={styles.titreForm}><strong>Ajouter une tâche</strong>
            <button type="button" className={styles.icone} disabled={attendCreation} aria-label="Annuler" title="Annuler" onClick={() => setFormulaire(false)}><X size={20} /></button>
          </div>
          <label htmlFor="nouvelle-tache">À faire</label>
          <textarea ref={saisie} id="nouvelle-tache" value={texte} maxLength={500} required disabled={attendCreation} onChange={e => setTexte(e.target.value)} />
          <label htmlFor="echeance-tache">Échéance (facultative)</label>
          <input id="echeance-tache" type="date" value={date} disabled={attendCreation} onChange={e => setDate(e.target.value)} />
          <Button type="submit" variante="principal" pleineLargeur disabled={!dispo || !texte.trim() || attendCreation}>
            {attendCreation ? 'Enregistrement…' : 'Ajouter'}
          </Button>
          {erreurCreation && <p role="alert" className={styles.erreur}>{retour.erreur || 'Enregistrement non confirmé. Vérifie la liste avant de réessayer.'}</p>}
        </form>}
        {!dispo && <p className={styles.etat}>Ouvre Electron et rétablis la liaison pour enregistrer tes tâches.</p>}
        {message && <p role="status">{message}</p>}
        {ouvertes.length ? ouvertes.map(ligne) : <p className={styles.etat}>Rien en attente</p>}
        {terminees.length > 0 && <details className={styles.terminees}><summary>Terminées récemment ({terminees.length})</summary>{terminees.map(ligne)}</details>}
      </div>
    </Card>
  )
}
