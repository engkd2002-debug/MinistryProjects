import { createContext, useContext, useState, useRef, useEffect, type ReactNode } from 'react';
import { AlertCircle, CheckCircle2, Info, TriangleAlert, X, Inbox } from 'lucide-react';
import { useI18n } from '../i18n';
import { type Tone } from './controls';
const icons = {
  neutral: Info,
  accent: Info,
  success: CheckCircle2,
  warning: TriangleAlert,
  danger: AlertCircle,
  info: Info,
};
export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={`ui-badge ui-tone-${tone}`}>
      <span className="ui-badge__dot" />
      {children}
    </span>
  );
}
export function Alert({
  tone = 'info',
  title,
  children,
}: {
  tone?: Tone;
  title: ReactNode;
  children?: ReactNode;
}) {
  const Icon = icons[tone];
  return (
    <div className={`ui-alert ui-tone-${tone}`} role={tone === 'danger' ? 'alert' : 'status'}>
      <Icon size={18} aria-hidden="true" />
      <div>
        <strong>{title}</strong>
        {children && <div className="ui-alert__description">{children}</div>}
      </div>
    </div>
  );
}
export function Spinner({ label }: { label?: string }) {
  const { t } = useI18n();
  return (
    <span className="ui-loading" role="status">
      <span className="ui-spinner" aria-hidden="true" />
      <span className={label ? undefined : 'sr-only'}>{label || t('loading')}</span>
    </span>
  );
}
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`ui-skeleton ${className}`} aria-hidden="true" />;
}
export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="ui-empty">
      <div className="ui-empty__icon">{icon || <Inbox size={25} aria-hidden="true" />}</div>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}
interface ToastItem {
  id: number;
  message: string;
  tone: Tone;
}
interface ToastContextValue {
  notify: (message: string, tone?: Tone) => void;
}
const ToastContext = createContext<ToastContextValue | null>(null);
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const { t } = useI18n();
  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
    },
    [],
  );
  const notify = (message: string, tone: Tone = 'success') => {
    const id = Date.now() + Math.random();
    setItems((current) => [...current.slice(-2), { id, message, tone }]);
    timers.current.push(
      setTimeout(() => setItems((current) => current.filter((item) => item.id !== id)), 6500),
    );
  };
  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div className="ui-toast-stack" aria-live="polite" aria-relevant="additions text">
        {items.map((item) => (
          <div key={item.id} className={`ui-toast ui-tone-${item.tone}`}>
            <span>{item.message}</span>
            <button
              type="button"
              onClick={() => setItems((current) => current.filter((x) => x.id !== item.id))}
              aria-label={t('close')}
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
export function useToast() {
  const value = useContext(ToastContext);
  if (!value) throw new Error('useToast must be used inside ToastProvider');
  return value;
}
