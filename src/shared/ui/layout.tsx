import { type ReactNode, type HTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
export function Card({ children, className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} className={`ui-card ${className}`}>
      {children}
    </div>
  );
}
export function Panel({ children, className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} className={`ui-panel ${className}`}>
      {children}
    </div>
  );
}
export function Section({
  title,
  description,
  action,
  children,
  className = '',
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`ui-section ${className}`}>
      <div className="ui-section__head">
        <div>
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>
        {action && <div className="ui-section__action">{action}</div>}
      </div>
      {children}
    </section>
  );
}
export function Divider() {
  return <hr className="ui-divider" />;
}
export function Disclosure({
  title,
  children,
  defaultOpen = false,
}: {
  title: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details className="ui-disclosure" open={defaultOpen || undefined}>
      <summary>
        <span>{title}</span>
        <ChevronDown size={17} aria-hidden="true" />
      </summary>
      <div className="ui-disclosure__body">{children}</div>
    </details>
  );
}
export function ResponsiveColumns({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`ui-columns ${className}`}>{children}</div>;
}
