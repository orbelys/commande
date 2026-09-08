import { useState } from 'react'
import { useBridge } from '../../hooks/useBridge'
import type { Seance } from '../../services/bridge/types'
import styles from './Besoins.module.css'

/**
 * Relevé des besoins d'un élève — portage fidèle de l'outil AESH d'observation
 * de l'autonomie. On touche un observable, on pose le NIVEAU 0→5 (le degré),
 * l'aide qui a fonctionné, ce qui se passe quand on retire l'aide, un fait
 * observé, et l'aménagement de support à préparer. Ça s'additionne par cours et
 * chaque observable garde sa marque « ✓ niveau ». Par code, jamais par nom.
 *
 * Le téléphone n'écrit qu'une commande : rien n'est rapatrié ici. La
 * consultation se fait dans la Suite PSE. Ce relevé ne valide rien, ne publie
 * rien, ne modifie aucune fiche.
 */

type Domaine = { t: string; d: string; ic: string; items: string[] }

/* Les 8 domaines de l'outil AESH — repris à l'identique. */
const DOMAINES: Domaine[] = [
  { t: 'Comprendre / consignes', d: 'orale, écrite, reformuler', ic: '💬',
    items: ['Comprend la consigne orale', 'Comprend la consigne écrite', "Reformule ce qu'il faut faire", "Demande de l'aide à bon escient"] },
  { t: 'Entrer dans la tâche', d: 'démarrer, oser', ic: '🚀',
    items: ['Démarre seul', "Attend l'adulte pour commencer", "Sait ce qu'il faut faire", 'Accepte la tâche'] },
  { t: 'Attention', d: 'tenir, filtrer', ic: '🎯',
    items: ['Reste concentré', 'Se disperse / décroche', 'Tient dans la durée', 'Gère le bruit ambiant'] },
  { t: 'Organisation / matériel', d: 'préparer, planifier', ic: '🧰',
    items: ['Prépare son poste / matériel', 'Suit les étapes', 'Gère son temps', 'Range et nettoie'] },
  { t: 'Réaliser le travail', d: 'faire, contrôler', ic: '🛠️',
    items: ['Réalise la tâche', 'Gestes techniques (atelier)', 'Contrôle son travail', 'Transfère à une situation voisine'] },
  { t: 'Sécurité en atelier', d: 'EPI, gestes sûrs', ic: '🦺',
    items: ['Respecte les consignes de sécurité', 'Porte ses EPI', 'Gestes sûrs sur machine / poste', 'Signale un problème'] },
  { t: 'Relations / comportement', d: 'cadre, coopérer', ic: '🤝',
    items: ['Respecte le cadre', 'Coopère avec les autres', "Gère la frustration / l'échec", 'Relation aux adultes'] },
  { t: 'Autonomie globale', d: 'le cœur du bilan', ic: '🧭',
    items: ['Démarre seul', 'Poursuit sans relance', 'Sollicite à bon escient', 'Termine et vérifie seul'] },
]

/* Le NIVEAU (degré) — échelle AESH 0→5. */
const SCALE = [
  { n: 0, l: 'autonome', x: 'Réalise seul, sans intervention.' },
  { n: 1, l: 'un rappel', x: 'Un rappel, un encouragement ou une vérification suffit.' },
  { n: 2, l: 'démarrage', x: 'Aide pour comprendre / démarrer, puis poursuit seul.' },
  { n: 3, l: 'ponctuelle', x: "Quelques interventions pendant l'activité." },
  { n: 4, l: 'régulière', x: "L'adulte doit intervenir fréquemment." },
  { n: 5, l: 'continu', x: 'Ne peut pas réaliser sans présence rapprochée.' },
]
const AIDES = ['Reformuler', 'Montrer un exemple', 'Découper en étapes', 'Support visuel', 'Lire la consigne', 'Démarrer avec lui', 'Plus de temps', 'Aide d’un pair', 'Geste guidé']
const APRES = ['Poursuit seul', 'Poursuit un temps', 'Redemande de l’aide', 'S’arrête', 'Abandonne']
const AMENAGEMENTS = ['Texte à trous', 'Interlignes agrandis', 'Police adaptée', 'Support allégé', 'Une consigne à la fois', 'Consignes fractionnées', 'Consigne lue à voix haute', 'Reformuler / exemple', 'Plus de temps', 'Cache / fenêtre de lecture', 'Couleur / surlignage', 'Plan de travail visuel', 'Aide d’un pair', 'Valoriser / encourager', 'Place adaptée (devant, au calme)']
/* Couleurs du degré, vert → rouge (mêmes teintes que l'échelle AESH). */
const AC = ['#1c9c62', '#5aa551', '#a79a34', '#d68a28', '#d5622a', '#bf3a33']

type Relief = { niveau: number; aides: string[]; amenagements: string[]; apres: string; note: string }
/* Mémoire de SESSION, par séance + code (survit à la fermeture de la fiche,
   pas au rechargement de l'app). Additionne par cours et montre « déjà noté ». */
const RETENUS = new Map<string, Record<string, Relief>>()

