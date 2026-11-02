import { useId, useMemo, useRef, useState } from 'react';
import { Plus, Minus, Expand, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Move } from 'lucide-react';
import type { VectorGeometry } from '../../../domain/geography/models';
import type {
  GeographicSnapshot,
  GeographicNode,
  CollaborationLink,
  CountThresholds,
} from '../../../domain/geography/aggregation';
import { layoutClusters } from '../../../domain/geography/aggregation';
import {
  nationalViewport,
  panViewport,
  viewportString,
  zoomRatio,
  zoomViewport,
} from '../../../domain/geography/viewport';
import { useI18n } from '../../../shared/i18n';
import { IconButton, Disclosure } from '../../../shared/ui';
import { useExplorerSession } from '../state/ExplorerSession';
import { useElementSize, useMapViewport } from '../hooks/useMapViewport';
import { useMapGestures } from '../hooks/useMapGestures';
import {
  ClusterLayer,
  GeographicShapes,
  GovernorateLabels,
  ConcentrationLayer,
  CollaborationLayer,
} from './MapLayers';
interface Props {
  geometry: VectorGeometry;
  snapshot: GeographicSnapshot | null;
  level: 1 | 2 | 3;
  selectedGov: string;
  links: CollaborationLink[];
  thresholds: CountThresholds;
  onSelect: (id: string) => void;
  onInspect: (n: GeographicNode) => void;
  onRecord: (id: string) => void;
  onClear: () => void;
}
export function MapCanvas({
  geometry,
  snapshot,
  level,
  selectedGov,
  links,
  thresholds,
  onSelect,
  onInspect,
  onRecord,
  onClear,
}: Props) {
  const { t, formatNumber } = useI18n();
  const session = useExplorerSession();
  const container = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const size = useElementSize(container);
  const [initialView] = useState(session.viewport);
  const current = useMapViewport(svg, session.viewport, session.animate);
  const moved = useMapGestures(svg, current, geometry, session.move);
  const unit = Math.max(session.viewport.width / size.width, session.viewport.height / size.height);
  const nodes = useMemo(
    () => layoutClusters(snapshot?.nodes || [], unit, level),
    [snapshot, unit, level],
  );
  const prefix = useId().replace(/:/g, '');
  const select = (id: string) => {
    if (!moved.current) onSelect(id);
  };
  const inspect = (n: GeographicNode) => {
    if (!moved.current) onInspect(n);
  };
  const zoom = (factor: number) => session.move(zoomViewport(current.current, factor, geometry));
  const pan = (dx: number, dy: number) =>
    session.move(
      panViewport(
        current.current,
        dx * session.viewport.width * 0.15,
        dy * session.viewport.height * 0.15,
      ),
    );
  return (
    <div ref={container} className="geo-map-frame" data-testid="map-frame">
      <svg
        ref={svg}
        className="geo-map"
        viewBox={viewportString(initialView)}
        role="group"
        aria-label={t('geo.mapLabel')}
        aria-describedby={`${prefix}-description`}
        tabIndex={0}
        data-level={level}
        onKeyDownCapture={() => {
          moved.current = false;
        }}
        onClick={(e) => {
          if (e.target === svg.current && !moved.current) onClear();
        }}
        onKeyDown={(e) => {
          if (e.target !== e.currentTarget) return;
          const directions: Record<string, [number, number]> = {
            ArrowUp: [0, -1],
            ArrowDown: [0, 1],
            ArrowLeft: [-1, 0],
            ArrowRight: [1, 0],
          };
          if (directions[e.key]) {
            e.preventDefault();
            pan(...directions[e.key]);
          } else if (e.key === '+' || e.key === '=') {
            e.preventDefault();
            zoom(1.5);
          } else if (e.key === '-') {
            e.preventDefault();
            zoom(1 / 1.5);
          } else if (e.key === 'Home') {
            e.preventDefault();
            session.move(nationalViewport(geometry));
          }
        }}
      >
        <desc id={`${prefix}-description`}>{t('geo.mapDescription')}</desc>
        <defs>
          <pattern
            id={`${prefix}-empty`}
            width={8 * unit}
            height={8 * unit}
            patternUnits="userSpaceOnUse"
          >
            <rect width="100%" height="100%" fill="var(--map-no-match)" />
            <path d={`M0 ${8 * unit}L${8 * unit} 0`} stroke="var(--map-hatch)" strokeWidth={unit} />
          </pattern>
          <pattern
            id={`${prefix}-unknown`}
            width={10 * unit}
            height={10 * unit}
            patternUnits="userSpaceOnUse"
          >
            <rect width="100%" height="100%" fill="var(--map-unknown)" />
            <circle cx={5 * unit} cy={5 * unit} r={unit} fill="var(--map-hatch)" />
          </pattern>
          <filter id={`${prefix}-blur`} x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation={18 * unit} />
          </filter>
        </defs>
        <GeographicShapes
          geometry={geometry}
          snapshot={snapshot}
          selectedGov={selectedGov}
          gaps={session.layers.gaps}
          patternPrefix={prefix}
          viewport={session.viewport}
          onSelect={select}
        />
        {level > 1 && <GovernorateLabels geometry={geometry} worldPerPixel={unit} />}
        {snapshot && session.layers.heat && (
          <ConcentrationLayer
            nodes={nodes}
            worldPerPixel={unit}
            thresholds={thresholds}
            prefix={prefix}
          />
        )}
        {snapshot && session.layers.collaboration && (
          <CollaborationLayer links={links} worldPerPixel={unit} />
        )}
        <ClusterLayer
          nodes={nodes}
          level={level}
          worldPerPixel={unit}
          viewport={session.viewport}
          thresholds={thresholds}
          onInspect={inspect}
          onRecord={(id) => {
            if (!moved.current) onRecord(id);
          }}
        />
      </svg>
      <div className="geo-level" role="status">
        <span className="geo-level-dot" />
        {t(`geo.level${level}`)}
        <span aria-hidden="true">/</span>
        <bdi>
          {t('geo.zoomPercent', {
            n: formatNumber(Math.round(zoomRatio(session.viewport, geometry) * 10) / 10),
          })}
        </bdi>
      </div>
      <div className="geo-map-controls" role="group" aria-label={t('geo.mapLabel')}>
        <IconButton
          label={t('geo.zoomIn')}
          onClick={() => zoom(1.5)}
          disabled={session.viewport.width <= 40}
        >
          <Plus />
        </IconButton>
        <IconButton
          label={t('geo.zoomOut')}
          onClick={() => zoom(1 / 1.5)}
          disabled={session.viewport.width >= geometry.W + 40}
        >
          <Minus />
        </IconButton>
        <span className="geo-control-rule" />
        <IconButton
          label={t('geo.resetView')}
          onClick={() => session.move(nationalViewport(geometry))}
        >
          <Expand />
        </IconButton>
      </div>
      <div className="geo-direction-controls">
        <Disclosure
          title={
            <span>
              <Move size={14} />
              <span className="sr-only">{t('geo.panControls')}</span>
            </span>
          }
        >
          <div className="geo-pan-grid">
            <IconButton label={t('geo.panUp')} onClick={() => pan(0, -1)}>
              <ArrowUp />
            </IconButton>
            <IconButton label={t('geo.panLeft')} onClick={() => pan(-1, 0)}>
              <ArrowLeft />
            </IconButton>
            <IconButton label={t('geo.panDown')} onClick={() => pan(0, 1)}>
              <ArrowDown />
            </IconButton>
            <IconButton label={t('geo.panRight')} onClick={() => pan(1, 0)}>
              <ArrowRight />
            </IconButton>
          </div>
        </Disclosure>
      </div>
      <span className="geo-north" aria-hidden="true">
        N<span>↑</span>
      </span>
    </div>
  );
}
