import type { Place } from "@/features/rides/types";

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export const mapBounds = { left: -380, top: -380, width: 1770, height: 1440 };
export const zoomLevels = [1, 1.35, 1.8, 2.4, 3.2];

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

/** Fit both stops with space for their labels, then apply the user's zoom and pan. */
export function getCamera(
  size: Size,
  pickup: Place,
  dropoff: Place,
  zoom: number,
  pan: Point,
) {
  const horizontalFit =
    (Math.abs(pickup.x - dropoff.x) + 50) / Math.max(100, size.width - 48);
  const verticalFit =
    (Math.abs(pickup.y - dropoff.y) + 30) / Math.max(100, size.height - 64);
  const unitsPerPixel = Math.max(0.85, horizontalFit, verticalFit) / zoom;
  const width = Math.min(size.width * unitsPerPixel, mapBounds.width);
  const height = Math.min(size.height * unitsPerPixel, mapBounds.height);
  const left = (pickup.x + dropoff.x - width) / 2 + pan.x;
  const top = (pickup.y + dropoff.y - height) / 2 + pan.y;

  return {
    x: clamp(left, mapBounds.left, mapBounds.left + mapBounds.width - width),
    y: clamp(top, mapBounds.top, mapBounds.top + mapBounds.height - height),
    width,
    height,
  };
}

export type Camera = ReturnType<typeof getCamera>;

export function screenPosition(
  point: Point,
  camera: Camera,
  size: Size,
): Point {
  return {
    x: ((point.x - camera.x) / camera.width) * size.width,
    y: ((point.y - camera.y) / camera.height) * size.height,
  };
}
