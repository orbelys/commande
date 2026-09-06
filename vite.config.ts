import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Le "base" servira plus tard pour GitHub Pages (ex: '/commande/').
// En local il reste '/' : rien a changer pour developper.
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE ?? '/',
  server: {
    port: 5173,
    open: true,
  },
})
