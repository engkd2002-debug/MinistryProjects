import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  ArrowUpRight,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  Globe2,
  Sun,
  Moon,
  Monitor,
  Info,
  Layers2,
  FlaskConical,
  Settings2,
} from 'lucide-react';
import { useI18n } from '../shared/i18n';
import { useTheme } from '../shared/theme';
import {
  Button,
  IconButton,
  Badge,
  Dialog,
  Drawer,
  Popover,
  Field,
  Input,
  Select,
  Alert,
  Disclosure,
  Tooltip,
} from '../shared/ui';
import { useQueryState, ScopeProvider } from '../shared/query';
import { demoReferences } from '../data/demo/references';
import { workspaces, operations } from './navigation';
import './shell.css';
function BrandMark() {
  return (
    <svg viewBox="0 0 40 40" width="38" height="38" fill="none" aria-hidden="true">
      <path d="m20 4 14 8v16l-14 8-14-8V12L20 4Z" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="m6 12 14 8 14-8M20 20v16M12 9v14l8 5 8-5V9"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="20" cy="12" r="2.3" fill="currentColor" />
    </svg>
  );
}
export function Shell() {
  const { t, locale, setLocale, storageError: localeError } = useI18n();
  const theme = useTheme();
  const location = useLocation();
  const isExplorer = location.pathname === '/explorer';
  const queryState = useQueryState();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scopeOpen, setScopeOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const selected = [...workspaces, ...operations].find((x) => x.path === location.pathname);
  useEffect(() => {
    setMobileOpen(false);
    document.getElementById('workspace-heading')?.focus({ preventScroll: true });
  }, [location.pathname]);
  const destination = (path: string) => ({ pathname: path, search: location.search });
  const navContent = (
    <>
      <div className="brand">
        <span className="brand-mark">
          <BrandMark />
        </span>
        <div className="brand-copy">
          <strong>{t('productName')}</strong>
          <span>{t('brandSubtitle')}</span>
        </div>
      </div>
      <div className="rail-section-label">{t('workspace')}</div>
      <nav aria-label={t('navigation')} className="primary-nav">
        {workspaces.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={destination(path)}
            end
            aria-label={t(label)}
            title={collapsed ? t(label) : undefined}
            className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}
          >
            <Icon size={19} />
            <span className="nav-text">{t(label)}</span>
            <span className="active-dot" />
          </NavLink>
        ))}
      </nav>
      <div className="rail-rule" />
      <div className="support-nav">
        <Disclosure
          title={
            <span className="support-title">
              <Layers2 size={17} />
              <span className="nav-text">{t('supporting')}</span>
            </span>
          }
        >
          <nav aria-label={t('supportNav')}>
            {operations.map(({ path, label, icon: Icon }) => (
              <NavLink
                key={path}
                to={destination(path)}
                className={({ isActive }) => `support-link ${isActive ? 'is-active' : ''}`}
              >
                <Icon size={15} />
                <span>{t(label)}</span>
              </NavLink>
            ))}
          </nav>
        </Disclosure>
      </div>
      <div className="rail-bottom">
        <div className="environment-note">
          <FlaskConical size={17} />
          <div>
            <strong>{t('sample')}</strong>
            <span>{t('foundation')}</span>
          </div>
        </div>
        {import.meta.env.DEV && (
          <Link
            className="dev-link"
            to={destination('/dev/design-system')}
            title={t('designSystem')}
          >
            <Settings2 size={16} />
            <span className="nav-text">{t('designSystem')}</span>
            <ArrowUpRight size={14} />
          </Link>
        )}
        <button
          className="rail-about"
          onClick={() => setAboutOpen(true)}
          aria-label={t('aboutDemo')}
        >
          <Info size={16} />
          <span className="nav-text">{t('aboutDemo')}</span>
        </button>
        <div className="rail-foot">
          <span className="nav-text" dir="ltr">
            {t('version')}
          </span>
          <IconButton
            label={t(collapsed ? 'expandNav' : 'collapseNav')}
            className="collapse-button"
            onClick={() => setCollapsed((v) => !v)}
          >
            {collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
          </IconButton>
        </div>
      </div>
    </>
  );
  return (
    <ScopeProvider onOpen={() => setScopeOpen(true)}>
      <div className={`app-shell ${collapsed ? 'rail-is-collapsed' : ''}`}>
        <a className="skip-link" href="#main-content">
          {t('skip')}
        </a>
        <aside className="app-rail">{navContent}</aside>
        <div className="app-body">
          <header className="topbar">
            <div className="topbar-location">
              <IconButton
                label={t('openMenu')}
                className="mobile-menu"
                onClick={() => setMobileOpen(true)}
              >
                <Menu size={20} />
              </IconButton>
              <span className="topbar-platform">{t('platform')}</span>
              <span className="breadcrumb-separator">/</span>
              <strong>{selected ? t(selected.label) : t('designSystem')}</strong>
            </div>
            <div className="topbar-controls">
              <Badge tone="neutral">{t(isExplorer ? 'geo.phase' : 'preview')}</Badge>
              <Tooltip content={t('language')}>
                <IconButton
                  label={t('language')}
                  onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
                >
                  <Globe2 size={17} />
                  <span className="language-code">{locale === 'ar' ? 'EN' : 'ع'}</span>
                </IconButton>
              </Tooltip>
              <Popover
                label={t('settings')}
                trigger={
                  <IconButton label={t('theme')}>
                    {theme.resolved === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                    <ChevronDown size={12} />
                  </IconButton>
                }
              >
                <div className="appearance-menu">
                  <strong>{t('theme')}</strong>
                  <div className="theme-choices" role="group" aria-label={t('theme')}>
                    {(
                      [
                        { value: 'light', icon: Sun },
                        { value: 'dark', icon: Moon },
                        { value: 'system', icon: Monitor },
                      ] as const
                    ).map(({ value, icon: Icon }) => (
                      <button
                        key={value}
                        aria-pressed={theme.preference === value}
                        onClick={() => theme.setTheme(value)}
                      >
                        <Icon size={17} />
                        {t(value)}
                      </button>
                    ))}
                  </div>
                  <p>{t('themeHint')}</p>
                </div>
              </Popover>
            </div>
          </header>
          <main
            id="main-content"
            className={`main-content ${isExplorer ? 'explorer-main' : ''}`}
            tabIndex={-1}
          >
            {(theme.storageError || localeError) && (
              <Alert tone="warning" title={t('storageError')} />
            )}
            <Outlet />
            <footer className="workspace-footer">
              <span>
                <i className="status-dot" />
                {t(isExplorer ? 'geo.sampleNote' : 'sampleNote')}
              </span>
              <span>
                {t(isExplorer ? 'geo.phase' : 'phase')}
                <span className="footer-divider">/</span>
                {t(isExplorer ? 'geo.workspace' : 'foundation')}
              </span>
            </footer>
          </main>
        </div>
        <Drawer open={mobileOpen} onOpenChange={setMobileOpen} title={t('navigation')}>
          <div className="mobile-navigation">{navContent}</div>
        </Drawer>
        <Drawer
          open={scopeOpen}
          onOpenChange={setScopeOpen}
          title={t('scope')}
          description={t(isExplorer ? 'geo.filterHint' : 'scopeHint')}
          footer={
            <>
              <Button variant="ghost" onClick={queryState.reset}>
                {t('clear')}
              </Button>
              <Button onClick={() => setScopeOpen(false)}>{t('apply')}</Button>
            </>
          }
        >
          <div className="scope-form">
            <Field label={t('query')} htmlFor="scope-query">
              <Input
                id="scope-query"
                placeholder={t('queryPlaceholder')}
                value={queryState.query.q}
                onChange={(e) => queryState.setFilter('q', e.target.value)}
              />
            </Field>
            <Field label={t('governorate')} htmlFor="scope-gov">
              <Select
                id="scope-gov"
                value={queryState.query.gov}
                onChange={(e) => queryState.setFilter('gov', e.target.value)}
              >
                <option value="">{t('allGovernorates')}</option>
                {demoReferences.governorates.map((g) => (
                  <option key={g.id} value={g.id}>
                    {locale === 'ar' ? g.name_ar : g.name_en}
                  </option>
                ))}
              </Select>
            </Field>
            <Alert tone="info" title={t('sharedContext')}>
              {t(isExplorer ? 'geo.filterHint' : 'scopeHint')}
            </Alert>
          </div>
        </Drawer>
        <Dialog
          open={aboutOpen}
          onOpenChange={setAboutOpen}
          title={t('aboutTitle')}
          description={t('aboutBody')}
          footer={<Button onClick={() => setAboutOpen(false)}>{t('gotIt')}</Button>}
        >
          <div className="about-demo">
            <Badge tone="accent">{t('phase')}</Badge>
            <p>{t('demoRoleNote')}</p>
          </div>
        </Dialog>
      </div>
    </ScopeProvider>
  );
}
