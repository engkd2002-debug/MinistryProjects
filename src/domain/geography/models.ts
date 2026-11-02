export interface Governorate {
  id: string;
  name_ar: string;
  name_en: string;
  lon: number;
  lat: number;
}
export interface City extends Governorate {
  governorate_id: string;
}
export interface UniversityReference {
  id: string;
  name_ar: string;
  city: string;
}
export interface VectorGeometry {
  W: number;
  H: number;
  p: { lon0: number; lat1: number; k: number; c: number };
  f: { id: string; d: string }[];
}
export interface MapViewport {
  x: number;
  y: number;
  width: number;
  height: number;
}
export interface MapAggregate {
  key: string;
  governorateId: string;
  city?: string;
  count: number;
  recordIds: string[];
}
// Phase 3 renderer contracts avoid coupling record
// selection to SVG internals or treating supplied coordinates as verified sites.
export interface MapRendererIntent {
  type: 'select-governorate' | 'inspect-cluster' | 'open-record';
  id: string;
}
export function projectCoordinate(
  geometry: VectorGeometry,
  lon: number,
  lat: number,
): [number, number] {
  return [
    (lon - geometry.p.lon0) * geometry.p.c * geometry.p.k,
    (geometry.p.lat1 - lat) * geometry.p.k,
  ];
}
