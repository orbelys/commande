import { defineConfig } from 'vite'

/**
 * Construit un fichier Firebase unique et autonome pour la Suite PSE.
 * Aucune dépendance externe : il doit fonctionner depuis file://.
 */
export default defineConfig({
  build: {
    lib: {
      entry: 'vendor-src/firebase-bundle.js',
      formats: ['es'],
      fileName: () => 'firebase-bundle.js',
    },
    outDir: 'electron/vendor',
    emptyOutDir: true,
    copyPublicDir: false,
    minify: 'esbuild',
    target: 'es2020',
  },
})
