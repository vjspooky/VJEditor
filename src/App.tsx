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
import { AuthPage } from '@/pages/AuthPage';
import { LandingPage } from '@/pages/LandingPage';
import { NewProjectPage } from '@/pages/NewProjectPage';
import {
  BrowserRouter,
  HashRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import type { ReactNode } from 'react';

const SESSION_KEY = 'vjeditor_session';

export default function App() {
  const Router = import.meta.env.VITE_GITHUB_PAGES === 'true' ? HashRouter : BrowserRouter;

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/dashboard" element={<RequireAuth><AppLayout /></RequireAuth>}>
          <Route index element={<DashboardHomePage />} />
          <Route path="projects" element={<DashboardProjectsPage />} />
          <Route path="templates" element={<DashboardTemplatesPage />} />
          <Route path="ai" element={<DashboardAiPage />} />
          <Route path="media" element={<DashboardMediaPage />} />
          <Route path="settings" element={<DashboardSettingsPage />} />
        </Route>
        <Route path="/projects/new" element={<RequireAuth><NewProjectPage /></RequireAuth>} />
        <Route path="/editor/:projectId" element={<RequireAuth><EditorPage /></RequireAuth>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

function RequireAuth({ children }: { children: ReactNode }) {
  const location = useLocation();
  if (localStorage.getItem(SESSION_KEY) !== 'true') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}
