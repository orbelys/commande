import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { useBridge } from '../../hooks/useBridge'
import { useHorloge } from '../../hooks/useHorloge'
import { mmss } from '../../lib/seances'
import type { Minuteur as EtatMinuteur } from '../../services/bridge/types'
import styles from './Minuteur.module.css'

const DUREES = [
  { s: 30, t: '30 s' },
  { s: 60, t: '1 min' },
  { s: 120, t: '2 min' },
  { s: 180, t: '3 min' },
  { s: 300, t: '5 min' },
  { s: 600, t: '10 min' },
]

/**
 * Minuteur projeté à l'écran des élèves.
 * L'ordinateur publie son état toutes les 2 secondes ; entre deux publications
 * on décompte localement pour que l'affichage reste fluide.
 */
export default function Minuteur({ etat, dispo }: { etat: EtatMinuteur | undefined; dispo: boolean }) {
  const { envoyer } = useBridge()
  useHorloge(1000)

  if (!etat) {
    return (
      <Card titre="Minuteur">
        <p className={styles.absent}>
          Le minuteur sera disponible après la prochaine mise à jour de l’ordinateur.
        </p>
      </Card>
    )
  }

  const enMarche = etat.actif && !etat.enPause

  return (
    <Card
      titre="Minuteur"
      action={
        etat.actif ? (
          <Badge ton={etat.enPause ? 'attention' : 'live'}>
            {etat.enPause ? 'En pause' : 'En cours'}
          </Badge>
        ) : undefined
      }
    >
      {etat.actif && <p className={styles.compteur}>{mmss(etat.restant)}</p>}

      <div className={styles.durees}>
        {DUREES.map((d) => (
          <Button
            key={d.s}
            taille="sm"
            variante="doux"
            disabled={!dispo}
            onClick={() => envoyer('projection.minuteur.demarrer', { secondes: d.s })}
          >
            {d.t}
          </Button>
        ))}
      </div>

      {etat.actif && (
        <div className={styles.controles}>
          <Button
            variante="doux"
            icone={enMarche ? '❚❚' : '▶'}
            disabled={!dispo}
            onClick={() =>
              envoyer(enMarche ? 'projection.minuteur.pause' : 'projection.minuteur.reprendre')
            }
          >
            {enMarche ? 'Pause' : 'Reprendre'}
          </Button>
          <Button
            variante="danger"
            icone="■"
            disabled={!dispo}
            onClick={() => envoyer('projection.minuteur.arreter')}
          >
            Arrêter
          </Button>
        </div>
      )}
    </Card>
  )
}
