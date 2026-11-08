import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import type { Place } from "@/features/rides/types";
import { getCamera, zoomLevels, type Point } from "./map-camera";

const origin = { x: 0, y: 0 };

export function useMapViewport(pickup: Place, dropoff: Place) {
  const container = useRef<HTMLDivElement>(null);
  const dragStart = useRef<{ pointer: Point; pan: Point } | null>(null);
  const [size, setSize] = useState({ width: 800, height: 380 });
  const [zoomIndex, setZoomIndex] = useState(0);
  const [pan, setPan] = useState(origin);
  const camera = getCamera(size, pickup, dropoff, zoomLevels[zoomIndex], pan);
  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) setSize({ width, height });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  function recenter() {
    setPan(origin);
    setZoomIndex(0);
  }

  const currentPan = {
    x: camera.x - (pickup.x + dropoff.x - camera.width) / 2,
    y: camera.y - (pickup.y + dropoff.y - camera.height) / 2,
  };

  function startDrag(event: PointerEvent<SVGSVGElement>) {
    if (!event.isPrimary || event.button !== 0) return;
    if (event.pointerType === "touch" && zoomIndex === 0) return;
    dragStart.current = {
      pointer: { x: event.clientX, y: event.clientY },
      pan: currentPan,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function drag(event: PointerEvent<SVGSVGElement>) {
    const start = dragStart.current;
    if (!start) return;
    setPan({
      x:
        start.pan.x +
        ((start.pointer.x - event.clientX) * camera.width) / size.width,
      y:
        start.pan.y +
        ((start.pointer.y - event.clientY) * camera.height) / size.height,
    });
  }

  function panWithKeyboard(event: KeyboardEvent<SVGSVGElement>) {
    const steps: Record<string, Point> = {
      ArrowUp: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 },
    };
    const step = steps[event.key];
    if (!step) return;
    event.preventDefault();
    setPan({
      x: currentPan.x + (step.x * camera.width) / 8,
      y: currentPan.y + (step.y * camera.height) / 8,
    });
  }

  function endDrag() {
    dragStart.current = null;
  }

  return {
    container,
    size,
    camera,
    zoomIndex,
    setZoomIndex,
    recenter,
    startDrag,
    drag,
    endDrag,
    panWithKeyboard,
  };
}
