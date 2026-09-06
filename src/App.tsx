import { Routes, Route, Navigate } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import DashboardPage from './features/dashboard/DashboardPage'
import CoursPage from './features/cours/CoursPage'
import ClassesPage from './features/classes/ClassesPage'
import CommandesPage from './features/commandes/CommandesPage'
import ProgressionPage from './features/progression/ProgressionPage'
import DocumentsPage from './features/documents/DocumentsPage'
import SyncPage from './features/sync/SyncPage'

/**
 * Table des routes de l’application.
 * Ajouter une page = créer un dossier dans src/features/ puis une ligne ici.
 */
export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/cours" element={<CoursPage />} />
        <Route path="/classes" element={<ClassesPage />} />
        <Route path="/commandes" element={<CommandesPage />} />
        <Route path="/progression" element={<ProgressionPage />} />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/synchronisation" element={<SyncPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
