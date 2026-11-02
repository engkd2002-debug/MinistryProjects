import { Component, type ReactNode, type ErrorInfo } from 'react';
import { useI18n } from '../shared/i18n';
function ErrorFallback() {
  const { t } = useI18n();
  return (
    <main className="fatal-error">
      <h1>{t('errorTitle')}</h1>
      <p>{t('errorDesc')}</p>
      <button onClick={() => location.reload()}>{t('reload')}</button>
    </main>
  );
}
export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) console.error(error, info.componentStack);
  }
  render() {
    return this.state.failed ? <ErrorFallback /> : this.props.children;
  }
}
