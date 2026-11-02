import { useState } from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import { ThemeProvider, useTheme } from '../src/shared/theme';
import { PREFERENCES_KEY, readPreferences, savePreference } from '../src/shared/theme/preferences';
import { i18n, useI18n } from '../src/shared/i18n';

function systemAppearance(initial = false) {
  let matches = initial;
  const listeners = new Set<() => void>();
  const media = {
    get matches() {
      return matches;
    },
    media: '(prefers-color-scheme: dark)',
    onchange: null,
    addEventListener: vi.fn((_name: string, listener: () => void) => listeners.add(listener)),
    removeEventListener: vi.fn((_name: string, listener: () => void) => listeners.delete(listener)),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(() => true),
  };
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: vi.fn(() => media),
  });
  return {
    media,
    update: (next: boolean) => {
      matches = next;
      act(() => listeners.forEach((listener) => listener()));
    },
    listenerCount: () => listeners.size,
  };
}
function ThemeProbe() {
  const { preference, resolved, setTheme, storageError } = useTheme();
  return (
    <>
      <output data-testid="appearance">
        {preference}:{resolved}
      </output>
      {storageError && <p role="alert">Preferences cannot be saved</p>}
      <button onClick={() => setTheme('light')}>Use light</button>
      <button onClick={() => setTheme('dark')}>Use dark</button>
      <button onClick={() => setTheme('system')}>Use system</button>
    </>
  );
}

beforeEach(async () => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
  await act(async () => {
    await i18n.changeLanguage('ar');
  });
});
afterEach(() => vi.restoreAllMocks());

describe('appearance preference behavior', () => {
  it('follows current device appearance and subsequent system changes', () => {
    const system = systemAppearance(true);
    const { unmount } = render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('appearance')).toHaveTextContent('system:dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
    system.update(false);
    expect(screen.getByTestId('appearance')).toHaveTextContent('system:light');
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(system.listenerCount()).toBe(1);
    unmount();
    expect(system.listenerCount()).toBe(0);
  });
  it('persists explicit preference across remount and allows returning to system', async () => {
    const user = userEvent.setup();
    const system = systemAppearance(false);
    const first = render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Use dark' }));
    expect(readPreferences().theme).toBe('dark');
    system.update(true);
    system.update(false);
    expect(screen.getByTestId('appearance')).toHaveTextContent('dark:dark');
    first.unmount();
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('appearance')).toHaveTextContent('dark:dark');
    await user.click(screen.getByRole('button', { name: 'Use system' }));
    expect(screen.getByTestId('appearance')).toHaveTextContent('system:light');
    system.update(true);
    expect(screen.getByTestId('appearance')).toHaveTextContent('system:dark');
    expect(readPreferences().theme).toBe('system');
  });
  it('reports corrupt preference JSON without overwriting the retained value', () => {
    const damaged = '{invalid-json';
    localStorage.setItem(PREFERENCES_KEY, damaged);
    systemAppearance(false);
    expect(readPreferences()).toEqual({ theme: 'system', locale: 'ar', storageAvailable: false });
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Preferences cannot be saved');
    expect(screen.getByTestId('appearance')).toHaveTextContent('system:light');
    expect(localStorage.getItem(PREFERENCES_KEY)).toBe(damaged);
    expect(savePreference('theme', 'dark')).toBe(false);
    expect(localStorage.getItem(PREFERENCES_KEY)).toBe(damaged);
  });
  it('retains an in-session change while reporting a denied storage write', async () => {
    const user = userEvent.setup();
    systemAppearance(false);
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    );
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Storage blocked', 'SecurityError');
    });
    await user.click(screen.getByRole('button', { name: 'Use dark' }));
    expect(screen.getByTestId('appearance')).toHaveTextContent('dark:dark');
    expect(screen.getByRole('alert')).toHaveTextContent('Preferences cannot be saved');
    expect(document.documentElement.dataset.theme).toBe('dark');
  });
  it('changes locale without removing the stored appearance preference', () => {
    expect(savePreference('theme', 'dark')).toBe(true);
    expect(savePreference('locale', 'en')).toBe(true);
    expect(readPreferences()).toEqual({ theme: 'dark', locale: 'en', storageAvailable: true });
  });
});

describe('Arabic and English localization', () => {
  it('round-trips translated labels and document direction without discarding field content', async () => {
    function LocaleProbe() {
      const { t, locale, setLocale } = useI18n();
      const [value, setValue] = useState('SRP-2026 · بحث تجريبي');
      return (
        <>
          <output data-testid="locale">{locale}</output>
          <output data-testid="translated-label">{t('roles')}</output>
          <label>
            Working text
            <input value={value} onChange={(event) => setValue(event.target.value)} />
          </label>
          <button onClick={() => setLocale('en')}>English</button>
          <button onClick={() => setLocale('ar')}>العربية</button>
        </>
      );
    }
    const user = userEvent.setup();
    render(<LocaleProbe />);
    const original = screen.getByTestId('translated-label').textContent;
    expect(original).toBe('الأدوار والتدقيق');
    expect(document.documentElement.dir).toBe('rtl');
    const input = screen.getByRole('textbox', { name: 'Working text' });
    await user.type(input, ' retained');
    await user.click(screen.getByRole('button', { name: 'English' }));
    await waitFor(() =>
      expect(screen.getByTestId('translated-label')).toHaveTextContent('Roles & audit'),
    );
    expect(document.documentElement.lang).toBe('en');
    expect(document.documentElement.dir).toBe('ltr');
    expect(readPreferences().locale).toBe('en');
    await user.click(screen.getByRole('button', { name: 'العربية' }));
    await waitFor(() =>
      expect(screen.getByTestId('translated-label')).toHaveTextContent(original!),
    );
    expect(document.documentElement.lang).toBe('ar');
    expect(document.documentElement.dir).toBe('rtl');
    expect(input).toHaveValue('SRP-2026 · بحث تجريبي retained');
    expect(readPreferences().locale).toBe('ar');
  });
});
