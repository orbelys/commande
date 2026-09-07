import Badge from '../../components/ui/Badge'
import { useBridge } from '../../hooks/useBridge'
import styles from './Absents.module.css'

/**
 * Ce que la classe doit encore recevoir.
 * Toucher un code le retire de la liste : le support a été remis.
 */
export default function ARattraper({ classeId }: { classeId: string }) {
  const { snapshot, envoyer, status } = useBridge()
  const classe = snapshot?.classes.find((c) => c.id === classeId)
  const dispo = status === 'online' && (snapshot?.capacites.progression ?? false)
  const codes = classe?.aRattraper ?? []

  if (codes.length === 0) return null

  return (
    <>
      <p className={styles.compte}>
        <Badge ton="attention">{codes.length}</Badge> n’ont pas eu leur support. Touchez un code
        quand vous le lui remettez.
      </p>
      <div className={styles.grille}>
        {codes.map((code) => (
          <button
            key={code}
            type="button"
            className={styles.code}
            disabled={!dispo}
            onClick={() => envoyer('classe.rattrape', { classeId, code })}
          >
            {code} ✓
          </button>
        ))}
      </div>
    </>
  )
}
