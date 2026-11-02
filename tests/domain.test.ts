import { describe, expect, it } from 'vitest';
import { createDemoRecords, demoReferences } from '../src/data/demo';
import {
  emptyQuery,
  getActiveFilters,
  parseQuery,
  removeFilter,
  serializeQuery,
  updateFilter,
} from '../src/domain/research/query';
import { filterRecords, normalizeArabic } from '../src/domain/research/filter';
import { findVisibleRecord, pruneSelection } from '../src/domain/governance/visibility';
import { summarizeRecords } from '../src/domain/analysis/summary';
import { projectCoordinate } from '../src/domain/geography/models';
import { demoGeometry } from '../src/data/demo';

const records = createDemoRecords();
const context = { role: 'admin' as const, governorates: demoReferences.governorates };
describe('deterministic source and visibility contracts', () => {
  it('retains the exact 150-record source fixture and reference sizes', () => {
    expect(records).toHaveLength(150);
    expect(records.filter((record) => record.status === 'published')).toHaveLength(140);
    expect(demoReferences.governorates).toHaveLength(14);
    expect(demoReferences.cities).toHaveLength(22);
    expect(demoReferences.universities).toHaveLength(15);
    expect(new Set(records.map((record) => record.id)).size).toBe(150);
    expect(createDemoRecords()).toEqual(records);
  });
  it('restricts viewer reads and prunes inaccessible comparison IDs before rendering', () => {
    const unpublished = records.find((record) => record.status !== 'published')!;
    expect(filterRecords(records, emptyQuery(), { role: 'viewer' })).toHaveLength(140);
    expect(findVisibleRecord(records, unpublished.id, 'viewer')).toBeUndefined();
    expect(pruneSelection([records[0].id, unpublished.id], records, 'viewer')).toEqual([
      records[0].id,
    ]);
  });
  it('does not count absent institutions as a university', () => {
    expect(
      summarizeRecords([
        ...records,
        { ...records[0], affiliation: { ...records[0].affiliation, university: '' } },
      ]).universities,
    ).toBe(15);
    expect(summarizeRecords([]).latestYear).toBeNull();
  });
  it('keeps geographic projection independent of interface direction', () => {
    expect(projectCoordinate(demoGeometry, demoGeometry.p.lon0, demoGeometry.p.lat1)).toEqual([
      0, 0,
    ]);
  });
});

describe('canonical query codec', () => {
  it('round-trips Arabic, scalar facets and deduplicated multi-years', () => {
    const input = {
      ...emptyQuery(),
      q: 'مياه جوفية',
      gov: 'ALE',
      yr: ['2024', '2023', '2024'],
      cat: 'x1',
      catv: 'خاص',
    };
    expect(parseQuery(serializeQuery(input)).query).toEqual({ ...input, yr: ['2023', '2024'] });
  });
  it('reports unknown/invalid values without accepting role or oversized query state', () => {
    const { query, diagnostics } = parseQuery(
      new URLSearchParams({
        role: 'admin',
        gov: 'FAKE',
        yr: '2022,xx,2023',
        yf: 'bad',
        q: 'x'.repeat(1025),
      }),
      ['DAM', 'ALE'],
    );
    expect(query.gov).toBe('');
    expect(query.yr).toEqual(['2022', '2023']);
    expect(query.yf).toBe('');
    expect(query.q).toBe('');
    expect(diagnostics.map((item) => item.reason)).toEqual([
      'unknown',
      'invalid',
      'invalid',
      'invalid',
      'too-long',
    ]);
  });
  it('retains contradictory year constraints with a diagnostic rather than broadening results', () => {
    const { query, diagnostics } = parseQuery('yf=2026&yt=2020');
    expect(diagnostics).toContainEqual({ key: 'yf', reason: 'range' });
    expect(filterRecords(records, query, context)).toEqual([]);
  });
  it('clears incompatible city when governorate changes and category value with category', () => {
    const input = {
      ...emptyQuery(),
      gov: 'DAM',
      city: 'دمشق',
      cat: 'city',
      catv: 'دمشق',
      q: 'تحكم',
    };
    const next = updateFilter(input, 'gov', 'ALE', demoReferences.cities);
    expect(next.city).toBe('');
    expect(next.q).toBe('تحكم');
    expect(updateFilter(input, 'cat', 'uni').catv).toBe('');
    expect(removeFilter(input, 'gov')).toMatchObject({ gov: '', city: '', q: 'تحكم' });
    expect(getActiveFilters(input)).toContainEqual({ key: 'q', value: 'تحكم' });
  });
});

describe('shared pure predicates', () => {
  it('normalizes Arabic variants without modifying source records', () => {
    expect(normalizeArabic('إدارة أبحاث عَلْمِيَّة')).toBe('اداره ابحاث علميه');
    expect(records[0].title.ar).toContain('المكافحة');
  });
  it('requires all query terms and matches the positive audited solar fixture', () => {
    expect(filterRecords(records, { ...emptyQuery(), q: 'شمسي' }, context)).toHaveLength(12);
    expect(filterRecords(records, { ...emptyQuery(), q: 'شمسي IMPOSSIBLE' }, context)).toEqual([]);
  });
  it('intersects OR years with a range and scalar geography', () => {
    const query = { ...emptyQuery(), gov: 'DAM', yr: ['2022', '2023'], yf: '2023', yt: '2025' };
    const actual = filterRecords(records, query, context);
    expect(actual.length).toBeGreaterThan(0);
    expect(
      actual.every((record) => record.year === 2023 && record.location.governorateId === 'DAM'),
    ).toBe(true);
    expect(filterRecords(records, { ...emptyQuery(), gov: 'DAM' }, context)).toHaveLength(57);
  });
  it('provides the explicit F09 researcher/co-researcher repair as a predicate', () => {
    const chosen = records.find((record) => record.contributors.co.length)!;
    expect(
      filterRecords(records, { ...emptyQuery(), res: chosen.contributors.co[0] }, context).map(
        (record) => record.id,
      ),
    ).toContain(chosen.id);
    expect(
      filterRecords(records, { ...emptyQuery(), res: 'IMPOSSIBLE_RESEARCHER' }, context),
    ).toHaveLength(0);
  });
  it('supports exact custom category values and self-excluded facets', () => {
    const fixture = [{ ...records[0], customValues: { x1: 'ميداني' } }];
    expect(
      filterRecords(fixture, { ...emptyQuery(), cat: 'x1', catv: 'ميداني' }, context),
    ).toHaveLength(1);
    expect(
      filterRecords(fixture, { ...emptyQuery(), cat: 'x1', catv: 'سريري' }, context),
    ).toHaveLength(0);
    expect(
      filterRecords(records, { ...emptyQuery(), gov: 'DAM' }, { ...context, skip: 'gov' }),
    ).toHaveLength(150);
  });
});
