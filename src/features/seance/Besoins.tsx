import { useMemo, useState } from 'react'
import Button from '../../components/ui/Button'
import { useBridge } from '../../hooks/useBridge'
import type { Seance } from '../../services/bridge/types'
import styles from './Besoins.module.css'

/**
 * Relevé des besoins d'un élève — par code, jamais par nom.
 * On touche un code, on coche ce qu'on observe (par domaine) et les
 * aménagements à préparer, on ajoute un commentaire, on enregistre.
 *
 * Le téléphone n'écrit qu'une commande : rien n'est rapatrié ni affiché en
 * retour ici (aucune donnée sensible ne redescend). La consultation se fait
 * dans la Suite PSE, espace « Classes & élèves ». Ce relevé ne valide rien,
 * ne publie rien et ne modifie aucune fiche : il note, c'est tout.
 */

type Domaine = { t: string; ic: string; items: string[] }

const DOMAINES: Domaine[] = [
  {
    t: 'Relation aux apprentissages',
    ic: '📚',
    items: [
      'Comprendre la consigne',
      'Lire / déchiffrer',
      'Vocabulaire de la matière',
      'Transférer à une situation voisine',
      'Planifier les étapes',
      'Se décider / choisir',
      'Contrôler son travail',
    ],
  },
  {
    t: 'Cognitif — attention & mémoire',
    ic: '🧠',
    items: [
      "Fixer / tenir l'attention",
      'Mémoriser',
      "Lenteur d'exécution",
      'Se repérer dans le temps',
      'Se repérer dans l’espace',
      'Organiser son travail',
    ],
  },
  {
    t: 'Psycho-affectif — s’engager',
    ic: '💪',
    items: [
      'Se lancer seul',
      'Persévérer / ne pas abandonner',
      "Gérer l'anxiété / la frustration",
      'Confiance en soi / oser',
      "Accepter l'erreur",
    ],
  },
  {
    t: 'Socio-affectif — cadre & relations',
    ic: '🤝',
    items: [
      'Respecter les règles',
      'Relation aux adultes',
      'Relation aux pairs',
      'Gérer un conflit',
      'Accepter les consignes',
    ],
  },
  {
    t: 'Sensori-moteur — geste & perception',
    ic: '✋',
    items: [
      'Écriture / graphisme',
      'Motricité fine (découper, manipuler)',
      "Vision (se penche, s'approche)",
      'Audition / bruit',
      'Fatigabilité / posture',
    ],
  },
]

const AMENAGEMENTS: string[] = [
  'Texte à trous',
  'Interlignes agrandis',
  'Police adaptée',
  'Support allégé',
  'Une consigne à la fois',
  'Consignes fractionnées',
  'Consigne lue à voix haute',
  'Reformuler / exemple',
  'Plus de temps',
  'Cache / fenêtre de lecture',
  'Couleur / surlignage',
  'Plan de travail visuel',
  'Aide d’un pair',
  'Valoriser / encourager',
  'Place adaptée (devant, au calme)',
]

