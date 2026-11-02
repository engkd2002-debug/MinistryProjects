import { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  Button,
  Field,
  Input,
  Switch,
  Dialog,
  Drawer,
  Popover,
  Tabs,
  FilterChip,
  ToastProvider,
  useToast,
  Disclosure,
  Table,
} from '../src/shared/ui';

vi.mock('../src/shared/i18n', () => ({
  useI18n: () => ({ dir: 'ltr', t: (key: string) => (key === 'close' ? 'Close' : key) }),
}));

describe('shared interaction contracts', () => {
  it('keeps disabled and loading actions inert', async () => {
    const click = vi.fn();
    const user = userEvent.setup();
    render(
      <>
        <Button disabled onClick={click}>
          Disabled action
        </Button>
        <Button loading onClick={click}>
          Pending action
        </Button>
      </>,
    );
    await user.click(screen.getByRole('button', { name: 'Disabled action' }));
    await user.click(screen.getByRole('button', { name: 'Pending action' }));
    expect(click).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Pending action' })).toHaveAttribute(
      'aria-busy',
      'true',
    );
  });
  it('associates field label and validation with its control', () => {
    render(
      <Field label="Research title" error="A title is required">
        <Input />
      </Field>,
    );
    const input = screen.getByRole('textbox', { name: 'Research title' });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('A title is required');
    expect(screen.getByRole('alert')).toHaveTextContent('A title is required');
  });
  it('supports a native keyboard switch and announces its state', async () => {
    function Example() {
      const [checked, setChecked] = useState(false);
      return <Switch label="Show labels" checked={checked} onCheckedChange={setChecked} />;
    }
    const user = userEvent.setup();
    render(<Example />);
    await user.tab();
    expect(screen.getByRole('switch', { name: 'Show labels' })).toHaveFocus();
    await user.keyboard(' ');
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
    await user.keyboard(' ');
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
  });
  for (const [name, Component] of [
    ['dialog', Dialog],
    ['drawer', Drawer],
  ] as const) {
    it(`${name} contains keyboard focus, dismisses on Escape and restores the trigger`, async () => {
      function Example() {
        const [open, setOpen] = useState(false);
        return (
          <>
            <button>Outside control</button>
            <Component
              open={open}
              onOpenChange={setOpen}
              title="Record preview"
              description="Example content"
              trigger={<Button>Open preview</Button>}
            >
              <Field label="Example title">
                <Input />
              </Field>
              <Button>Inside action</Button>
            </Component>
          </>
        );
      }
      const user = userEvent.setup();
      render(<Example />);
      const trigger = screen.getByRole('button', { name: 'Open preview' });
      await user.click(trigger);
      const modal = screen.getByRole('dialog', { name: 'Record preview' });
      expect(modal).toHaveAccessibleDescription('Example content');
      for (let i = 0; i < 6; i++) {
        await user.tab();
        expect(modal.contains(document.activeElement)).toBe(true);
      }
      await user.keyboard('{Escape}');
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      expect(trigger).toHaveFocus();
    });
  }
  it('offers keyboard selection between tabs without reaching disabled tabs', async () => {
    const user = userEvent.setup();
    render(
      <Tabs
        label="Preview categories"
        items={[
          { value: 'one', label: 'Foundations', content: 'Foundation content' },
          { value: 'two', label: 'Interactions', content: 'Interaction content' },
          { value: 'disabled', label: 'Unavailable', content: 'Hidden', disabled: true },
        ]}
      />,
    );
    await user.click(screen.getByRole('tab', { name: 'Foundations' }));
    await user.keyboard('{ArrowRight}');
    await waitFor(() =>
      expect(screen.getByRole('tab', { name: 'Interactions' })).toHaveAttribute(
        'aria-selected',
        'true',
      ),
    );
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Interaction content');
    expect(screen.getByRole('tab', { name: 'Unavailable' })).toBeDisabled();
  });
  it('opens a popover by keyboard and returns to its trigger', async () => {
    const user = userEvent.setup();
    render(
      <Popover label="Scope details" trigger={<Button>Scope</Button>}>
        <Button>Popover action</Button>
      </Popover>,
    );
    await user.tab();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('button', { name: 'Popover action' })).toBeVisible();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Scope' })).toHaveFocus());
  });
  it('removes only the selected filter chip', async () => {
    const remove = vi.fn();
    const user = userEvent.setup();
    render(
      <FilterChip removeLabel="Remove Damascus" onRemove={remove}>
        Governorate: Damascus
      </FilterChip>,
    );
    await user.click(screen.getByRole('button', { name: 'Remove Damascus' }));
    expect(remove).toHaveBeenCalledTimes(1);
  });
  it('exposes a native expandable section and a readable table', async () => {
    const user = userEvent.setup();
    render(
      <>
        <Disclosure title="Advanced criteria">
          <p>Scoped criteria</p>
        </Disclosure>
        <Table
          caption="Example metadata"
          columns={[
            { key: 'name', label: 'Field' },
            { key: 'value', label: 'Example' },
          ]}
          rows={[{ name: 'Title', value: 'Sample' }]}
        />
      </>,
    );
    const summary = screen.getByText('Advanced criteria');
    await user.click(summary);
    expect(summary.closest('details')).toHaveAttribute('open');
    expect(screen.getByRole('table', { name: 'Example metadata' })).toBeInTheDocument();
    expect(screen.getByRole('rowheader', { name: 'Title' })).toBeInTheDocument();
  });
  it('announces successful feedback and allows deliberate dismissal', async () => {
    function Example() {
      const { notify } = useToast();
      return <Button onClick={() => notify('Preview action completed')}>Notify</Button>;
    }
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <Example />
      </ToastProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Notify' }));
    expect(screen.getByText('Preview action completed')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByText('Preview action completed')).not.toBeInTheDocument();
  });
});
