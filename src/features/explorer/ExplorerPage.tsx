import { useEffect, useMemo, useState } from 'react';
import {
  ChevronRight,
  SlidersHorizontal,
  Layers2,
  Map,
  Rows3,
  Link2,
  MapPin,
  RotateCcw,
  FlaskConical,
  Info,
} from 'lucide-react';
import { useI18n } from '../../shared/i18n';
import {
  Alert,
  Badge,
  Button,
  Drawer,
  IconButton,
  Spinner,
  Disclosure,
  useToast,
} from '../../shared/ui';
import { QueryContext, useQueryState } from '../../shared/query';
import { demoGeometry, demoReferences } from '../../data/demo';
import { filterRecords } from '../../domain/research/filter';
import { summarizeRecords } from '../../domain/analysis/summary';
import {
  aggregateGeography,
  automaticThresholds,
  collaborationLinks,
  levelForZoom,
  type GeographicSelection,
} from '../../domain/geography/aggregation';
import { projectCoordinate } from '../../domain/geography/models';
import { nationalViewport, zoomRatio } from '../../domain/geography/viewport';
import type { ResearchRecord } from '../../domain/research/models';
import { useExplorerSession } from './state/ExplorerSession';
import { useResearchSnapshot } from './hooks/useResearchSnapshot';
import { MapCanvas } from './components/MapCanvas';
import { ExplorerFilters } from './components/ExplorerFilters';
import { VisualizationSettings } from './components/VisualizationSettings';
import { LocationContext, locationName } from './components/LocationContext';
import { MapRecordList, MapRecordPreview } from './components/MapRecords';
import './explorer.css';

