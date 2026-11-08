import { LocateFixed, Minus, Plus } from "lucide-react";
import { zoomLevels } from "./map-camera";

interface MapControlsProps {
  zoomIndex: number;
  onZoomChange: (zoomIndex: number) => void;
  onRecenter: () => void;
}

export function MapControls({
  zoomIndex,
  onZoomChange,
  onRecenter,
}: MapControlsProps) {
  return (
    <div className="map-controls" role="group" aria-label="Map controls">
      <div className="map-zoom">
        <button
          type="button"
          className="map-control"
          aria-label="Zoom in"
          title="Zoom in"
          disabled={zoomIndex === zoomLevels.length - 1}
          onClick={() => onZoomChange(zoomIndex + 1)}
        >
          <Plus size={17} />
        </button>
        <button
          type="button"
          className="map-control"
          aria-label="Zoom out"
          title="Zoom out"
          disabled={zoomIndex === 0}
          onClick={() => onZoomChange(zoomIndex - 1)}
        >
          <Minus size={17} />
        </button>
      </div>
      <button
        type="button"
        className="map-control map-recenter"
        aria-label="Recenter route"
        title="Recenter route"
        onClick={onRecenter}
      >
        <LocateFixed size={16} />
      </button>
    </div>
  );
}
