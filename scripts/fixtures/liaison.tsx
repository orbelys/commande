import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { BridgeContext } from '../../src/services/bridge/BridgeContext'
import StatusPill from '../../src/components/layout/StatusPill'
import ProjectionPage from '../../src/features/projection/ProjectionPage'
import { snapshotDemo } from '../../src/data/demo'
import { createCommand } from '../../src/services/bridge/commands'
import '../../src/styles/global.css'

function Fixture() {
  const [snapshot, setSnapshot] = useState(snapshotDemo)
  const [status, setStatus] = useState('online')
  const [commandes, setCommandes] = useState<any[]>([])
  const [ouvert, setOuvert] = useState(false)
  Object.assign(window, {
    fixture: { snapshot, commandes },
    ouvrir: () => setOuvert(true),
    recevoir: (patch = {}) => setSnapshot(s => ({ ...s, majA: new Date().toISOString(), ...patch })),
    connexion: setStatus,
    confirmer: (statut = 'appliquee', erreur?: string) => setCommandes(cs => cs.map(c => ({...c, statut, erreur}))),
    commandes: setCommandes,
  })
  return <MemoryRouter><BridgeContext.Provider value={{
    snapshot, status, commandes, transportId:'firebase',
    envoyer: (type, payload) => {
      const c = createCommand(type, payload, snapshot)
      setCommandes(cs => [c, ...cs]); return c
    },
  } as any}>
    <main style={{maxWidth:700,margin:'0 auto',padding:16}}>
      <StatusPill />{ouvert && <ProjectionPage />}
    </main>
  </BridgeContext.Provider></MemoryRouter>
}
createRoot(document.getElementById('root')!).render(<Fixture />)
