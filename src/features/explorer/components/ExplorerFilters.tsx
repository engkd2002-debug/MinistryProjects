import { useEffect, useMemo, useState } from 'react';
import { Button, Disclosure, Field, Input, Select, Alert } from '../../../shared/ui';
import { useI18n } from '../../../shared/i18n';
import { useQueryState } from '../../../shared/query';
import { demoReferences } from '../../../data/demo/references';
import { filterRecords } from '../../../domain/research/filter';
import type { QueryKey } from '../../../domain/research/query';
import type { DemoRole, ResearchRecord } from '../../../domain/research/models';
const unique = (values: (string | number)[]) =>
  [...new Set(values.map(String).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, 'ar', { numeric: true }),
  );
const fieldValue = (r: ResearchRecord, key: string) =>
  ({
    gov: r.location.governorateId,
    city: r.location.city,
    uni: r.affiliation.university,
    spec: r.subject.specialty,
    branch: r.subject.branch,
    type: r.researchType,
    year: String(r.year),
    researcher: r.contributors.main,
  })[key] ??
  r.customValues[key] ??
  '';
export function ExplorerFilters({
  records,
  role,
}: {
  records: readonly ResearchRecord[];
  role: DemoRole;
}) {
  const { t, locale, formatNumber } = useI18n();
  const state = useQueryState();
  const { query } = state;
  const [range, setRange] = useState({ from: query.yf, to: query.yt });
  const [rangeError, setRangeError] = useState(false);
  useEffect(() => setRange({ from: query.yf, to: query.yt }), [query.yf, query.yt]);
  const context = useMemo(
    () => ({ role, language: locale, governorates: demoReferences.governorates }),
    [role, locale],
  );
  const options = (key: QueryKey, recordKey: string = key) => {
    const items = unique(
      filterRecords(records, query, { ...context, skip: key }).map((r) => fieldValue(r, recordKey)),
    );
    const current = query[key];
    if (typeof current === 'string' && current && !items.includes(current)) items.unshift(current);
    return items;
  };
  const label = (key: string, value: string) => {
    if (key === 'gov') {
      const g = demoReferences.governorates.find((g) => g.id === value);
      return g?.[locale === 'en' ? 'name_en' : 'name_ar'] || value;
    }
    if (key === 'city') {
      const c = demoReferences.cities.find((c) => c.name_ar === value);
      return c?.[locale === 'en' ? 'name_en' : 'name_ar'] || value;
    }
    if (key === 'type')
      return (
        demoReferences.types.find((x) => x.name_ar === value)?.[
          locale === 'en' ? 'name_en' : 'name_ar'
        ] || value
      );
    return value;
  };
  const facets: [QueryKey, string][] = [
    ['gov', 'governorate'],
    ['city', 'city'],
    ['uni', 'uni'],
    ['spec', 'spec'],
    ['branch', 'branch'],
    ['type', 'type'],
  ];
  const years = unique([
    ...filterRecords(records, query, { ...context, skip: 'yr' }).map((r) => r.year),
    ...query.yr,
  ]).sort((a, b) => Number(b) - Number(a));
  const categories = demoReferences.categories;
  const categoryValues = options('catv', query.cat || 'city');
  const applyRange = () => {
    const { from, to } = range;
    const valid =
      (!from || /^\d{4}$/.test(from)) &&
      (!to || /^\d{4}$/.test(to)) &&
      (!from || !to || Number(from) <= Number(to));
    setRangeError(!valid);
    if (valid) state.setFilters({ yf: from, yt: to });
  };
  return (
    <div className="geo-filter-form">
      <Field htmlFor="geo-query" label={t('query')}>
        <Input
          type="search"
          id="geo-query"
          value={query.q}
          placeholder={t('queryPlaceholder')}
          onChange={(e) => state.setFilter('q', e.target.value)}
        />
      </Field>
      <div className="geo-filter-facets">
        {facets.map(([key, title]) => (
          <Field key={key} htmlFor={`geo-filter-${key}`} label={t(title)}>
            <Select
              id={`geo-filter-${key}`}
              value={query[key] as string}
              onChange={(e) => state.setFilter(key, e.target.value)}
            >
              <option value="">{t('geo.all')}</option>
              {options(key).map((value) => (
                <option key={value} value={value}>
                  {label(key, value)}
                </option>
              ))}
            </Select>
          </Field>
        ))}
      </div>
      <Field htmlFor="geo-researcher" label={t('res')}>
        <Input
          id="geo-researcher"
          value={query.res}
          onChange={(e) => state.setFilter('res', e.target.value)}
        />
      </Field>
      <Disclosure title={t('geo.years')} defaultOpen>
        <p className="geo-help">{t('geo.yearsHint')}</p>
        <div className="geo-year-options">
          {years.map((year) => (
            <button
              key={year}
              aria-pressed={query.yr.includes(year)}
              onClick={() =>
                state.setFilter(
                  'yr',
                  query.yr.includes(year)
                    ? query.yr.filter((y) => y !== year)
                    : [...query.yr, year],
                )
              }
            >
              {formatNumber(Number(year), { useGrouping: false })}
            </button>
          ))}
        </div>
        <Button
          size="sm"
          variant="ghost"
          disabled={!query.yr.length}
          onClick={() => state.setFilter('yr', [])}
        >
          {t('geo.clearYears')}
        </Button>
      </Disclosure>
      <Disclosure title={t('geo.range')}>
        <div className="geo-filter-facets">
          <Field htmlFor="geo-from" label={t('yf')}>
            <Input
              id="geo-from"
              type="number"
              inputMode="numeric"
              value={range.from}
              onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))}
            />
          </Field>
          <Field htmlFor="geo-to" label={t('yt')}>
            <Input
              id="geo-to"
              type="number"
              inputMode="numeric"
              value={range.to}
              onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))}
            />
          </Field>
        </div>
        {rangeError && <Alert tone="danger" title={t('geo.rangeError')} />}
        <Button size="sm" onClick={applyRange}>
          {t('geo.applyRange')}
        </Button>
      </Disclosure>
      <Disclosure title={t('geo.category')}>
        <Field htmlFor="geo-category" label={t('geo.category')}>
          <Select
            id="geo-category"
            value={query.cat}
            onChange={(e) => state.setFilter('cat', e.target.value)}
          >
            <option value="">{t('geo.categoryNone')}</option>
            {query.cat && !categories.some((c) => c.k === query.cat) && (
              <option value={query.cat}>
                {t('geo.customCategory')} · {query.cat}
              </option>
            )}
            {categories.map((c) => (
              <option key={c.k} value={c.k}>
                {c.l.split('|')[locale === 'en' ? 1 : 0] || c.l}
              </option>
            ))}
          </Select>
        </Field>
        <Field htmlFor="geo-category-value" label={t('geo.allValues')}>
          <Select
            id="geo-category-value"
            disabled={!query.cat}
            value={query.catv}
            onChange={(e) => state.setFilter('catv', e.target.value)}
          >
            <option value="">{t('geo.allValues')}</option>
            {categoryValues.map((v) => (
              <option key={v} value={v}>
                {label(query.cat, v)}
              </option>
            ))}
          </Select>
        </Field>
      </Disclosure>
      <Field htmlFor="geo-keyword" label={t('kw')}>
        <Input
          id="geo-keyword"
          value={query.kw}
          onChange={(e) => state.setFilter('kw', e.target.value)}
        />
      </Field>
    </div>
  );
}
