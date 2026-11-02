import { ArrowRight, SlidersHorizontal } from 'lucide-react';
import { useI18n } from '../i18n';
import { Button, FilterChip } from '../ui';
import { demoReferences } from '../../data/demo/references';
import { useQueryState } from './useQueryState';
import { useScope } from './ScopeContext';

export function QueryContext({ onEdit }: { onEdit?: () => void } = {}) {
  const { t, locale } = useI18n();
  const state = useQueryState();
  const { openScope } = useScope();
  const label = (key: string) =>
    t(key === 'q' ? 'queryLabel' : key === 'gov' ? 'governorate' : key);
  const value = (key: string, raw: string) => {
    if (key === 'gov')
      return (
        demoReferences.governorates.find((g) => g.id === raw)?.[
          locale === 'ar' ? 'name_ar' : 'name_en'
        ] || raw
      );
    if (key === 'city')
      return (
        demoReferences.cities.find((c) => c.name_ar === raw)?.[
          locale === 'ar' ? 'name_ar' : 'name_en'
        ] || raw
      );
    if (key === 'type')
      return (
        demoReferences.types.find((ty) => ty.name_ar === raw)?.[
          locale === 'ar' ? 'name_ar' : 'name_en'
        ] || raw
      );
    return raw;
  };
  return (
    <section className="query-context" aria-label={t('scope')}>
      <div className="query-context-label">
        <SlidersHorizontal size={16} />
        <strong>{t('scope')}</strong>
      </div>
      <div className="query-context-values">
        {state.activeFilters.length ? (
          state.activeFilters.map((filter) => (
            <FilterChip
              key={filter.key}
              removeLabel={`${t('clear')}: ${label(filter.key)}`}
              onRemove={() => state.clearFilter(filter.key)}
            >
              <span className="query-chip-label">{label(filter.key)}:</span>{' '}
              <bdi>{value(filter.key, filter.value)}</bdi>
            </FilterChip>
          ))
        ) : (
          <span className="query-context-empty">{t('contextEmpty')}</span>
        )}
      </div>
      <Button variant="ghost" size="sm" onClick={onEdit || openScope}>
        {t('editScope')}
        <ArrowRight size={14} className="directional-icon" />
      </Button>
      {state.diagnostics.length > 0 && <span className="query-warning">{t('invalidQuery')}</span>}
    </section>
  );
}
