import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Shell } from './Shell';
import { operations } from './navigation';
import { WorkspacePage } from '../features/workspaces/WorkspacePage';
import { useI18n } from '../shared/i18n';
import { EmptyState, Spinner } from '../shared/ui';
import { Map } from 'lucide-react';
import { ExplorerSessionProvider } from '../features/explorer/state/ExplorerSession';
const Explorer = lazy(() =>
  import('../features/explorer/ExplorerPage').then((m) => ({ default: m.ExplorerPage })),
);
const Showcase = import.meta.env.DEV
  ? lazy(() =>
      import('../features/showcase/ShowcasePage').then((m) => ({ default: m.ShowcasePage })),
    )
  : null;
function NotFound() {
  const { t } = useI18n();
  return (
    <EmptyState
      title={t('notFound')}
      description={t('notFoundDesc')}
      icon={<Map />}
      action={<Link to="/explorer">{t('returnHome')}</Link>}
    />
  );
}
function DefaultRoute() {
  const location = useLocation();
  return (
    <Navigate
      to={{ pathname: '/explorer', search: location.search, hash: location.hash }}
      replace
    />
  );
}
export function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || '/'}>
      <ExplorerSessionProvider>
        <Routes>
          <Route element={<Shell />}>
            <Route index element={<DefaultRoute />} />
            <Route
              path="explorer"
              element={
                <Suspense fallback={<Spinner />}>
                  <Explorer />
                </Suspense>
              }
            />
            <Route path="research" element={<WorkspacePage kind="research" />} />
            <Route path="insights" element={<WorkspacePage kind="insights" />} />
            {operations.map(({ path, label }) => (
              <Route
                key={path}
                path={path}
                element={<WorkspacePage kind="support" supportLabel={label} />}
              />
            ))}
            {Showcase && (
              <Route
                path="dev/design-system"
                element={
                  <Suspense fallback={<Spinner />}>
                    <Showcase />
                  </Suspense>
                }
              />
            )}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </ExplorerSessionProvider>
    </BrowserRouter>
  );
}
