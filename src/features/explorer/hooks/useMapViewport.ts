import { useEffect, useRef, useState, type RefObject } from 'react';
import type { MapViewport } from '../../../domain/geography/models';
import { viewportString } from '../../../domain/geography/viewport';
export function useElementSize(ref: RefObject<HTMLElement | null>) {
  const [size, setSize] = useState({ width: 800, height: 650 });
  useEffect(() => {
    const e = ref.current;
    if (!e) return;
    const observer = new ResizeObserver((entries) => {
      const r = entries[0]?.contentRect;
      if (r && r.width && r.height) setSize({ width: r.width, height: r.height });
    });
    observer.observe(e);
    return () => observer.disconnect();
  }, [ref]);
  return size;
}
export function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () => matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  useEffect(() => {
    const m = matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setReduced(m.matches);
    m.addEventListener('change', change);
    return () => m.removeEventListener('change', change);
  }, []);
  return reduced;
}
/** Animate only the viewBox attribute, not the data/React tree, on each frame. */
export function useMapViewport(
  svg: RefObject<SVGSVGElement | null>,
  target: MapViewport,
  animate: boolean,
) {
  const reduced = useReducedMotion();
  const current = useRef(target);
  useEffect(() => {
    const element = svg.current;
    if (!element) return;
    const from = current.current;
    let frame = 0;
    const duration =
      reduced || !animate
        ? 0
        : parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--motion-map')) ||
          380;
    const start = performance.now();
    element.dataset.moving = duration ? 'true' : 'false';
    const update = (now: number) => {
      const p = duration ? Math.min(1, (now - start) / duration) : 1;
      const ease = 1 - Math.pow(1 - p, 3);
      const next = {
        x: from.x + (target.x - from.x) * ease,
        y: from.y + (target.y - from.y) * ease,
        width: from.width + (target.width - from.width) * ease,
        height: from.height + (target.height - from.height) * ease,
      };
      current.current = next;
      element.setAttribute('viewBox', viewportString(next));
      if (p < 1) frame = requestAnimationFrame(update);
      else element.dataset.moving = 'false';
    };
    if (duration) frame = requestAnimationFrame(update);
    else update(start);
    return () => {
      cancelAnimationFrame(frame);
      element.dataset.moving = 'false';
    };
  }, [svg, target, animate, reduced]);
  return current;
}
export function clientToMap(svg: SVGSVGElement, clientX: number, clientY: number) {
  const matrix = svg.getScreenCTM();
  if (!matrix) return null;
  const point = new DOMPoint(clientX, clientY).matrixTransform(matrix.inverse());
  return { x: point.x, y: point.y };
}
