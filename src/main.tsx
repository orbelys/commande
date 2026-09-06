import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { BridgeProvider } from './services/bridge/BridgeProvider'
import './styles/global.css'

const container = document.getElementById('root')
if (!container) throw new Error('Element #root introuvable dans index.html')

createRoot(container).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <BridgeProvider>
        <App />
      </BridgeProvider>
    </BrowserRouter>
  </StrictMode>,
)
