import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { I18nextProvider } from 'react-i18next';
import { i18n } from './shared/i18n';
import { ThemeProvider } from './shared/theme';
import { ToastProvider } from './shared/ui';
import { ErrorBoundary } from './app/ErrorBoundary';
import { App } from './app/App';
import { migrateLegacyHash } from './shared/query/migrateLegacyHash';
migrateLegacyHash(window.location, window.history);
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <ErrorBoundary>
          <ToastProvider>
            <App />
          </ToastProvider>
        </ErrorBoundary>
      </ThemeProvider>
    </I18nextProvider>
  </StrictMode>,
);
