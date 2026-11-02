import { describe, it, expect } from 'vitest';
import { createDemoRecords, demoGeometry, demoReferences, demoRawRecords } from '../src/data/demo';
import {
  aggregateGeography,
  automaticThresholds,
  collaborationLinks,
  countClass,
  layoutClusters,
  levelForZoom,
  sampleDots,
  validThresholds,
} from '../src/domain/geography/aggregation';
import {
  nationalViewport,
  panViewport,
  zoomRatio,
  zoomViewport,
} from '../src/domain/geography/viewport';
import { emptyQuery } from '../src/domain/research/query';
import { filterRecords } from '../src/domain/research/filter';
const records = createDemoRecords();
const geometry = demoGeometry;
const refs = demoReferences;
describe('geographic aggregation and integrity', () => {
  it('reconciles every national bubble with published source records', () => {
    const visible = filterRecords(records, emptyQuery(), { role: 'viewer' });
    const result = aggregateGeography(visible, 1, refs, geometry);
    expect(result.total).toBe(140);
    expect(result.plotted).toBe(140);
    expect(result.unlocated).toEqual([]);
    for (const g of refs.governorates)
      expect(result.governorateCounts[g.id] || 0).toBe(
        demoRawRecords.filter((r) => r.status === 'published' && r.gov === g.id).length,
      );
    expect(result.nodes.reduce((sum, n) => sum + n.records.length, 0)).toBe(result.total);
  });
  it('partitions each city once and retains the exact supplied city names', () => {
    const result = aggregateGeography(records, 2, refs, geometry);
    const ids = result.nodes.flatMap((n) => n.records.map((r) => r.id));
    expect(new Set(ids).size + result.unlocated.length).toBe(records.length);
    expect(
      result.nodes.every((n) =>
        refs.cities.some((c) => c.governorate_id === n.governorateId && c.name_ar === n.city),
      ),
    ).toBe(true);
    expect(aggregateGeography(records, 3, refs, geometry)).toEqual(result);
  });
  it('does not fabricate coordinates for unknown governorates or cities', () => {
    const unknownGov = {
      ...records[0],
      id: 'unknown-gov',
      location: { governorateId: 'UNKNOWN', city: 'Unknown' },
    };
    const unknownCity = {
      ...records[0],
      id: 'unknown-city',
      location: { governorateId: 'DAM', city: 'Unregistered city' },
    };
    const national = aggregateGeography([unknownGov, unknownCity], 1, refs, geometry);
    expect(national.plotted).toBe(1);
    expect(national.unlocated.map((r) => r.id)).toEqual(['unknown-gov']);
    expect(national.missingCityCounts.DAM).toBe(1);
    const city = aggregateGeography([unknownGov, unknownCity], 2, refs, geometry);
    expect(city.nodes).toEqual([]);
    expect(city.unlocated).toHaveLength(2);
    expect(city.governorateCounts.DAM).toBe(1);
  });
  it('does not confuse valid empty results with an unavailable repository', () => {
    expect(aggregateGeography([], 1, refs, geometry)).toMatchObject({
      total: 0,
      plotted: 0,
      nodes: [],
      unlocated: [],
      governorateCounts: {},
    });
  });
  it('uses one language-independent query for map, list and summary inputs', () => {
    const q = { ...emptyQuery(), q: 'Damascus', yr: ['2023', '2024'] };
    const ar = filterRecords(records, q, {
      role: 'viewer',
      language: 'ar',
      governorates: refs.governorates,
    });
    const en = filterRecords(records, q, {
      role: 'viewer',
      language: 'en',
      governorates: refs.governorates,
    });
    expect(ar.length).toBeGreaterThan(0);
    expect(ar).toEqual(en);
    expect(aggregateGeography(ar, 1, refs, geometry).total).toBe(en.length);
  });
  it('separates coincident bubbles deterministically without mutating anchors', () => {
    const seed = aggregateGeography(records, 1, refs, geometry).nodes[0];
    const nodes = [
      { ...seed, key: 'one', anchorX: 0, anchorY: 0 },
      { ...seed, key: 'two', anchorX: 0, anchorY: 0 },
    ];
    const placed = layoutClusters(nodes, 1, 1);
    expect(Math.hypot(placed[0].x - placed[1].x, placed[0].y - placed[1].y)).toBeGreaterThan(
      placed[0].radius + placed[1].radius,
    );
    expect(layoutClusters(nodes, 1, 1)).toEqual(placed);
    expect(nodes[0].anchorX).toBe(0);
    expect('x' in nodes[0]).toBe(false);
  });
  it('caps illustrative record dots at twelve while retaining the full group', () => {
    const node = layoutClusters(aggregateGeography(records, 2, refs, geometry).nodes, 1, 3).find(
      (n) => n.records.length > 12,
    )!;
    expect(node).toBeDefined();
    expect(sampleDots(node, 1)).toHaveLength(12);
    expect(node.records.length).toBeGreaterThan(12);
    expect(sampleDots(node, 1).every((dot) => node.records.includes(dot.record))).toBe(true);
  });
  it('validates color classes and preserves source automatic thresholds', () => {
    expect(automaticThresholds(55)).toEqual([11, 25, 41]);
    expect(automaticThresholds(0)).toEqual([2, 3, 4]);
    expect(validThresholds([1, 2, 3])).toBe(true);
    for (const bad of [
      [0, 2, 3],
      [3, 2, 1],
      [1, 1, 2],
      [1.5, 2, 3],
      [1, Infinity, 3],
      [1, 2],
    ])
      expect(validThresholds(bad)).toBe(false);
    expect([1, 10, 20, 30].map((n) => countClass(n, [10, 20, 30]))).toEqual([1, 2, 3, 4]);
  });
  it('limits inferred name links to known, distinct reference locations', () => {
    const links = collaborationLinks(records, refs, geometry);
    expect(links.length).toBeGreaterThan(0);
    expect(links.length).toBeLessThanOrEqual(15);
    expect(links.every((l) => Math.hypot(l.from[0] - l.to[0], l.from[1] - l.to[1]) > 8)).toBe(true);
    expect(links.map((l) => l.weight)).toEqual(links.map((l) => l.weight).sort((a, b) => b - a));
    expect(collaborationLinks([], refs, geometry)).toEqual([]);
  });
  it('infers a link from shared normalized text without claiming identity', () => {
    const [a, b] = [
      refs.universities[0],
      refs.universities.find((u) => u.city !== refs.universities[0].city)!,
    ];
    const make = (id: string, university: string, main: string) => ({
      ...records[0],
      id,
      affiliation: { ...records[0].affiliation, university },
      contributors: { main, co: [] },
    });
    const links = collaborationLinks(
      [make('a', a.name_ar, 'د. أحمد'), make('b', b.name_ar, 'احمد')],
      refs,
      geometry,
    );
    expect(links).toHaveLength(1);
    expect(links[0].weight).toBe(1);
    expect(
      collaborationLinks(
        [make('a', 'Unregistered university', 'أحمد'), make('b', b.name_ar, 'احمد')],
        refs,
        geometry,
      ),
    ).toEqual([]);
  });
});
describe('viewport mathematics', () => {
  it('uses the supplied national extent and three source zoom levels', () => {
    expect(nationalViewport(geometry)).toEqual({ x: -20, y: -20, width: 1040, height: 958 });
    expect([1, 1.99, 2, 4.49, 4.5, 26].map(levelForZoom)).toEqual([1, 1, 2, 2, 3, 3]);
    expect(zoomRatio(nationalViewport(geometry), geometry)).toBe(1);
  });
  it('clamps zoom while preserving aspect and the pointer anchor ratio', () => {
    const initial = nationalViewport(geometry);
    const anchor = { x: 200, y: 300 };
    const zoomed = zoomViewport(initial, 1.25, geometry, anchor);
    expect(zoomed.width).toBe(832);
    expect(zoomed.height / zoomed.width).toBeCloseTo(initial.height / initial.width);
    expect((anchor.x - zoomed.x) / zoomed.width).toBeCloseTo(
      (anchor.x - initial.x) / initial.width,
    );
    expect(zoomViewport(initial, 1000, geometry).width).toBe(40);
    expect(zoomViewport(initial, 0.001, geometry).width).toBe(1040);
  });
  it('pans physically without changing scale, selection or source geometry', () => {
    const initial = nationalViewport(geometry);
    expect(panViewport(initial, 15, -30)).toEqual({ ...initial, x: -5, y: -50 });
    expect(initial.x).toBe(-20);
  });
});
