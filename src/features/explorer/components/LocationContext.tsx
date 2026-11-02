import { ArrowUpRight, Focus, MapPin, X } from 'lucide-react';
import { useI18n } from '../../../shared/i18n';
import { Badge, Button, IconButton } from '../../../shared/ui';
import { demoReferences } from '../../../data/demo/references';
import { topValues, type GeographicSelection } from '../../../domain/geography/aggregation';
import type { ResearchRecord } from '../../../domain/research/models';
export function locationName(selection: GeographicSelection, locale: 'ar' | 'en') {
  if (selection.city) {
    const c = demoReferences.cities.find(
      (c) => c.governorate_id === selection.governorateId && c.name_ar === selection.city,
    );
    return c?.[locale === 'en' ? 'name_en' : 'name_ar'] || selection.city;
  }
  const g = demoReferences.governorates.find((g) => g.id === selection.governorateId);
  return g?.[locale === 'en' ? 'name_en' : 'name_ar'] || selection.governorateId;
}
export function LocationContext({
  selection,
  records,
  ready,
  onClose,
  onFocus,
  onRecords,
  onCity,
}: {
  selection: GeographicSelection | null;
  records: readonly ResearchRecord[];
  ready: boolean;
  onClose: () => void;
  onFocus: () => void;
  onRecords: () => void;
  onCity: (s: GeographicSelection) => void;
}) {
  const { t, locale, formatNumber } = useI18n();
  if (!selection)
    return (
      <div className="geo-context-placeholder">
        <MapPin size={23} />
        <h2>{t('geo.inspectPrompt')}</h2>
        <p>{t('geo.inspectHint')}</p>
        <p>{t('geo.registeredOnly')}</p>
      </div>
    );
  const rows = (items: [string, number][]) =>
    items.length ? (
      <ul className="geo-context-values">
        {items.map(([name, count]) => (
          <li key={name}>
            <bdi>{name}</bdi>
            <span>{formatNumber(count)}</span>
          </li>
        ))}
      </ul>
    ) : (
      <p className="geo-help">{t('geo.emptyValue')}</p>
    );
  const cities = [...new Set(records.map((r) => r.location.city))].filter((city) =>
    demoReferences.cities.some(
      (c) => c.governorate_id === selection.governorateId && c.name_ar === city,
    ),
  );
  const missing = records.filter(
    (r) =>
      !demoReferences.cities.some(
        (c) => c.governorate_id === r.location.governorateId && c.name_ar === r.location.city,
      ),
  ).length;
  return (
    <section className="geo-context-content" aria-label={t('geo.context')}>
      <header>
        <div>
          <span className="geo-overline">{t('geo.context')}</span>
          <h2>{locationName(selection, locale)}</h2>
        </div>
        <IconButton label={t('geo.closeContext')} onClick={onClose}>
          <X size={18} />
        </IconButton>
      </header>
      <Badge tone="neutral">{t('geo.contextScope')}</Badge>
      {ready ? (
        <>
          <div className="geo-context-count">
            <strong>{formatNumber(records.length)}</strong>
            <span>{t('geo.recordsMetric')}</span>
          </div>
          {!records.length && <p className="geo-help">{t('geo.noLocationRecords')}</p>}
          <h3>{t('geo.topUniversities')}</h3>
          {rows(topValues(records, (r) => r.affiliation.university))}
          <h3>{t('geo.topSpecialties')}</h3>
          {rows(topValues(records, (r) => r.subject.specialty))}
          {!selection.city && (
            <>
              <h3>{t('geo.cities')}</h3>
              <div className="geo-context-cities">
                {cities.length ? (
                  cities.map((city) => {
                    const item = { governorateId: selection.governorateId, city };
                    return (
                      <button key={city} onClick={() => onCity(item)}>
                        <MapPin size={13} />
                        {locationName(item, locale)}
                        <ArrowUpRight size={13} />
                      </button>
                    );
                  })
                ) : (
                  <p className="geo-help">{t('geo.noCity')}</p>
                )}
              </div>
            </>
          )}
          {missing > 0 && (
            <p className="geo-location-warning">
              {t('geo.unknownCity', { n: formatNumber(missing) })}
            </p>
          )}
          <div className="geo-context-actions">
            <Button variant="primary" onClick={onRecords}>
              {t('geo.showRecords')}
            </Button>
            <Button variant="ghost" onClick={onFocus} icon={<Focus size={16} />}>
              {t('geo.focus')}
            </Button>
          </div>
        </>
      ) : (
        <p className="geo-help">{t('geo.unavailable')}</p>
      )}
      <p className="geo-context-caveat">{t('geo.scopeNote')}</p>
    </section>
  );
}