export default function Besoins({ membres }: { membres: Seance[] }) {
  const { snapshot, envoyer, status } = useBridge()
  const dispo = status === 'online' && (snapshot?.capacites.progression ?? false)
  const multi = membres.length > 1

  // Liste COMBINÉE des codes des classes co-enseignées ; chaque code sait à
  // quelle classe (donc quelle séance) il appartient.
  const parClasse = membres.map((m) => ({
    membre: m,
    classeNom: m.classeNom,
    codes: (snapshot?.classes.find((c) => c.id === m.classeId)?.codes ?? []),
  }))
  const membreOf: Record<string, Seance> = {}
  parClasse.forEach((b) => b.codes.forEach((c) => { membreOf[c] = b.membre }))
  const codes = parClasse.flatMap((b) => b.codes)
  const cle = (code: string) => `${(membreOf[code] || membres[0]).id}|${code}`

  const [actif, setActif] = useState<string | null>(null)
  const [sheet, setSheet] = useState<{ di: number; item: string } | null>(null)
  const [niveau, setNiveau] = useState<number | null>(null)
  const [aides, setAides] = useState<Set<string>>(new Set())
  const [amen, setAmen] = useState<Set<string>>(new Set())
  const [apres, setApres] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [, forcer] = useState(0)

  const savedOf = (code: string): Record<string, Relief> => RETENUS.get(cle(code)) ?? {}
  const compteCode = (code: string) => Object.keys(savedOf(code)).length
  const elevesNotes = codes.filter((c) => compteCode(c) > 0).length

  function ouvrirSheet(di: number, item: string) {
    const prev = actif ? savedOf(actif)[`${di}|${item}`] : undefined
    setNiveau(prev ? prev.niveau : null)
    setAides(new Set(prev?.aides ?? []))
    setAmen(new Set(prev?.amenagements ?? []))
    setApres(prev?.apres ?? null)
    setNote(prev?.note ?? '')
    setSheet({ di, item })
  }
  function toggle(set: Set<string>, v: string, maj: (s: Set<string>) => void) {
    const n = new Set(set)
    if (n.has(v)) n.delete(v)
    else n.add(v)
    maj(n)
  }

  function enregistrerObs() {
    if (!actif || !sheet || niveau == null) return
    const dom = DOMAINES[sheet.di]
    const membre = membreOf[actif] || membres[0]   // la classe à laquelle ce code appartient
    const rec = { ...savedOf(actif) }
    rec[`${sheet.di}|${sheet.item}`] = { niveau, aides: [...aides], amenagements: [...amen], apres: apres ?? '', note: note.trim() }
    RETENUS.set(cle(actif), rec)
    envoyer('eleve.besoins', {
      seanceId: membre.id,
      classeId: membre.classeId,
      code: actif,
      date: membre.date,
      besoins: JSON.stringify([{ domaine: dom.t, item: sheet.item, niveau, aides: [...aides], apres: apres ?? '' }]),
      amenagements: JSON.stringify([...amen]),
      note: note.trim(),
    })
    forcer((x) => x + 1)
    setSheet(null)
  }

  if (codes.length === 0) {
    return (
      <p className={styles.absent}>
        Aucun code élève publié pour cette classe. Les codes viennent du fichier
        <code> codes_eleves_mapse </code> de la Suite PSE.
      </p>
    )
  }

  const saved = actif ? savedOf(actif) : {}

  const renderCode = (code: string) => {
    const n = compteCode(code)
    return (
      <button
        key={code}
        type="button"
        className={`${styles.code} ${actif === code ? styles.codeActif : ''} ${n > 0 ? styles.codeNote : ''}`}
        onClick={() => setActif(actif === code ? null : code)}
        disabled={!dispo}
        aria-pressed={actif === code}
      >
        {code}
        {n > 0 && <span className={styles.pastille}>{n}</span>}
      </button>
    )
  }

  return (
    <>
      {parClasse.map((b) =>
        b.codes.length === 0 ? null : (
          <div key={b.membre.id} className={multi ? styles.blocClasse : undefined}>
            {multi && <p className={styles.classeLabel}>{b.classeNom}</p>}
            <div className={styles.grille}>{b.codes.map(renderCode)}</div>
          </div>
        ),
      )}

      {elevesNotes > 0 && !actif && (
        <p className={styles.rien}>
          Ce cours : <b>{elevesNotes}</b> élève{elevesNotes > 1 ? 's' : ''} relevé{elevesNotes > 1 ? 's' : ''}. La pastille
          compte les observables notés — touche un code pour compléter. Tout s’ajoute dans la fiche élève, sur l’ordinateur.
        </p>
      )}

      {actif && (
        <div className={styles.editeur}>
          <div className={styles.tete}>
            <span className={styles.code}>{actif}</span>
            <span className={styles.cl}>
              {(() => {
                const m = membreOf[actif] || membres[0]
                return `${m.classeNom} · ${[m.moduleLabel || m.module, m.seance].filter(Boolean).join(' · ')}`
              })()}
            </span>
          </div>
          <div className={styles.rgpd}>🔒 Code seul — aucun nom, aucune donnée médicale. Note ce que tu observes, ça n’est qu’un relevé.</div>
          <p className={styles.tally}>Ce cours, sur cet élève : <b>{Object.keys(saved).length}</b> observation(s).</p>

          {DOMAINES.map((dom, di) => {
            const n = dom.items.filter((it) => saved[`${di}|${it}`]).length
            return (
              <details className={styles.dom} key={dom.t} open={di === 0}>
                <summary>
                  <span className={styles.ic}>{dom.ic}</span>
                  <span className={styles.domTitre}>
                    <b>{dom.t}</b>
                    <span className={styles.domSub}>{dom.d}</span>
                  </span>
                  <span className={`${styles.badge} ${n > 0 ? styles.on : ''}`}>{n}</span>
                  <span className={styles.chev}>›</span>
                </summary>
                <div className={styles.corps}>
                  {dom.items.map((item) => {
                    const r = saved[`${di}|${item}`]
                    return (
                      <button key={item} type="button" className={`${styles.obs} ${r ? styles.obsFait : ''}`} onClick={() => ouvrirSheet(di, item)}>
                        <span className={styles.q}>{item}</span>
                        {r ? (
                          <span className={styles.lvl} style={{ background: AC[r.niveau] }}>✓ {r.niveau}</span>
                        ) : (
                          <span className={styles.plus}>+</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </details>
            )
          })}
        </div>
      )}

      {sheet && actif && (
        <>
          <div className={styles.scrim} onClick={() => setSheet(null)} />
          <div className={styles.sheet}>
            <button type="button" className={styles.grab} onClick={() => setSheet(null)} aria-label="Fermer" />
            <div className={styles.sheetHead}>
              <div className={styles.sheetTitre}>
                <div className={styles.obl}>{sheet.item}</div>
                <div className={styles.obd}>
                  {DOMAINES[sheet.di].t} · {actif}
                </div>
              </div>
              <button type="button" className={styles.close} onClick={() => setSheet(null)} aria-label="Fermer">
                ✕
              </button>
            </div>

            <div className={styles.slab}>
              Niveau d’autonomie <span className={styles.req}>requis</span>
            </div>
            <div className={styles.scale}>
              {SCALE.map((sc) => (
                <button
                  key={sc.n}
                  type="button"
                  className={styles.sc}
                  style={niveau === sc.n ? { background: AC[sc.n], borderColor: 'transparent', color: '#fff' } : undefined}
                  onClick={() => setNiveau(sc.n)}
                >
                  <span className={styles.scn}>{sc.n}</span>
                  <span className={styles.scl} style={niveau === sc.n ? { color: 'rgba(255,255,255,.9)' } : undefined}>{sc.l}</span>
                </button>
              ))}
            </div>
            <div className={styles.scaleExp}>
              {niveau == null ? (
                <>Touchez un niveau — de <b>0 autonome</b> à <b>5 accompagnement continu</b>.</>
              ) : (
                <>
                  <b>{niveau} · {SCALE[niveau].l}</b> — {SCALE[niveau].x}
                </>
              )}
            </div>

            <div className={styles.slab}>
              Aménagement de support à préparer <span className={styles.opt}>· optionnel</span>
            </div>
            <div className={styles.tagwrap}>
              {AMENAGEMENTS.map((a) => (
                <button key={a} type="button" className={styles.tag} data-on={amen.has(a)} onClick={() => toggle(amen, a, setAmen)}>
                  {a}
                </button>
              ))}
            </div>

            <div className={styles.slab}>
              Quelle aide a fonctionné ? <span className={styles.opt}>· optionnel</span>
            </div>
            <div className={styles.tagwrap}>
              {AIDES.map((a) => (
                <button key={a} type="button" className={styles.tag} data-on={aides.has(a)} onClick={() => toggle(aides, a, setAides)}>
                  {a}
                </button>
              ))}
            </div>

            <div className={styles.slab}>
              Quand on retire l’aide <span className={styles.opt}>· optionnel</span>
            </div>
            <div className={styles.tagwrap}>
              {APRES.map((a) => (
                <button key={a} type="button" className={styles.tag} data-on={apres === a} onClick={() => setApres(apres === a ? null : a)}>
                  {a}
                </button>
              ))}
            </div>

            <div className={styles.slab}>
              Fait observé <span className={styles.opt}>· optionnel</span>
            </div>
            <textarea
              className={styles.optnote}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ex. : après reformulation en une étape, réalise seul les 3 exercices."
            />

            <div className={styles.duo}>
              <button type="button" className={styles.annuler} onClick={() => setSheet(null)}>
                Annuler
              </button>
              <button type="button" className={styles.save} disabled={niveau == null || !dispo} onClick={enregistrerObs}>
                Enregistrer
              </button>
            </div>
            <p className={styles.opthint}>Seul le niveau est requis — le reste enrichit la synthèse. « Annuler » ou ✕ pour fermer sans enregistrer.</p>
          </div>
        </>
      )}
    </>
  )
}
