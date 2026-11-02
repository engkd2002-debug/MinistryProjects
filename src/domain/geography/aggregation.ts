import type { City, Governorate, VectorGeometry } from './models';
import { projectCoordinate } from './models';
import { normalizeArabic } from '../research/filter';
import type { ResearchRecord } from '../research/models';

export type GeographicLevel = 1 | 2 | 3;
export interface GeographicSelection {
  governorateId: string;
  city?: string;
}
export interface GeographicNode extends GeographicSelection {
  key: string;
  anchorX: number;
  anchorY: number;
  records: ResearchRecord[];
}
export interface ClusterNode extends GeographicNode {
  x: number;
  y: number;
  radius: number;
}
export interface GeographyReferences {
  governorates: readonly Governorate[];
  cities: readonly City[];
  universities: readonly { name_ar: string; city: string }[];
}
export interface GeographicSnapshot {
  nodes: GeographicNode[];
  unlocated: ResearchRecord[];
  governorateCounts: Record<string, number>;
  missingCityCounts: Record<string, number>;
  total: number;
  plotted: number;
}
export const levelForZoom = (zoom: number): GeographicLevel => (zoom < 2 ? 1 : zoom < 4.5 ? 2 : 3);
export function aggregateGeography(
  records: readonly ResearchRecord[],
  level: GeographicLevel,
  refs: GeographyReferences,
  geometry: VectorGeometry,
): GeographicSnapshot {
  const groups = new Map<string, GeographicNode>();
  const unlocated: ResearchRecord[] = [];
  const governorateCounts: Record<string, number> = {};
  const missingCityCounts: Record<string, number> = {};
  for (const record of records) {
    const gov = refs.governorates.find((g) => g.id === record.location.governorateId);
    if (!gov || !Number.isFinite(gov.lon) || !Number.isFinite(gov.lat)) {
      unlocated.push(record);
      continue;
    }
    governorateCounts[gov.id] = (governorateCounts[gov.id] || 0) + 1;
    const city = refs.cities.find(
      (c) =>
        c.governorate_id === gov.id &&
        c.name_ar === record.location.city &&
        Number.isFinite(c.lon) &&
        Number.isFinite(c.lat),
    );
    if (!city) missingCityCounts[gov.id] = (missingCityCounts[gov.id] || 0) + 1;
    if (level > 1 && !city) {
      unlocated.push(record);
      continue;
    }
    const key = level === 1 ? gov.id : `${gov.id}|${city!.id}`;
    if (!groups.has(key)) {
      const point = level === 1 ? gov : city!;
      const [anchorX, anchorY] = projectCoordinate(geometry, point.lon, point.lat);
      groups.set(key, {
        key,
        governorateId: gov.id,
        ...(level > 1 ? { city: city!.name_ar } : {}),
        anchorX,
        anchorY,
        records: [],
      });
    }
    groups.get(key)!.records.push(record);
  }
  return {
    nodes: [...groups.values()],
    unlocated,
    governorateCounts,
    missingCityCounts,
    total: records.length,
    plotted: records.length - unlocated.length,
  };
}
/** Screen-relative source radius and 120-pass collision layout, independent of SVG rendering. */
export function layoutClusters(
  nodes: readonly GeographicNode[],
  worldPerPixel: number,
  level: GeographicLevel,
): ClusterNode[] {
  const max = Math.max(1, ...nodes.map((n) => n.records.length));
  const out = nodes.map((n) => ({
    ...n,
    x: n.anchorX,
    y: n.anchorY,
    radius:
      ((level === 3 ? 9 : 11) + (level === 3 ? 14 : 24) * Math.sqrt(n.records.length / max)) *
      worldPerPixel,
  }));
  const pad = 15 * worldPerPixel;
  for (let pass = 0; pass < 120; pass++) {
    for (let i = 0; i < out.length; i++)
      for (let j = i + 1; j < out.length; j++) {
        const a = out[i],
          b = out[j];
        let dx = b.x - a.x,
          dy = b.y - a.y;
        let distance = Math.hypot(dx, dy);
        // Deterministic separation for coincident anchors; original zero-vector relaxation could not separate them.
        if (distance < 0.01) {
          dx = Math.cos((i + j + 1) * 2.399) * 0.01;
          dy = Math.sin((i + j + 1) * 2.399) * 0.01;
          distance = 0.01;
        }
        const needed = a.radius + b.radius + pad;
        if (distance < needed) {
          const push = (needed - distance) / 2 / distance;
          a.x -= dx * push;
          a.y -= dy * push;
          b.x += dx * push;
          b.y += dy * push;
        }
      }
    out.forEach((n) => {
      n.x += (n.anchorX - n.x) * 0.015;
      n.y += (n.anchorY - n.y) * 0.015;
    });
  }
  return out;
}
export type CountThresholds = [number, number, number];
export const automaticThresholds = (max: number): CountThresholds => [
  Math.max(2, Math.round(max * 0.2)),
  Math.max(3, Math.round(max * 0.45)),
  Math.max(4, Math.round(max * 0.75)),
];
export const validThresholds = (values: number[]) =>
  values.length === 3 &&
  values.every((v) => Number.isSafeInteger(v) && v > 0) &&
  values[0] < values[1] &&
  values[1] < values[2];
