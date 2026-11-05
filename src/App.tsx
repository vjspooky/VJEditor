import { AppLayout } from '@/layouts/AppLayout';
import {
  DashboardAiPage,
  DashboardHomePage,
  DashboardMediaPage,
  DashboardProjectsPage,
  DashboardSettingsPage,
  DashboardTemplatesPage,
} from '@/pages/DashboardPage';
import { EditorPage } from '@/pages/EditorPage';
import { FullPageEmbedPage } from '@/pages/FullPageEmbedPage';
import { AuthPage } from '@/pages/AuthPage';
import { LandingPage } from '@/pages/LandingPage';
import { NewProjectPage } from '@/pages/NewProjectPage';
import { MediaPage } from '@/pages/MediaPage';
import {
  BrowserRouter,
  HashRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

const SESSION_KEY = 'vjeditor_session';

export default function App() {
  const isGitHubPages =
    import.meta.env.VITE_GITHUB_PAGES === 'true' ||
    (typeof window !== 'undefined' &&
      (window.location.hostname.endsWith('github.io') ||
        window.location.pathname.startsWith('/VJEditor')));
  const Router = isGitHubPages ? HashRouter : BrowserRouter;

  // Auto-initialize session for instant editor access
  if (typeof window !== 'undefined' && !localStorage.getItem(SESSION_KEY)) {
    localStorage.setItem(SESSION_KEY, 'true');
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<EditorPage />} />
        <Route path="/editor" element={<EditorPage />} />
        <Route path="/editor/:projectId" element={<EditorPage />} />
        <Route path="/full-page-embed" element={<FullPageEmbedPage />} />
        <Route path="/full-page-embed/:projectId" element={<FullPageEmbedPage />} />
        <Route path="/embed" element={<FullPageEmbedPage />} />
        <Route path="/embed/:projectId" element={<FullPageEmbedPage />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/dashboard" element={<AppLayout />}>
          <Route index element={<DashboardHomePage />} />
          <Route path="projects" element={<DashboardProjectsPage />} />
          <Route path="templates" element={<DashboardTemplatesPage />} />
          <Route path="ai" element={<DashboardAiPage />} />
          <Route path="media" element={<DashboardMediaPage />} />
          <Route path="settings" element={<DashboardSettingsPage />} />
        </Route>
        <Route path="/projects/new" element={<NewProjectPage />} />
        <Route path="/media" element={<AppLayout><MediaPage /></AppLayout>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
