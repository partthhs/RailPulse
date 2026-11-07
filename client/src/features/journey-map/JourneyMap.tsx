import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { TrainStatus, JourneyRouteData, Station } from "@railpulse/types";
import {
  Compass,
  Crosshair,
  Maximize2,
  Minimize2,
  Plus,
  Minus,
} from "lucide-react";
import { cn } from "@/utils/cn";

export interface JourneyMapProps {
  status?: TrainStatus;
  routeData?: JourneyRouteData;
  className?: string;
  onStationSelect?: (station: Station) => void;
}

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_API_KEY || "mMyG3TwsUk1XwpK3TDEN";

// MapTiler official vector streets style
const MAPTILER_STYLE_URL = `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`;

// Graceful fallback raster tiles if vector style encounters network interruption
const FALLBACK_MAP_STYLE = {
  version: 8,
  sources: {
    "osm-tiles": {
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png",
        "https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png",
        "https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png",
      ],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    },
  },
  layers: [
    {
      id: "osm-tiles-layer",
      type: "raster",
      source: "osm-tiles",
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

export const JourneyMap: React.FC<JourneyMapProps> = ({
  status,
  routeData,
  className,
  onStationSelect,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const trainMarkerRef = useRef<maplibregl.Marker | null>(null);
  const stationMarkersRef = useRef<maplibregl.Marker[]>([]);

  const [isFollowMode, setIsFollowMode] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedStationPopup, setSelectedStationPopup] = useState<Station | null>(null);

  // Initialize MapLibre with MapTiler
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const initialLat = status?.latitude || 22.5;
    const initialLon = status?.longitude || 78.5;

    // Use MapTiler vector style
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: MAPTILER_STYLE_URL,
      center: [initialLon, initialLat],
      zoom: 6.2,
      attributionControl: false,
    });

    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");

    map.on("load", () => {
      setMapLoaded(true);
      map.on("dragstart", () => setIsFollowMode(false));
    });

    map.on("error", (e) => {
      // If MapTiler style fails to load, gracefully fall back to raster style
      if (!mapLoaded && e.error?.message?.includes("style")) {
        console.warn("MapTiler style error, falling back to raster:", e.error);
        map.setStyle(FALLBACK_MAP_STYLE as any);
      }
    });

    mapRef.current = map;

    return () => {
      stationMarkersRef.current.forEach((m) => m.remove());
      stationMarkersRef.current = [];
      if (trainMarkerRef.current) trainMarkerRef.current.remove();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Route Layers (Completed in Brand Blue, Remaining in Gray)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || !routeData) return;

    const completedSourceId = "route-completed-source";
    const remainingSourceId = "route-remaining-source";
    const completedLayerId = "route-completed-layer";
    const remainingLayerId = "route-remaining-layer";

    // 1. Remaining route geometry
    const remainingGeoJson: GeoJSON.Feature<GeoJSON.LineString> = {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: routeData.remainingCoordinates,
      },
      properties: { type: "remaining" },
    };

    if (map.getSource(remainingSourceId)) {
      (map.getSource(remainingSourceId) as maplibregl.GeoJSONSource).setData(remainingGeoJson);
    } else {
      map.addSource(remainingSourceId, {
        type: "geojson",
        data: remainingGeoJson,
      });

      map.addLayer({
        id: remainingLayerId,
        type: "line",
        source: remainingSourceId,
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#8A94A6",
          "line-width": 4.5,
          "line-dasharray": [2, 1.5],
          "line-opacity": 0.75,
        },
      });
    }

    // 2. Completed route geometry
    const completedGeoJson: GeoJSON.Feature<GeoJSON.LineString> = {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: routeData.completedCoordinates,
      },
      properties: { type: "completed" },
    };

    if (map.getSource(completedSourceId)) {
      (map.getSource(completedSourceId) as maplibregl.GeoJSONSource).setData(completedGeoJson);
    } else {
      map.addSource(completedSourceId, {
        type: "geojson",
        data: completedGeoJson,
      });

      // Outer glow/casing
      map.addLayer({
        id: `${completedLayerId}-casing`,
        type: "line",
        source: completedSourceId,
        paint: {
          "line-color": "#2864E8",
          "line-width": 8,
          "line-opacity": 0.25,
        },
      });

      // Solid brand route line
      map.addLayer({
        id: completedLayerId,
        type: "line",
        source: completedSourceId,
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#2864E8",
          "line-width": 5,
          "line-opacity": 1.0,
        },
      });
    }
  }, [mapLoaded, routeData]);

  // Update Station Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || !routeData) return;

    stationMarkersRef.current.forEach((m) => m.remove());
    stationMarkersRef.current = [];

    routeData.stations.forEach((station) => {
      const isCurrent = station.isCurrent;
      const isPassed = station.isPassed;

      const el = document.createElement("div");
      el.className = "group relative cursor-pointer";

      const dot = document.createElement("div");
      dot.className = cn(
        "w-3.5 h-3.5 rounded-full border-2 transition-transform duration-200 group-hover:scale-150 shadow-xs",
        isCurrent
          ? "bg-[#2864E8] border-white ring-4 ring-[#2864E8]/20 scale-125 z-20"
          : isPassed
          ? "bg-[#168653] border-white"
          : "bg-white border-[#8A94A6]"
      );
      el.appendChild(dot);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([station.longitude, station.latitude])
        .addTo(map);

      el.addEventListener("click", () => {
        setSelectedStationPopup(station);
        if (onStationSelect) onStationSelect(station);
      });

      stationMarkersRef.current.push(marker);
    });
  }, [mapLoaded, routeData, onStationSelect]);

  // Update Live Train Marker & Camera Follow
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || !status || !status.latitude || !status.longitude) return;

    const coords: [number, number] = [status.longitude, status.latitude];

    if (!trainMarkerRef.current) {
      const el = document.createElement("div");
      el.className = "relative flex items-center justify-center w-12 h-12 pointer-events-none";

      const beacon = document.createElement("div");
      beacon.className = "absolute w-10 h-10 rounded-full bg-[#2864E8] animate-beacon";
      el.appendChild(beacon);

      const iconBox = document.createElement("div");
      iconBox.className =
        "w-8 h-8 rounded-full bg-[#2864E8] border-2 border-white shadow-float flex items-center justify-center text-white z-10";
      iconBox.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="transform: rotate(${status.bearing || 0}deg);">
          <polygon points="12 2 19 21 12 17 5 21 12 2"></polygon>
        </svg>
      `;
      el.appendChild(iconBox);

      trainMarkerRef.current = new maplibregl.Marker({ element: el, anchor: "center" })
        .setLngLat(coords)
        .addTo(map);
    } else {
      trainMarkerRef.current.setLngLat(coords);
    }

    if (isFollowMode) {
      map.easeTo({
        center: coords,
        zoom: Math.max(map.getZoom(), 7.2),
        duration: 1200,
      });
    }
  }, [mapLoaded, status, isFollowMode]);

  const handleZoomIn = () => mapRef.current?.zoomIn();
  const handleZoomOut = () => mapRef.current?.zoomOut();
  const handleResetBearing = () => mapRef.current?.resetNorthPitch();
  const handleToggleFollow = () => {
    setIsFollowMode((prev) => {
      const next = !prev;
      if (next && status?.longitude && status?.latitude) {
        mapRef.current?.flyTo({ center: [status.longitude, status.latitude], zoom: 7.5 });
      }
      return next;
    });
  };

  const handleToggleFullscreen = () => {
    if (!mapContainerRef.current) return;
    if (!document.fullscreenElement) {
      mapContainerRef.current.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  return (
    <div
      className={cn(
        "relative w-full h-[420px] sm:h-[480px] lg:h-[540px] rounded-card overflow-hidden border border-[#E5E8ED] bg-[#F7F8FA] shadow-card",
        isFullscreen && "fixed inset-0 z-50 h-screen rounded-none border-none",
        className
      )}
    >
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating HUD: Train position quick badge */}
      {status && (
        <div className="absolute top-3 left-3 z-30 flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#E5E8ED] shadow-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-[#2864E8] animate-ping" />
          <span className="text-xs font-bold text-[#171A21]">{status.trainName}</span>
          <span className="text-[11px] font-mono text-[#626B78] font-semibold">({status.trainNumber})</span>
          <span className="text-slate-300">•</span>
          <span className="text-[11px] font-medium text-[#168653]">
            {status.speedKmH ? `${status.speedKmH} km/h` : "Live GPS"}
          </span>
        </div>
      )}

      {/* Map Controls Toolbar */}
      <div className="absolute top-3 right-3 z-30 flex flex-col gap-1.5 bg-white/95 backdrop-blur-md p-1 rounded-xl border border-[#E5E8ED] shadow-sm">
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="w-8 h-8 flex items-center justify-center rounded-lg text-[#171A21] hover:bg-[#F7F8FA] active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="w-8 h-8 flex items-center justify-center rounded-lg text-[#171A21] hover:bg-[#F7F8FA] active:scale-95 transition-all"
        >
          <Minus className="w-4 h-4" />
        </button>
        <div className="h-px bg-[#E5E8ED] mx-1" />
        <button
          onClick={handleResetBearing}
          title="Reset Compass / North"
          className="w-8 h-8 flex items-center justify-center rounded-lg text-[#626B78] hover:text-[#171A21] hover:bg-[#F7F8FA] active:scale-95 transition-all"
        >
          <Compass className="w-4 h-4" />
        </button>
        <button
          onClick={handleToggleFollow}
          title={isFollowMode ? "Camera Follow Active" : "Enable Follow Mode"}
          className={cn(
            "w-8 h-8 flex items-center justify-center rounded-lg transition-all",
            isFollowMode
              ? "bg-[#2864E8] text-white shadow-xs"
              : "text-[#626B78] hover:text-[#171A21] hover:bg-[#F7F8FA]"
          )}
        >
          <Crosshair className="w-4 h-4" />
        </button>
        <button
          onClick={handleToggleFullscreen}
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Map"}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-[#626B78] hover:text-[#171A21] hover:bg-[#F7F8FA] active:scale-95 transition-all"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Route Legend */}
      <div className="absolute bottom-3 left-3 z-30 bg-white/95 backdrop-blur-md px-3 py-2 rounded-lg border border-[#E5E8ED] shadow-sm flex items-center gap-3 text-[11px] font-medium text-[#171A21]">
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-1 bg-[#2864E8] rounded-full inline-block" />
          <span>Completed Route</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-4 h-1 border-t-2 border-dashed border-[#8A94A6] inline-block" />
          <span className="text-[#626B78]">Remaining</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#168653] inline-block" />
          <span>Stations</span>
        </div>
      </div>

      {/* Selected Station Popover */}
      {selectedStationPopup && (
        <div className="absolute bottom-14 left-3 right-3 sm:right-auto sm:w-80 z-40 bg-white rounded-xl border border-[#E5E8ED] p-3.5 shadow-float animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#2864E8] tracking-wider">
                Station Detail
              </span>
              <h4 className="text-sm font-bold text-[#171A21]">{selectedStationPopup.stationName}</h4>
              <span className="text-xs font-mono text-[#626B78] font-semibold">
                Code: {selectedStationPopup.stationCode} • {selectedStationPopup.distanceFromSourceKm} km
              </span>
            </div>
            <button
              onClick={() => setSelectedStationPopup(null)}
              className="text-[#626B78] hover:text-[#171A21] text-xs font-bold p-1"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-[#E5E8ED] text-xs">
            <div>
              <span className="text-[10px] text-[#626B78] block">Arrival:</span>
              <span className="font-semibold text-[#171A21] font-mono">
                {selectedStationPopup.actualArrival || selectedStationPopup.scheduledArrival || "--:--"}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#626B78] block">Halt / Platform:</span>
              <span className="font-semibold text-[#171A21]">
                {selectedStationPopup.haltMinutes}m (PF {selectedStationPopup.platform || "1"})
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
