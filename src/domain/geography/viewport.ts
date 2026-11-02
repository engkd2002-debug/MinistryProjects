import type { MapViewport, VectorGeometry } from './models';
export const nationalViewport = (geometry: Pick<VectorGeometry, 'W' | 'H'>): MapViewport => ({
  x: -20,
  y: -20,
  width: geometry.W + 40,
  height: geometry.H + 40,
});
export const zoomRatio = (view: MapViewport, geometry: Pick<VectorGeometry, 'W'>) =>
  (geometry.W + 40) / view.width;
export function zoomViewport(
  view: MapViewport,
  factor: number,
  geometry: Pick<VectorGeometry, 'W'>,
  point?: { x: number; y: number },
): MapViewport {
  const width = Math.min(geometry.W + 40, Math.max(40, view.width / factor));
  const ratio = width / view.width;
  const center = point || { x: view.x + view.width / 2, y: view.y + view.height / 2 };
  return {
    x: center.x - (center.x - view.x) * ratio,
    y: center.y - (center.y - view.y) * ratio,
    width,
    height: view.height * ratio,
  };
}
export const panViewport = (view: MapViewport, dx: number, dy: number): MapViewport => ({
  ...view,
  x: view.x + dx,
  y: view.y + dy,
});
export const viewportString = (v: MapViewport) => `${v.x} ${v.y} ${v.width} ${v.height}`;
export const pointInViewport = (x: number, y: number, v: MapViewport) =>
  x >= v.x && x <= v.x + v.width && y >= v.y && y <= v.y + v.height;
