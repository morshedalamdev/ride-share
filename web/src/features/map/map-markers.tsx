import { Building2, Flag, Landmark, MapPin, Trees } from "lucide-react";
import type { Place } from "@/features/rides/types";
import type { Point } from "./map-camera";

interface StopMarkerProps {
  place: Place;
  position: Point;
  width: number;
  isPickup?: boolean;
}

export function StopMarker({
  place,
  position,
  width,
  isPickup = false,
}: StopMarkerProps) {
  const align =
    position.x < 105 ? "left" : position.x > width - 105 ? "right" : "center";

  return (
    <div
      className="map-stop"
      data-pickup={isPickup}
      data-align={align}
      data-below={position.y < 48 || !isPickup}
      style={{ left: position.x, top: position.y }}
    >
      <span className="map-stop-label">{place.name}</span>
      <span className="map-stop-point" aria-hidden="true" />
      <span className="sr-only">{isPickup ? "Pickup" : "Drop-off"}</span>
    </div>
  );
}

const landmarkIcons = {
  union: Landmark,
  sfmoma: Building2,
  "city-hall": Landmark,
  alamo: Trees,
  dolores: Trees,
  oracle: Flag,
};

export function LandmarkMarker({
  place,
  position,
  onSelect,
}: {
  place: Place;
  position: Point;
  onSelect: (place: Place) => void;
}) {
  const Icon = landmarkIcons[place.id as keyof typeof landmarkIcons] ?? MapPin;

  return (
    <button
      type="button"
      className="map-landmark"
      style={{ left: position.x, top: position.y }}
      title={`Set destination to ${place.name}`}
      aria-label={`Set destination to ${place.name}`}
      onClick={() => onSelect(place)}
    >
      <Icon size={12} aria-hidden="true" />
    </button>
  );
}

const nearbyCars = [
  { x: 301, y: 393, angle: -73 },
  { x: 573, y: 118, angle: -77 },
  { x: 556, y: 377, angle: 66 },
  { x: 729, y: 305, angle: 68 },
  { x: 178, y: 204, angle: 11 },
];

export function NearbyCars() {
  return (
    <g aria-hidden="true">
      <defs>
        <g id="rove-map-car">
          <rect
            x="-6.5"
            y="-12.5"
            width="14"
            height="27"
            rx="5"
            fill="#1e2928"
            opacity=".16"
          />
          <rect
            x="-6"
            y="-13"
            width="12"
            height="26"
            rx="4.5"
            fill="#495355"
            stroke="#fff"
            strokeWidth="1.8"
          />
          <path
            d="M-3.8-6.4 Q0-8 3.8-6.4 L2.9-2.8 Q0-3.7-2.9-2.8Z"
            fill="#c4d1ce"
          />
          <rect
            x="-3"
            y="-1.5"
            width="6"
            height="6.3"
            rx="1.2"
            fill="#6e7877"
          />
          <path
            d="M-2.9 6 Q0 7 2.9 6 L3.6 8.2 Q0 9.4-3.6 8.2Z"
            fill="#bac5c2"
          />
        </g>
      </defs>
      {nearbyCars.map((vehicle) => (
        <use
          key={vehicle.x}
          href="#rove-map-car"
          transform={`translate(${vehicle.x} ${vehicle.y}) rotate(${vehicle.angle})`}
        />
      ))}
    </g>
  );
}
