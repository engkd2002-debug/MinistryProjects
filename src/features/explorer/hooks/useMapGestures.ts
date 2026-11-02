import { useEffect, useRef, type RefObject } from 'react';
import type { MapViewport, VectorGeometry } from '../../../domain/geography/models';
import { panViewport, zoomViewport } from '../../../domain/geography/viewport';
import { clientToMap } from './useMapViewport';
export function useMapGestures(
  svg: RefObject<SVGSVGElement | null>,
  current: RefObject<MapViewport>,
  geometry: VectorGeometry,
  move: (v: MapViewport, animate?: boolean) => void,
) {
  const moved = useRef(false);
  const drag = useRef<{
    pointer: number;
    x: number;
    y: number;
    viewport: MapViewport;
    scale: number;
  } | null>(null);
  const handler = useRef({ move });
  handler.current = { move };
  useEffect(() => {
    const element = svg.current;
    if (!element) return;
    const down = (event: PointerEvent) => {
      if (event.button !== 0 || drag.current) return;
      moved.current = false;
      drag.current = {
        pointer: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        viewport: { ...current.current },
        scale: element.getScreenCTM()?.a || 1,
      };
    };
    const motion = (event: PointerEvent) => {
      const start = drag.current;
      if (!start || start.pointer !== event.pointerId) return;
      const dx = event.clientX - start.x,
        dy = event.clientY - start.y;
      if (Math.hypot(dx, dy) > 4) {
        moved.current = true;
        element.classList.add('is-panning');
        if (!element.hasPointerCapture(event.pointerId)) element.setPointerCapture(event.pointerId);
      }
      if (moved.current)
        handler.current.move(
          panViewport(start.viewport, -dx / start.scale, -dy / start.scale),
          false,
        );
    };
    const end = (event: PointerEvent) => {
      if (drag.current?.pointer !== event.pointerId) return;
      drag.current = null;
      element.classList.remove('is-panning');
      if (element.hasPointerCapture(event.pointerId))
        element.releasePointerCapture(event.pointerId);
    };
    const wheel = (event: WheelEvent) => {
      event.preventDefault();
      const point = clientToMap(element, event.clientX, event.clientY);
      handler.current.move(
        zoomViewport(current.current, event.deltaY < 0 ? 1.25 : 0.8, geometry, point || undefined),
      );
    };
    element.addEventListener('pointerdown', down);
    element.addEventListener('pointermove', motion);
    element.addEventListener('pointerup', end);
    element.addEventListener('pointercancel', end);
    element.addEventListener('wheel', wheel, { passive: false });
    return () => {
      element.removeEventListener('pointerdown', down);
      element.removeEventListener('pointermove', motion);
      element.removeEventListener('pointerup', end);
      element.removeEventListener('pointercancel', end);
      element.removeEventListener('wheel', wheel);
    };
  }, [svg, current, geometry]);
  return moved;
}
