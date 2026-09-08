import { Link } from 'react-router-dom'
import Card from '../../components/ui/Card'
import PageHeader from '../../components/ui/PageHeader'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import { useBridge } from '../../hooks/useBridge'
import styles from './ClassesPage.module.css'

export default function ClassesPage() {
  const { snapshot } = useBridge()
  const classes = snapshot?.classes ?? []
  const seances = snapshot?.seances ?? []

  return (
    <>
      <PageHeader titre="Classes" detail="Touchez une classe pour voir ses codes élèves" />

      <Card padding={false}>
        {classes.length === 0 ? (
          <EmptyState titre="Aucune classe" detail="Les classes viennent de la Suite PSE." />
        ) : (
          classes.map((c, i) => {
            const aVenir = seances.filter((s) => s.classeId === c.id && s.statut === 'Prévu').length
            const codes = c.codes ?? []
            return (
              <details className={styles.classe} key={c.id} open={i === 0}>
                <summary>
                  <span className={styles.tete}>
                    <span className={styles.nom}>{c.nom}</span>
                    <span className={styles.sous}>
                      {c.diplome} · {c.effectif} élèves · {codes.length} code(s) · {aVenir} séance(s) à venir
                    </span>
                  </span>
                  {c.aRattraper.length > 0 && (
                    <Badge ton="attention">{c.aRattraper.length} à rattraper</Badge>
                  )}
                  <span className={styles.chev} aria-hidden="true">›</span>
                </summary>
                <div className={styles.corps}>
                  <p className={styles.label}>Codes élèves</p>
                  {codes.length === 0 ? (
                    <p className={styles.vide}>
                      Aucun code publié. Ils viennent du fichier <code>codes_eleves_mapse</code> de la Suite PSE.
                    </p>
                  ) : (
                    <>
                      <div className={styles.grille}>
                        {codes.map((code) => (
                          <span
                            key={code}
                            className={`${styles.code} ${c.aRattraper.includes(code) ? styles.dette : ''}`}
                          >
                            {code}
                          </span>
                        ))}
                      </div>
                      {c.aRattraper.length > 0 && (
                        <p className={styles.legende}>
                          <b>En orange</b> : un support en attente de rattrapage.
                        </p>
                      )}
                    </>
                  )}
                </div>
              </details>
            )
          })
        )}
      </Card>

      <p className={styles.note}>
        Les codes sont des pseudonymes — les mêmes que sur les documents distribués. Aucun nom
        d’élève ne circule jusqu’au téléphone. Pour agir sur une séance, passez par la{' '}
        <Link to="/progression">progression</Link>.
      </p>
    </>
  )
}