const EMPTY: ResearchRecord[] = [];
function useCompactContext() {
  const [compact, setCompact] = useState(() => window.matchMedia('(max-width: 1199px)').matches);
  useEffect(() => {
    const media = window.matchMedia('(max-width: 1199px)');
    const changed = () => setCompact(media.matches);
    media.addEventListener('change', changed);
    return () => media.removeEventListener('change', changed);
  }, []);
  return compact;
}
export function ExplorerPage() {
  const compact = useCompactContext();
  const { t, locale, formatNumber } = useI18n();
  const queryState = useQueryState();
  const { query } = queryState;
  const session = useExplorerSession();
  const { state, retry } = useResearchSnapshot();
  const { notify } = useToast();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [layersOpen, setLayersOpen] = useState(false);
  const [mode, setMode] = useState<'map' | 'records'>('map');
  const [inspection, setInspection] = useState<GeographicSelection | null>(null);
  const [contextOpen, setContextOpen] = useState(false);
  const [recordId, setRecordId] = useState<string | null>(null);
  // A breakpoint change preserves location context without forcing a modal open.
  useEffect(() => setContextOpen(false), [compact]);
  const records = state.status === 'ready' ? state.snapshot.records : EMPTY;
  const filtered = useMemo(
    () =>
      filterRecords(records, query, {
        role: session.role,
        governorates: demoReferences.governorates,
      }),
    [records, query, session.role],
  );
  const level = levelForZoom(zoomRatio(session.viewport, demoGeometry));
  const snapshot = useMemo(
    () =>
      state.status === 'ready'
        ? aggregateGeography(filtered, level, demoReferences, demoGeometry)
        : null,
    [filtered, level, state.status],
  );
  const links = useMemo(
    () => collaborationLinks(filtered, demoReferences, demoGeometry),
    [filtered],
  );
  const thresholds = useMemo(
    () =>
      session.thresholds ||
      automaticThresholds(Math.max(0, ...(snapshot?.nodes.map((n) => n.records.length) || []))),
    [session.thresholds, snapshot],
  );
  const summary = useMemo(() => summarizeRecords(filtered), [filtered]);
  const unlocatedIds = useMemo(() => new Set(snapshot?.unlocated.map((r) => r.id)), [snapshot]);
  const contextRecords = useMemo(
    () =>
      inspection
        ? filtered.filter(
            (r) =>
              r.location.governorateId === inspection.governorateId &&
              (!inspection.city || r.location.city === inspection.city),
          )
        : EMPTY,
    [filtered, inspection],
  );
  // Only geography changes replace the previewed location. Other filters refresh its data in place.
  useEffect(() => {
    setInspection(
      query.gov ? { governorateId: query.gov, ...(query.city ? { city: query.city } : {}) } : null,
    );
  }, [query.gov, query.city]);
  useEffect(() => {
    const escape = (event: KeyboardEvent) => {
      if (
        event.key === 'Escape' &&
        !event.defaultPrevented &&
        !filtersOpen &&
        !layersOpen &&
        recordId === null &&
        !(contextOpen && compact)
      )
        setInspection(null);
    };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, [filtersOpen, layersOpen, recordId, contextOpen, compact]);
  const clearGeography = () => {
    queryState.setFilters({ gov: '', city: '' });
    setInspection(null);
    setContextOpen(false);
  };
  const inspect = (selection: GeographicSelection) => {
    setInspection(selection);
    setContextOpen(compact);
  };
  const selectGovernorate = (id: string) => {
    const selected = query.gov === id;
    queryState.setFilters({ gov: selected ? '' : id, city: '' });
    setInspection(selected ? null : { governorateId: id });
    setContextOpen(!selected && compact);
  };
  const focusLocation = (selection: GeographicSelection) => {
    const point = selection.city
      ? demoReferences.cities.find(
          (c) => c.governorate_id === selection.governorateId && c.name_ar === selection.city,
        )
      : demoReferences.governorates.find((g) => g.id === selection.governorateId);
    if (!point) return;
    const [x, y] = projectCoordinate(demoGeometry, point.lon, point.lat);
    const width = demoGeometry.W / (selection.city ? 4.8 : 2.6),
      height = (width * demoGeometry.H) / demoGeometry.W;
    session.move({ x: x - width / 2, y: y - height / 2, width, height });
    setMode('map');
  };
  const showRecords = () => {
    if (!inspection) return;
    queryState.setFilters({ gov: inspection.governorateId, city: inspection.city || '' });
    focusLocation(inspection);
    setMode('records');
    setContextOpen(false);
  };
  const closeContext = () => {
    setInspection(null);
    setContextOpen(false);
  };
  const context = (
    <LocationContext
      selection={inspection}
      records={contextRecords}
      ready={state.status === 'ready'}
      onClose={closeContext}
      onFocus={() => {
        if (inspection) focusLocation(inspection);
        setContextOpen(false);
      }}
      onRecords={showRecords}
      onCity={inspect}
    />
  );
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      notify(t('geo.copied'));
    } catch {
      notify(t('geo.copyFailed'), 'warning');
    }
  };
  const metricValues = [
    summary.records,
    summary.universities,
    summary.researcherNameStrings,
    summary.governorates,
    summary.latestYear,
  ];
  return (
    <div className="explorer-workspace">
      <header className="geo-workspace-header">
        <div>
          <div className="geo-eyebrow">
            <span className="geo-eyebrow-line" />
            {t('geo.phase')}
            <span> / </span>
            {t('geo.syria')}
          </div>
          <h1 id="workspace-heading" tabIndex={-1}>
            {t('geo.title')}
          </h1>
          <p>{t('geo.intro')}</p>
        </div>
        <div className="geo-header-actions">
          <Badge tone="neutral">
            <FlaskConical size={13} />
            {t('geo.sample')}
          </Badge>
          <IconButton label={t('geo.copy')} onClick={() => void copy()}>
            <Link2 size={17} />
          </IconButton>
        </div>
      </header>
      <QueryContext onEdit={() => setFiltersOpen(true)} />
      {state.status === 'error' && (
        <Alert tone="danger" title={t('geo.unavailable')}>
          <p>{t('geo.unavailableHint')}</p>
          <p>{t('geo.notZero')}</p>
          <Button size="sm" onClick={retry}>
            {t('geo.retry')}
          </Button>
        </Alert>
      )}
      <div className="geo-toolbar">
        <nav className="geo-breadcrumb" aria-label={t('geo.context')}>
          <button
            onClick={() => {
              clearGeography();
              session.move(nationalViewport(demoGeometry));
              setMode('map');
            }}
          >
            <MapPin size={15} />
            {t('geo.national')}
          </button>
          {query.gov && (
            <>
              <ChevronRight className="directional-icon" size={13} />
              <button onClick={() => queryState.clearFilter('city')}>
                {locationName({ governorateId: query.gov }, locale)}
              </button>
            </>
          )}
          {query.city && (
            <>
              <ChevronRight className="directional-icon" size={13} />
              <span>{locationName({ governorateId: query.gov, city: query.city }, locale)}</span>
            </>
          )}
        </nav>
        <div className="geo-toolbar-actions">
          <Button
            size="sm"
            variant="secondary"
            icon={<SlidersHorizontal size={15} />}
            onClick={() => setFiltersOpen(true)}
          >
            {t('geo.filters')}
            {queryState.activeFilters.length > 0 && (
              <span className="geo-filter-number">
                {formatNumber(queryState.activeFilters.length)}
              </span>
            )}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            icon={<Layers2 size={15} />}
            onClick={() => setLayersOpen(true)}
          >
            {t('geo.layers')}
          </Button>
        </div>
      </div>
      <div className="geo-workspace-grid">
        <section className="geo-canvas-panel" aria-label={t('geo.list')}>
          <header className="geo-canvas-header">
            <div className="geo-view-toggle" role="group" aria-label={t('geo.list')}>
              <button aria-pressed={mode === 'map'} onClick={() => setMode('map')}>
                <Map size={15} />
                {t('geo.map')}
              </button>
              <button aria-pressed={mode === 'records'} onClick={() => setMode('records')}>
                <Rows3 size={15} />
                {t('geo.list')}
              </button>
            </div>
            <span className="geo-result-count" role="status" data-testid="result-count">
              {state.status === 'ready'
                ? t('geo.results', { n: formatNumber(filtered.length) })
                : '—'}
            </span>
          </header>
          {mode === 'map' ? (
            <div className="geo-canvas-wrap">
              <MapCanvas
                geometry={demoGeometry}
                snapshot={snapshot}
                level={level}
                selectedGov={query.gov}
                links={links}
                thresholds={thresholds}
                onSelect={selectGovernorate}
                onInspect={inspect}
                onRecord={setRecordId}
                onClear={clearGeography}
              />
              {state.status === 'loading' && (
                <div className="geo-map-message">
                  <Spinner />
                  <span>{t('geo.loading')}</span>
                </div>
              )}
              {state.status === 'error' && (
                <div className="geo-map-message geo-map-message--error">
                  <Info size={20} />
                  <span>{t('geo.unavailable')}</span>
                </div>
              )}
              {state.status === 'ready' && !filtered.length && (
                <div className="geo-map-empty">
                  <strong>{t('geo.none')}</strong>
                  <span>{t('geo.noneHint')}</span>
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={<RotateCcw size={13} />}
                    onClick={queryState.reset}
                  >
                    {t('geo.clearAll')}
                  </Button>
                </div>
              )}
            </div>
          ) : state.status === 'ready' ? (
            <MapRecordList records={filtered} unlocatedIds={unlocatedIds} onRecord={setRecordId} />
          ) : (
            <div className="geo-list-unavailable">
              {state.status === 'loading' ? <Spinner /> : t('geo.unavailable')}
            </div>
          )}
          <footer className="geo-canvas-footer">
            <div className="geo-mini-legend">
              <i style={{ background: 'var(--map-cluster-1)' }} />
              <i style={{ background: 'var(--map-cluster-2)' }} />
              <i style={{ background: 'var(--map-cluster-3)' }} />
              <i style={{ background: 'var(--map-cluster-4)' }} />
              <button onClick={() => setLayersOpen(true)}>{t('geo.legendInfo')}</button>
            </div>
            <span>
              {snapshot
                ? t('geo.plotted', { n: formatNumber(snapshot.plotted) })
                : t('geo.unavailable')}
            </span>
          </footer>
        </section>
        <aside className="geo-context-rail">
          {context}
          <div className="geo-context-rail-foot">
            <Info size={15} />
            <p>{t('geo.scopeNote')}</p>
          </div>
        </aside>
      </div>
      <div className="geo-mobile-context">
        <Button
          variant="secondary"
          icon={<MapPin size={16} />}
          onClick={() => setContextOpen(true)}
        >
          {inspection ? locationName(inspection, locale) : t('geo.inspectPrompt')}
        </Button>
      </div>
      {snapshot && snapshot.unlocated.length > 0 && (
        <Alert
          tone="warning"
          title={t('geo.unlocated', { n: formatNumber(snapshot.unlocated.length) })}
        >
          {t('geo.noCitiesAtZoom')}{' '}
          <button className="geo-inline-action" onClick={() => setMode('records')}>
            {t('geo.list')}
          </button>
        </Alert>
      )}
      <div className="geo-under-map">
        <p>
          <Info size={14} />
          {t('geo.scopeNote')}
        </p>
        <span>{t('geo.keyboard')}</span>
      </div>
      <Disclosure title={t('geo.summary')}>
        <div className="geo-summary">
          {['records', 'universities', 'researchers', 'governorates', 'latest'].map((name, i) => (
            <div key={name}>
              <span>{t(`geo.${name}Metric`)}</span>
              <strong>
                {state.status === 'ready' && metricValues[i] !== null
                  ? formatNumber(metricValues[i]!, { useGrouping: name !== 'latest' })
                  : '—'}
              </strong>
            </div>
          ))}
        </div>
        <p className="geo-help">{t('geo.namesNote')}</p>
      </Disclosure>
      <Drawer
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        title={t('geo.filters')}
        description={t('geo.filterHint')}
        footer={
          <>
            <Button variant="ghost" onClick={queryState.reset}>
              {t('geo.clearAll')}
            </Button>
            <Button onClick={() => setFiltersOpen(false)}>{t('apply')}</Button>
          </>
        }
      >
        <ExplorerFilters records={records} role={session.role} />
      </Drawer>
      <Drawer
        open={layersOpen}
        onOpenChange={setLayersOpen}
        title={t('geo.layerTitle')}
        description={t('geo.scopeNote')}
      >
        <VisualizationSettings thresholds={thresholds} links={links} />
      </Drawer>
      <Drawer
        open={contextOpen && compact}
        onOpenChange={setContextOpen}
        title={t('geo.context')}
        contentClassName="geo-context-sheet"
      >
        <div>{context}</div>
      </Drawer>
      <MapRecordPreview
        record={filtered.find((r) => r.id === recordId)}
        open={recordId !== null}
        onClose={() => setRecordId(null)}
        onKeyword={(word) => {
          queryState.setFilter('kw', word);
          setRecordId(null);
        }}
      />
    </div>
  );
}