export default function Besoins({ seance }: { seance: Seance }) {
  const { snapshot, envoyer, status } = useBridge()
  const dispo = status === 'online' && (snapshot?.capacites.progression ?? false)
  const classe = snapshot?.classes.find((c) => c.id === seance.classeId)
  const codes = classe?.codes ?? []

  const [actif, setActif] = useState<string | null>(null)
  const [besoins, setBesoins] = useState<Set<string>>(new Set())
  const [amenagements, setAmenagements] = useState<Set<string>>(new Set())
  const [note, setNote] = useState('')
  const [confirme, setConfirme] = useState<string | null>(null)

  const rien = besoins.size === 0 && amenagements.size === 0 && note.trim() === ''

  function ouvrir(code: string) {
    setActif(code)
    setBesoins(new Set())
    setAmenagements(new Set())
    setNote('')
    setConfirme(null)
  }
  function fermer() {
    setActif(null)
  }
  function basculer(set: Set<string>, cle: string, maj: (s: Set<string>) => void) {
    const suivant = new Set(set)
    if (suivant.has(cle)) suivant.delete(cle)
    else suivant.add(cle)
    maj(suivant)
  }

  const parDomaine = useMemo(
    () => DOMAINES.map((_, i) => [...besoins].filter((k) => k.startsWith(`${i}|`)).length),
    [besoins],
  )

  function enregistrer() {
    if (!actif || rien) return
    const liste = [...besoins].map((cle) => {
      const [di, ...reste] = cle.split('|')
      return { domaine: DOMAINES[Number(di)]?.t ?? '', item: reste.join('|') }
    })
    envoyer('eleve.besoins', {
      seanceId: seance.id,
      classeId: seance.classeId,
      code: actif,
      date: seance.date,
      besoins: JSON.stringify(liste),
      amenagements: JSON.stringify([...amenagements]),
      note: note.trim(),
    })
    setConfirme(actif)
    setActif(null)
  }

  if (codes.length === 0) {
    return (
      <p className={styles.absent}>
        Aucun code élève publié pour cette classe. Les codes viennent du fichier
        <code> codes_eleves_mapse </code> de la Suite PSE.
      </p>
    )
  }

  return (
    <>
      <div className={styles.grille}>
        {codes.map((code) => (
          <button
            key={code}
            type="button"
            className={`${styles.code} ${actif === code ? styles.codeActif : ''}`}
            onClick={() => (actif === code ? fermer() : ouvrir(code))}
            disabled={!dispo}
            aria-pressed={actif === code}
          >
            {code}
          </button>
        ))}
      </div>

      {confirme && !actif && (
        <p className={styles.rien}>Relevé envoyé pour {confirme}. Il apparaîtra dans la fiche élève, sur l’ordinateur.</p>
      )}

      {actif && (
        <div className={styles.editeur}>
          <div className={styles.tete}>
            <span className={styles.code}>{actif}</span>
            <span className={styles.cl}>
              {seance.classeNom} · {[seance.moduleLabel || seance.module, seance.seance].filter(Boolean).join(' · ')}
            </span>
          </div>
          <div className={styles.rgpd}>🔒 Code seul — aucun nom, aucune donnée médicale. Note ce que tu observes, ça n’est qu’un relevé.</div>

          <div className={styles.slab}>
            <span className={styles.pt} style={{ background: 'var(--c-accent)' }} />
            Besoins repérés
            <span className={`${styles.cnt} ${styles.cntB}`}>{besoins.size}</span>
          </div>

          {DOMAINES.map((d, i) => (
            <details className={styles.dom} key={d.t} open={i === 0}>
              <summary>
                <span className={styles.ic}>{d.ic}</span>
                {d.t}
                <span className={`${styles.badge} ${parDomaine[i] > 0 ? styles.on : ''}`}>{parDomaine[i]}</span>
                <span className={styles.chev}>›</span>
              </summary>
              <div className={styles.corps}>
                <div className={styles.puces}>
                  {d.items.map((item) => {
                    const cle = `${i}|${item}`
                    const on = besoins.has(cle)
                    return (
                      <button
                        key={item}
                        type="button"
                        className={`${styles.puce} ${on ? styles.puceB : ''}`}
                        onClick={() => basculer(besoins, cle, setBesoins)}
                        aria-pressed={on}
                      >
                        {item}
                      </button>
                    )
                  })}
                </div>
              </div>
            </details>
          ))}

          <div className={styles.slab}>
            <span className={styles.pt} style={{ background: 'var(--c-ok)' }} />
            Aménagements à préparer
            <span className={`${styles.cnt} ${styles.cntA}`}>{amenagements.size}</span>
          </div>
          <div className={styles.puces}>
            {AMENAGEMENTS.map((item) => {
              const on = amenagements.has(item)
              return (
                <button
                  key={item}
                  type="button"
                  className={`${styles.puce} ${on ? styles.puceA : ''}`}
                  onClick={() => basculer(amenagements, item, setAmenagements)}
                  aria-pressed={on}
                >
                  {item}
                </button>
              )
            })}
          </div>

          <div className={styles.slab}>Commentaire</div>
          <textarea
            className={styles.note}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ex. : activité 2 → texte à trous + consigne lue à voix haute."
          />

          <div className={styles.duo}>
            <Button variante="doux" onClick={fermer}>
              Annuler
            </Button>
            <Button variante="principal" disabled={!dispo || rien} onClick={enregistrer}>
              Enregistrer le relevé
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
