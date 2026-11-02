import {
  forwardRef,
  useId,
  cloneElement,
  isValidElement,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
  type ReactNode,
  type ReactElement,
} from 'react';
import { ChevronDown, X } from 'lucide-react';

const cx = (...values: (string | false | undefined)[]) => values.filter(Boolean).join(' ');
export type Tone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info';
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
  loading?: boolean;
  icon?: ReactNode;
}
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'secondary',
    size = 'md',
    loading = false,
    icon,
    children,
    className,
    disabled,
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      {...props}
      className={cx('ui-button', `ui-button--${variant}`, `ui-button--${size}`, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      {loading ? <span className="ui-spinner" aria-hidden="true" /> : icon}
      {children}
    </button>
  );
});
export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, children, className, ...props },
  ref,
) {
  return (
    <button
      type="button"
      {...props}
      ref={ref}
      aria-label={label}
      className={cx('ui-icon-button', className)}
    >
      {children}
    </button>
  );
});
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input {...props} ref={ref} className={cx('ui-input', className)} />;
  },
);
export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return <textarea {...props} ref={ref} className={cx('ui-input', 'ui-textarea', className)} />;
});
export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...props }, ref) {
    return (
      <span className="ui-select-wrap">
        <select {...props} ref={ref} className={cx('ui-input', 'ui-select', className)}>
          {children}
        </select>
        <ChevronDown aria-hidden="true" size={15} />
      </span>
    );
  },
);
export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
  className,
}: {
  label: ReactNode;
  htmlFor?: string;
  hint?: ReactNode;
  error?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const uid = useId();
  const id = htmlFor || `field-${uid}`;
  const descriptionId = `${id}-description`;
  const control = isValidElement(children)
    ? cloneElement(children as ReactElement<Record<string, unknown>>, {
        id: id,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': hint || error ? descriptionId : undefined,
      })
    : children;
  return (
    <div className={cx('ui-field', className)}>
      <label htmlFor={id} className="ui-field__label">
        {label}
      </label>
      {control}
      {(hint || error) && (
        <span
          id={descriptionId}
          className={cx('ui-field__hint', !!error && 'ui-field__hint--error')}
          role={error ? 'alert' : undefined}
        >
          {error || hint}
        </span>
      )}
    </div>
  );
}
export function Checkbox({
  label,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: ReactNode }) {
  return (
    <label className={cx('ui-checkbox', className)}>
      <input {...props} type="checkbox" />
      <span>{label}</span>
    </label>
  );
}
export function Switch({
  label,
  checked,
  onCheckedChange,
  disabled = false,
}: {
  label: ReactNode;
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <div className="ui-switch-row">
      <button
        id={id}
        className="ui-switch"
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        aria-labelledby={`${id}-label`}
      >
        <span />
      </button>
      <label id={`${id}-label`} htmlFor={id}>
        {label}
      </label>
    </div>
  );
}
export function FilterChip({
  children,
  onRemove,
  removeLabel,
}: {
  children: ReactNode;
  onRemove: () => void;
  removeLabel: string;
}) {
  return (
    <span className="ui-filter-chip">
      <span>{children}</span>
      <button type="button" aria-label={removeLabel} onClick={onRemove}>
        <X aria-hidden="true" size={13} />
      </button>
    </span>
  );
}
