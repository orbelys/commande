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

type Domaine = { t: string; d: string; ic: string; items: string[] }

/* Les 8 domaines de l'outil AESH d'observation de l'autonomie — repris à
   l'identique pour rester cohérent avec ce que l'équipe utilise déjà. */
const DOMAINES: Domaine[] = [
  {
    t: 'Comprendre / consignes',
    d: 'orale, écrite, reformuler',
    ic: '💬',
    items: [
      'Comprend la consigne orale',
      'Comprend la consigne écrite',
      "Reformule ce qu'il faut faire",
      "Demande de l'aide à bon escient",
    ],
  },
  {
    t: 'Entrer dans la tâche',
    d: 'démarrer, oser',
    ic: '🚀',
    items: ['Démarre seul', "Attend l'adulte pour commencer", "Sait ce qu'il faut faire", 'Accepte la tâche'],
  },
  {
    t: 'Attention',
    d: 'tenir, filtrer',
    ic: '🎯',
    items: ['Reste concentré', 'Se disperse / décroche', 'Tient dans la durée', 'Gère le bruit ambiant'],
  },
  {
    t: 'Organisation / matériel',
    d: 'préparer, planifier',
    ic: '🧰',
    items: ['Prépare son poste / matériel', 'Suit les étapes', 'Gère son temps', 'Range et nettoie'],
  },
  {
    t: 'Réaliser le travail',
    d: 'faire, contrôler',
    ic: '🛠️',
    items: ['Réalise la tâche', 'Gestes techniques (atelier)', 'Contrôle son travail', 'Transfère à une situation voisine'],
  },
  {
    t: 'Sécurité en atelier',
    d: 'EPI, gestes sûrs',
    ic: '🦺',
    items: ['Respecte les consignes de sécurité', 'Porte ses EPI', 'Gestes sûrs sur machine / poste', 'Signale un problème'],
  },
  {
    t: 'Relations / comportement',
    d: 'cadre, coopérer',
    ic: '🤝',
    items: ['Respecte le cadre', 'Coopère avec les autres', "Gère la frustration / l'échec", 'Relation aux adultes'],
  },
  {
    t: 'Autonomie globale',
    d: 'le cœur du bilan',
    ic: '🧭',
    items: ['Démarre seul', 'Poursuit sans relance', 'Sollicite à bon escient', 'Termine et vérifie seul'],
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

/* Mémoire de SESSION : ce qui a déjà été relevé, par séance + code. Survit à la
   fermeture / réouverture de la fiche (pas au rechargement de l'app). Sert à
   montrer « déjà cliqué » (pastille + cases cochées au retour) et à additionner
   par cours — comme l'outil AESH d'observation. */
type Retenu = { b: Set<string>; a: Set<string>; note: string; n: number }
const RETENUS = new Map<string, Retenu>()

export default function Besoins({ seance }: { seance: Seance }) {
  const { snapshot, envoyer, status } = useBridge()
  const dispo = status === 'online' && (snapshot?.capacites.progression ?? false)
  const classe = snapshot?.classes.find((c) => c.id === seance.classeId)
  const codes = classe?.codes ?? []

  const cle = (code: string) => `${seance.id}|${code}`
  const [actif, setActif] = useState<string | null>(null)
  const [besoins, setBesoins] = useState<Set<string>>(new Set())
  const [amenagements, setAmenagements] = useState<Set<string>>(new Set())
  const [note, setNote] = useState('')
  const [, forcer] = useState(0) // rafraîchit les pastilles après un enregistrement

  const rien = besoins.size === 0 && amenagements.size === 0 && note.trim() === ''
  const compteCode = (code: string) => { const r = RETENUS.get(cle(code)); return r ? r.b.size + r.a.size : 0 }
  const elevesNotes = codes.filter((c) => compteCode(c) > 0).length
  const dejaRetenu = actif ? RETENUS.get(cle(actif)) : undefined

  function ouvrir(code: string) {
    const r = RETENUS.get(cle(code))
    setBesoins(new Set(r?.b ?? []))
    setAmenagements(new Set(r?.a ?? []))
    setNote(r?.note ?? '')
    setActif(code)
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
    // mémoire de session : on retient pour montrer « déjà cliqué » et additionner
    RETENUS.set(cle(actif), {
      b: new Set(besoins),
      a: new Set(amenagements),
      note: note.trim(),
      n: (RETENUS.get(cle(actif))?.n ?? 0) + 1,
    })
    forcer((x) => x + 1)
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
        {codes.map((code) => {
          const n = compteCode(code)
          return (
            <button
              key={code}
              type="button"
              className={`${styles.code} ${actif === code ? styles.codeActif : ''} ${n > 0 ? styles.codeNote : ''}`}
              onClick={() => (actif === code ? fermer() : ouvrir(code))}
              disabled={!dispo}
              aria-pressed={actif === code}
            >
              {code}
              {n > 0 && <span className={styles.pastille}>{n}</span>}
            </button>
          )
        })}
      </div>

      {elevesNotes > 0 && !actif && (
        <p className={styles.rien}>
          Ce cours : <b>{elevesNotes}</b> élève{elevesNotes > 1 ? 's' : ''} relevé{elevesNotes > 1 ? 's' : ''}. La pastille indique
          ce qui est déjà noté — touche à nouveau un code pour compléter. Tout s’ajoute dans la fiche élève, sur l’ordinateur.
        </p>
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
          {dejaRetenu && (
            <p className={styles.deja}>Déjà relevé ce cours ({dejaRetenu.n}×) — les cases cochées sont conservées. Complète, puis enregistre.</p>
          )}

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
