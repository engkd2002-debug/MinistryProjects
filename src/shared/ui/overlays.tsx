import { useRef, useId, type ReactNode, type ReactElement } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { X } from 'lucide-react';
import { useI18n } from '../i18n';
import { IconButton } from './controls';
interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  trigger?: ReactElement;
  contentClassName?: string;
}
function Modal({
  kind,
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  trigger,
  contentClassName = '',
}: ModalProps & { kind: 'dialog' | 'drawer' }) {
  const { dir, t } = useI18n();
  const descriptionId = useId();
  const previousFocus = useRef<HTMLElement | null>(null);
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>}
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="ui-overlay" />
        <DialogPrimitive.Content
          className={`ui-modal ui-${kind} ${contentClassName}`}
          dir={dir}
          aria-describedby={description ? descriptionId : undefined}
          onOpenAutoFocus={() => {
            previousFocus.current = document.activeElement as HTMLElement;
          }}
          onCloseAutoFocus={(event) => {
            if (previousFocus.current?.isConnected) {
              event.preventDefault();
              previousFocus.current.focus();
            }
          }}
        >
          <header className="ui-modal__head">
            <div>
              <DialogPrimitive.Title className="ui-modal__title">{title}</DialogPrimitive.Title>
              {description && (
                <DialogPrimitive.Description id={descriptionId} className="ui-modal__description">
                  {description}
                </DialogPrimitive.Description>
              )}
            </div>
            <DialogPrimitive.Close asChild>
              <IconButton label={t('close')}>
                <X size={19} />
              </IconButton>
            </DialogPrimitive.Close>
          </header>
          <div className="ui-modal__body">{children}</div>
          {footer && <footer className="ui-modal__footer">{footer}</footer>}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
export function Dialog(props: ModalProps) {
  return <Modal {...props} kind="dialog" />;
}
export function Drawer(props: ModalProps) {
  return <Modal {...props} kind="drawer" />;
}
export function Popover({
  trigger,
  children,
  label,
}: {
  trigger: ReactElement;
  children: ReactNode;
  label: string;
}) {
  const { dir } = useI18n();
  return (
    <PopoverPrimitive.Root>
      <PopoverPrimitive.Trigger asChild>{trigger}</PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          className="ui-popover"
          sideOffset={8}
          align="end"
          aria-label={label}
          dir={dir}
        >
          {children}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
export function Tooltip({ content, children }: { content: ReactNode; children: ReactElement }) {
  const { dir } = useI18n();
  return (
    <TooltipPrimitive.Provider delayDuration={350}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content className="ui-tooltip" dir={dir} sideOffset={7}>
            {content}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
export function Tabs({
  items,
  defaultValue,
  value,
  onValueChange,
  label,
}: {
  items: { value: string; label: ReactNode; content: ReactNode; disabled?: boolean }[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  label?: string;
}) {
  const { dir } = useI18n();
  const uid = useId();
  return (
    <TabsPrimitive.Root
      className="ui-tabs"
      dir={dir}
      defaultValue={defaultValue || items[0]?.value}
      value={value}
      onValueChange={onValueChange}
    >
      <TabsPrimitive.List className="ui-tabs__list" aria-label={label || uid}>
        {items.map((item) => (
          <TabsPrimitive.Trigger
            key={item.value}
            className="ui-tabs__trigger"
            value={item.value}
            disabled={item.disabled}
          >
            {item.label}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
      {items.map((item) => (
        <TabsPrimitive.Content key={item.value} className="ui-tabs__content" value={item.value}>
          {item.content}
        </TabsPrimitive.Content>
      ))}
    </TabsPrimitive.Root>
  );
}
