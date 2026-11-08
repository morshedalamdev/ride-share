import { places } from "./data";
import type { Place, Vehicle } from "./types";

function mapDistance(from: Place, to: Place) {
  return Math.hypot(from.x - to.x, from.y - to.y);
}

/** UI-only estimates, scaled to the example Ferry Building–Dolores Park trip. */
export function estimateRoute(from: Place, to: Place) {
  const scale = mapDistance(from, to) / mapDistance(places[0], places[1]);
  const miles = Math.max(0.4, Math.round(46 * scale) / 10);
  const minutes = Math.max(4, Math.round(18 * scale));
  return { miles, minutes };
}

export function estimateFare(vehicle: Vehicle, miles: number) {
  return Math.round((4 + (vehicle.baseFare - 4) * (miles / 4.6)) * 100) / 100;
}
