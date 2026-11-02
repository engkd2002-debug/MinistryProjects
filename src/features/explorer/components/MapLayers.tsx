import type {
  GeographicSnapshot,
  ClusterNode,
  CollaborationLink,
  CountThresholds,
} from '../../../domain/geography/aggregation';
import { countClass, sampleDots } from '../../../domain/geography/aggregation';
import type { MapViewport, VectorGeometry } from '../../../domain/geography/models';
import { pointInViewport } from '../../../domain/geography/viewport';
import { demoReferences } from '../../../data/demo/references';
import { displayContent, type ResearchRecord } from '../../../domain/research/models';
import { useI18n } from '../../../shared/i18n';
interface ShapesProps {
  geometry: VectorGeometry;
  snapshot: GeographicSnapshot | null;
  selectedGov: string;
  gaps: boolean;
  patternPrefix: string;
  viewport: MapViewport;
  onSelect: (id: string) => void;
}
export function GeographicShapes({
  geometry,
  snapshot,
  selectedGov,
  gaps,
  patternPrefix,
  viewport,
  onSelect,
}: ShapesProps) {
  const { locale, t, formatNumber } = useI18n();
  const max = Math.max(1, ...Object.values(snapshot?.governorateCounts || {}));
  return (
    <g className="map-regions">
      {geometry.f.map((region) => {
        const gov = demoReferences.governorates.find((g) => g.id === region.id)!;
        const count = snapshot?.governorateCounts[region.id] || 0;
        let fill: string | undefined;
        if (!snapshot) fill = `url(#${patternPrefix}-unknown)`;
        else if (gaps)
          fill = count
            ? `color-mix(in srgb,var(--map-density-high) ${Math.round(18 + (count / max) * 70)}%,var(--map-land))`
            : `url(#${patternPrefix}-empty)`;
        const [x, y] = [
          (gov.lon - geometry.p.lon0) * geometry.p.c * geometry.p.k,
          (geometry.p.lat1 - gov.lat) * geometry.p.k,
        ];
        return (
          <path
            key={region.id}
            d={region.d}
            role="button"
            tabIndex={pointInViewport(x, y, viewport) ? 0 : -1}
            data-governorate={region.id}
            aria-label={t(snapshot ? 'geo.regionLabel' : 'geo.regionUnavailable', {
              name: locale === 'ar' ? gov.name_ar : gov.name_en,
              n: formatNumber(count),
            })}
            aria-pressed={selectedGov === region.id}
            className={`map-region ${selectedGov === region.id ? 'is-selected' : ''}`}
            style={fill ? { fill } : undefined}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(region.id);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                onSelect(region.id);
              }
            }}
          >
            <title>{locale === 'ar' ? gov.name_ar : gov.name_en}</title>
          </path>
        );
      })}
    </g>
  );
}
export function ConcentrationLayer({
  nodes,
  worldPerPixel,
  thresholds,
  prefix,
}: {
  nodes: ClusterNode[];
  worldPerPixel: number;
  thresholds: CountThresholds;
  prefix: string;
}) {
  const max = Math.max(1, ...nodes.map((n) => n.records.length));
  return (
    <g className="map-heat" aria-hidden="true" filter={`url(#${prefix}-blur)`}>
      {nodes.map((n) => (
        <circle
          key={n.key}
          cx={n.anchorX}
          cy={n.anchorY}
          r={(28 + Math.sqrt(n.records.length / max) * 70) * worldPerPixel}
          fill={`var(--map-cluster-${countClass(n.records.length, thresholds)})`}
        />
      ))}
    </g>
  );
}
export function GovernorateLabels({
  geometry,
  worldPerPixel,
}: {
  geometry: VectorGeometry;
  worldPerPixel: number;
}) {
  const { locale } = useI18n();
  return (
    <g aria-hidden="true">
      {demoReferences.governorates.map((g) => (
        <text
          key={g.id}
          x={(g.lon - geometry.p.lon0) * geometry.p.c * geometry.p.k}
          y={(geometry.p.lat1 - g.lat) * geometry.p.k}
          className="map-label map-reference-label"
          style={{ fontSize: 11 * worldPerPixel, strokeWidth: 3 * worldPerPixel }}
          textAnchor="middle"
        >
          {g[locale === 'en' ? 'name_en' : 'name_ar']}
        </text>
      ))}
    </g>
  );
}
export function CollaborationLayer({
  links,
  worldPerPixel,
}: {
  links: CollaborationLink[];
  worldPerPixel: number;
}) {
  const { t, formatNumber } = useI18n();
  return (
    <g className="map-links" aria-label={t('geo.collaboration')}>
      {links.map((link) => {
        const [a, b] = [link.from, link.to],
          mx = (a[0] + b[0]) / 2,
          my = (a[1] + b[1]) / 2,
          dx = b[0] - a[0],
          dy = b[1] - a[1];
        return (
          <g key={`${link.a}|${link.b}`}>
            <path
              className="map-link"
              d={`M${a[0]} ${a[1]}Q${mx - dy * 0.18} ${my + dx * 0.18} ${b[0]} ${b[1]}`}
              strokeWidth={Math.min(5, 1 + link.weight * 0.5)}
            >
              <title>
                {t('geo.linkLabel', { a: link.a, b: link.b, n: formatNumber(link.weight) })}
              </title>
            </path>
            {[a, b].map((p, i) => (
              <circle
                key={i}
                cx={p[0]}
                cy={p[1]}
                r={2.5 * worldPerPixel}
                className="map-link-end"
                aria-hidden="true"
              />
            ))}
          </g>
        );
      })}
    </g>
  );
}
export function ClusterLayer({
  nodes,
  level,
  worldPerPixel,
  viewport,
  thresholds,
  onInspect,
  onRecord,
}: {
  nodes: ClusterNode[];
  level: number;
  worldPerPixel: number;
  viewport: MapViewport;
  thresholds: CountThresholds;
  onInspect: (n: ClusterNode) => void;
  onRecord: (id: string) => void;
}) {
  const { locale, t, formatNumber } = useI18n();
  const name = (n: ClusterNode) => {
    if (n.city) {
      const city = demoReferences.cities.find(
        (c) => c.name_ar === n.city && c.governorate_id === n.governorateId,
      );
      return locale === 'en' ? city?.name_en || n.city : n.city;
    }
    const gov = demoReferences.governorates.find((g) => g.id === n.governorateId)!;
    return locale === 'en' ? gov.name_en : gov.name_ar;
  };
  const activate = (event: React.KeyboardEvent, action: () => void) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.stopPropagation();
      action();
    }
  };
  return (
    <g className="map-clusters">
      {nodes.map((n) => (
        <g key={n.key} data-cluster={n.key}>
          {Math.hypot(n.x - n.anchorX, n.y - n.anchorY) > 6 * worldPerPixel && (
            <g aria-hidden="true">
              <line className="map-anchor-line" x1={n.anchorX} y1={n.anchorY} x2={n.x} y2={n.y} />
              <circle
                className="map-anchor"
                cx={n.anchorX}
                cy={n.anchorY}
                r={2.6 * worldPerPixel}
              />
            </g>
          )}
          <g
            className="map-node"
            role="button"
            tabIndex={pointInViewport(n.x, n.y, viewport) ? 0 : -1}
            aria-label={t('geo.clusterLabel', { name: name(n), n: formatNumber(n.records.length) })}
            onClick={(e) => {
              e.stopPropagation();
              onInspect(n);
            }}
            onKeyDown={(e) => activate(e, () => onInspect(n))}
          >
            <circle
              className="map-bubble"
              cx={n.x}
              cy={n.y}
              r={n.radius}
              fill={`var(--map-cluster-${countClass(n.records.length, thresholds)})`}
            />
            <text
              x={n.x}
              y={n.y}
              className="map-count"
              style={{ fontSize: 14 * worldPerPixel }}
              dominantBaseline="central"
              textAnchor="middle"
              aria-hidden="true"
            >
              {formatNumber(n.records.length)}
            </text>
            <text
              x={n.x}
              y={n.y + n.radius + 15 * worldPerPixel}
              className="map-label"
              textAnchor="middle"
              style={{ fontSize: 12 * worldPerPixel, strokeWidth: 3 * worldPerPixel }}
              aria-hidden="true"
            >
              {name(n)}
            </text>
          </g>
          {level === 3 &&
            sampleDots(n, worldPerPixel).map(({ record, x, y }) => (
              <g
                key={record.id}
                className="map-record-marker"
                role="button"
                tabIndex={pointInViewport(x, y, viewport) ? 0 : -1}
                aria-label={t('geo.recordMarker', { title: displayContent(record.title, locale) })}
                data-record-id={record.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onRecord(record.id);
                }}
                onKeyDown={(e) => activate(e, () => onRecord(record.id))}
              >
                <circle
                  cx={x}
                  cy={y}
                  r={Math.max(6 * worldPerPixel, 5 * worldPerPixel)}
                  className="map-record-dot"
                />
                <circle cx={x} cy={y} r={12 * worldPerPixel} fill="transparent" />
                <title>{displayContent(record.title, locale)}</title>
              </g>
            ))}
        </g>
      ))}
    </g>
  );
}
export function RecordListItem({
  record,
  onOpen,
  unlocated = false,
}: {
  record: ResearchRecord;
  onOpen: () => void;
  unlocated?: boolean;
}) {
  const { locale, t, formatNumber } = useI18n();
  return (
    <button className="geo-record-card" onClick={onOpen}>
      <strong dir="auto">{displayContent(record.title, locale)}</strong>
      <span>
        <bdi>{formatNumber(record.year, { useGrouping: false })}</bdi>
        <span aria-hidden="true">·</span>
        <bdi>{record.affiliation.university || t('geo.emptyValue')}</bdi>
      </span>
      <span className="geo-record-id">
        <bdi>{record.researchId}</bdi>
        {unlocated && <small>{t('geo.unmappedRecord')}</small>}
      </span>
    </button>
  );
}
