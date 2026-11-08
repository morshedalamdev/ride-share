"use client";

import { Route } from "lucide-react";

import { places } from "@/features/rides/data";
import type { Place } from "@/features/rides/types";
import { mapBounds, screenPosition } from "./map-camera";
import { LandmarkMarker, NearbyCars, StopMarker } from "./map-markers";
import { MapControls } from "./map-controls";
import { useMapViewport } from "./use-map-viewport";
import previewRoutes from "./preview-routes.json";
import "./ride-map.css";

interface RideMapProps {
  pickup: Place;
  dropoff: Place;
  onSelectPlace?: (place: Place) => void;
}

const routes: Record<string, string> = previewRoutes;

export function RideMap(props: RideMapProps) {
  // Each new itinerary starts with both endpoints in view.
  return (
    <MapCanvas key={`${props.pickup.id}-${props.dropoff.id}`} {...props} />
  );
}

function MapCanvas({ pickup, dropoff, onSelectPlace }: RideMapProps) {
  const viewport = useMapViewport(pickup, dropoff);
  const { container, size, camera, zoomIndex } = viewport;
  const routeKey = [pickup.id, dropoff.id].sort().join("_");
  const path =
    routes[routeKey] ?? `M${pickup.x},${pickup.y} L${dropoff.x},${dropoff.y}`;
  const viewBox = `${camera.x} ${camera.y} ${camera.width} ${camera.height}`;

  const scaleMeters = zoomIndex < 2 ? 500 : 200;
  const scaleWidth = (scaleMeters / 6.984) * (size.width / camera.width);

  return (
    <div
      className="ride-map"
      ref={container}
      role="region"
      aria-label="San Francisco route preview"
    >
      <svg
        viewBox={viewBox}
        preserveAspectRatio="none"
        className="map-drawing"
        style={{ touchAction: zoomIndex === 0 ? "pan-y" : "none" }}
        tabIndex={0}
        onKeyDown={viewport.panWithKeyboard}
        role="img"
        aria-label={`Street map from ${pickup.name} to ${dropoff.name}. Use arrow keys to pan.`}
        onPointerDown={viewport.startDrag}
        onPointerMove={viewport.drag}
        onLostPointerCapture={viewport.endDrag}
      >
        <image
          href="/maps/san-francisco.svg"
          x={mapBounds.left}
          y={mapBounds.top}
          width={mapBounds.width}
          height={mapBounds.height}
        />
        <g fill="none" strokeLinejoin="round" strokeLinecap="round">
          <path
            d={path}
            stroke="#ac795c"
            strokeOpacity=".25"
            strokeWidth="8"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={path}
            stroke="#fffdf5"
            strokeWidth="6.8"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={path}
            stroke="#ed613d"
            strokeWidth="4.5"
            vectorEffect="non-scaling-stroke"
          />
        </g>
        <NearbyCars />
      </svg>

      {onSelectPlace &&
        places
          .filter((place) => place.id !== pickup.id && place.id !== dropoff.id)
          .map((place) => {
            const position = screenPosition(place, camera, size);
            if (
              position.x < 16 ||
              position.y < 16 ||
              position.x > size.width - 16 ||
              position.y > size.height - 16
            )
              return null;
            return (
              <LandmarkMarker
                key={place.id}
                place={place}
                position={position}
                onSelect={onSelectPlace}
              />
            );
          })}

      <StopMarker
        place={pickup}
        position={screenPosition(pickup, camera, size)}
        width={size.width}
        isPickup
      />
      <StopMarker
        place={dropoff}
        position={screenPosition(dropoff, camera, size)}
        width={size.width}
      />

      <div className="map-preview-tag">
        <Route size={14} aria-hidden="true" /> Route preview
      </div>
      <MapControls
        zoomIndex={zoomIndex}
        onZoomChange={viewport.setZoomIndex}
        onRecenter={viewport.recenter}
      />
      <div className="map-caption">
        <span className="map-scale" style={{ width: scaleWidth }}>
          {scaleMeters} m
        </span>
        <span>DataSF</span>
      </div>
    </div>
  );
}
