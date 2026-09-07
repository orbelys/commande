import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import { BridgeProvider } from './services/bridge/BridgeProvider'
import './styles/global.css'

// Safari restitue la position de défilement au rechargement : on repart du haut.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual'

const container = document.getElementById('root')
if (!container) throw new Error('Element #root introuvable dans index.html')

createRoot(container).render(
  <StrictMode>
    <HashRouter>
      <BridgeProvider>
        <App />
      </BridgeProvider>
    </HashRouter>
  </StrictMode>,
)
