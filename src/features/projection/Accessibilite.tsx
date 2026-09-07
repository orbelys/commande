import { useState } from 'react'
import { Accessibility, Volume2, Pause, Play, Square, Minus, Plus, RotateCcw, Eye } from 'lucide-react'
import Button from '../../components/ui/Button'
import { useBridge } from '../../hooks/useBridge'
import type { Projection } from '../../services/bridge/types'
import styles from './Accessibilite.module.css'

export default function Accessibilite({ projection, disponible }: { projection: Projection; disponible: boolean }) {
  const { envoyer } = useBridge()
  const [ouvert, setOuvert] = useState(false)
  const { audio, accessibilite: acc } = projection
  const lecture = audio?.cible === 'question' && audio.statut === 'lecture'
  const pause = audio?.cible === 'question' && audio.statut === 'pause'
  const label = lecture ? 'Pause' : pause ? 'Reprendre' : 'Lire la question'
  const taille = acc?.taille ?? 1
  return <section className={styles.section} aria-label="Lecture et accessibilité">
    <div className={styles.commandes}>
      <Button icone={lecture ? <Pause size={20} /> : pause ? <Play size={20} /> : <Volume2 size={20} />}
        disabled={!disponible || !audio?.disponible || !audio.lisible} title={label}
        onClick={() => envoyer(lecture ? 'projection.audio.pause' : pause ? 'projection.audio.reprendre' : 'projection.audio.lire')}>
        {label}
      </Button>
      <Button aria-label="Arrêter la lecture" title="Arrêter la lecture" icone={<Square size={18} />}
        disabled={!disponible || !audio || audio.statut === 'repos'} onClick={() => envoyer('projection.audio.arreter')} />
      <Button aria-label="Accessibilité" title="Accessibilité" aria-expanded={ouvert} aria-controls="projection-accessibilite"
        icone={<Accessibility size={20} />} onClick={() => setOuvert(v => !v)} />
    </div>
    {audio?.erreur && <p role="status" className={styles.note}>{audio.erreur}</p>}
    {ouvert && <div id="projection-accessibilite" className={styles.options}>
      <h3>Accessibilité</h3>
      {!audio || !acc ? <p className={styles.note}>Mise à jour d’Electron nécessaire.</p> : <>
        {!audio.disponible && <p className={styles.note}>Voix indisponible sur l’ordinateur.</p>}
        <div className={styles.taille}>
          <span>Taille du texte</span>
          <Button aria-label="Diminuer le texte" title="Diminuer le texte" icone={<Minus size={18} />}
            disabled={!disponible || taille <= 0.7} onClick={() => envoyer('projection.accessibilite.taille', { taille: Math.max(0.7, Math.round((taille - 0.15) * 100) / 100) })} />
          <output aria-label="Taille du texte projeté">{Math.round(taille * 100)} %</output>
          <Button aria-label="Agrandir le texte" title="Agrandir le texte" icone={<Plus size={18} />}
            disabled={!disponible || taille >= 2} onClick={() => envoyer('projection.accessibilite.taille', { taille: Math.min(2, Math.round((taille + 0.15) * 100) / 100) })} />
        </div>
        <div className={styles.prereglages}>
          <Button icone={<Eye size={18} />} disabled={!disponible}
            onClick={() => envoyer('projection.accessibilite.prereglage', { nom: 'fond' })}>Fond de classe</Button>
          <Button aria-label="Réinitialiser l’accessibilité" title="Réinitialiser l’accessibilité" icone={<RotateCcw size={18} />}
            disabled={!disponible} onClick={() => envoyer('projection.accessibilite.prereglage', { nom: 'reset' })} />
        </div>
      </>}
    </div>}
  </section>
}