export const countClass = (count: number, t: CountThresholds) =>
  count >= t[2] ? 4 : count >= t[1] ? 3 : count >= t[0] ? 2 : 1;
export function sampleDots(node: ClusterNode, worldPerPixel: number) {
  return node.records.slice(0, 12).map((record, index, array) => {
    const angle = (index / array.length) * Math.PI * 2;
    return {
      record,
      x: node.x + Math.cos(angle) * (node.radius + 26 * worldPerPixel),
      y: node.y + Math.sin(angle) * (node.radius + 26 * worldPerPixel),
    };
  });
}
export interface CollaborationLink {
  a: string;
  b: string;
  weight: number;
  from: [number, number];
  to: [number, number];
}
export function collaborationLinks(
  records: readonly ResearchRecord[],
  refs: GeographyReferences,
  geometry: VectorGeometry,
): CollaborationLink[] {
  const names = new Map<string, Set<string>>();
  records.forEach((p) =>
    [p.contributors.main, ...p.contributors.co].forEach((raw) => {
      const name = normalizeArabic(raw.replace(/^(أ\.د\.|د\.|م\.|أ\.)\s*/, '')).trim();
      if (name) {
        if (!names.has(name)) names.set(name, new Set());
        if (p.affiliation.university) names.get(name)!.add(p.affiliation.university);
      }
    }),
  );
  const pairs = new Map<string, { a: string; b: string; weight: number }>();
  names.forEach((universities) => {
    const list = [...universities].sort();
    for (let i = 0; i < list.length; i++)
      for (let j = i + 1; j < list.length; j++) {
        const key = `${list[i]}|${list[j]}`;
        const prior = pairs.get(key);
        pairs.set(key, { a: list[i], b: list[j], weight: (prior?.weight || 0) + 1 });
      }
  });
  const point = (name: string): [number, number] | null => {
    const university = refs.universities.find((u) => u.name_ar === name);
    const city = university && refs.cities.find((c) => c.name_ar === university.city);
    return city ? projectCoordinate(geometry, city.lon, city.lat) : null;
  };
  return [...pairs.values()]
    .sort((a, b) => b.weight - a.weight)
    .flatMap((pair) => {
      const from = point(pair.a),
        to = point(pair.b);
      return from && to && Math.hypot(from[0] - to[0], from[1] - to[1]) > 8
        ? [{ ...pair, from, to }]
        : [];
    })
    .slice(0, 15);
}
export function topValues(records: readonly ResearchRecord[], key: (r: ResearchRecord) => string) {
  const counts = new Map<string, number>();
  records.forEach((r) => {
    const v = key(r);
    if (v) counts.set(v, (counts.get(v) || 0) + 1);
  });
  return [...counts].sort((a, b) => b[1] - a[1]).slice(0, 3);
}
