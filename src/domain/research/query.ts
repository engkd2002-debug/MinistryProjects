import type { City } from '../geography/models';

export const scalarFilterKeys = [
  'q',
  'gov',
  'city',
  'uni',
  'spec',
  'branch',
  'yf',
  'yt',
  'res',
  'type',
  'kw',
  'cat',
  'catv',
] as const;
export type ScalarFilterKey = (typeof scalarFilterKeys)[number];
export type QueryKey = ScalarFilterKey | 'yr';
export type QueryState = Record<ScalarFilterKey, string> & { yr: string[] };
export interface QueryDiagnostic {
  key: string;
  reason: 'unknown' | 'invalid' | 'range' | 'too-long';
}
export const emptyQuery = (): QueryState => ({
  q: '',
  gov: '',
  city: '',
  uni: '',
  spec: '',
  branch: '',
  yf: '',
  yt: '',
  res: '',
  type: '',
  kw: '',
  cat: '',
  catv: '',
  yr: [],
});
const keys = new Set<string>([...scalarFilterKeys, 'yr']);
const yearValid = (year: string) => /^\d{4}$/.test(year);

export function parseQuery(
  input: URLSearchParams | string,
  governorateIds?: readonly string[],
): { query: QueryState; diagnostics: QueryDiagnostic[] } {
  const parameters =
    typeof input === 'string' ? new URLSearchParams(input.replace(/^[?#]/, '')) : input;
  const query = emptyQuery();
  const diagnostics: QueryDiagnostic[] = [];
  for (const [key, value] of parameters.entries()) {
    if (!keys.has(key)) {
      diagnostics.push({ key, reason: 'unknown' });
      continue;
    }
    if (value.length > 1024) {
      diagnostics.push({ key, reason: 'too-long' });
      continue;
    }
    if (key === 'yr') {
      const years = value.split(',').filter(Boolean);
      if (years.some((year) => !yearValid(year))) diagnostics.push({ key, reason: 'invalid' });
      query.yr = [...new Set([...query.yr, ...years.filter(yearValid)])].sort();
    } else if ((key === 'yf' || key === 'yt') && value && !yearValid(value)) {
      diagnostics.push({ key, reason: 'invalid' });
    } else if (key === 'gov' && value && governorateIds && !governorateIds.includes(value)) {
      diagnostics.push({ key, reason: 'invalid' });
    } else query[key as ScalarFilterKey] = value;
  }
  if (query.yf && query.yt && Number(query.yf) > Number(query.yt))
    diagnostics.push({ key: 'yf', reason: 'range' });
  if (query.catv && !query.cat) {
    query.catv = '';
    diagnostics.push({ key: 'catv', reason: 'invalid' });
  }
  return { query, diagnostics };
}

export function serializeQuery(query: QueryState): URLSearchParams {
  const parameters = new URLSearchParams();
  for (const key of scalarFilterKeys) if (query[key]) parameters.set(key, query[key]);
  if (query.yr.length) parameters.set('yr', [...new Set(query.yr)].sort().join(','));
  return parameters;
}

export function updateFilter<K extends QueryKey>(
  query: QueryState,
  key: K,
  value: QueryState[K],
  cities: readonly Pick<City, 'name_ar' | 'governorate_id'>[] = [],
): QueryState {
  const next = { ...query, yr: [...query.yr], [key]: value };
  if (
    key === 'gov' &&
    value !== query.gov &&
    next.city &&
    (!next.gov ||
      !cities.some((city) => city.governorate_id === next.gov && city.name_ar === next.city))
  )
    next.city = '';
  if (key === 'cat' && value !== query.cat) next.catv = '';
  return next;
}

export function removeFilter(query: QueryState, key: QueryKey): QueryState {
  const next = { ...query, [key]: key === 'yr' ? [] : '' };
  if (key === 'gov') next.city = '';
  if (key === 'cat' || key === 'catv') {
    next.cat = '';
    next.catv = '';
  }
  return next;
}

export function getActiveFilters(query: QueryState): { key: QueryKey; value: string }[] {
  return [
    ...scalarFilterKeys
      .filter((key) => key !== 'cat' && !!query[key])
      .map((key) => ({ key, value: query[key] })),
    ...(query.yr.length ? [{ key: 'yr' as const, value: query.yr.join(', ') }] : []),
  ];
}
