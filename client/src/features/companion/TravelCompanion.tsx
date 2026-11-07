import React from "react";
import { WeatherInfo, NearbyGeography, GeoFeature } from "@railpulse/types";
import {
  Sun,
  Cloud,
  CloudRain,
  Wind,
  Droplets,
  Compass,
  MapPin,
  Waves,
  Mountain,
  Landmark,
  Building,
  Info,
  Layers,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export interface TravelCompanionProps {
  weather?: {
    currentStation?: WeatherInfo;
    nextStation?: WeatherInfo;
    destination?: WeatherInfo;
  };
  nearby?: NearbyGeography | null;
}

export const TravelCompanion: React.FC<TravelCompanionProps> = ({ weather, nearby }) => {
  const renderWeatherCard = (title: string, data?: WeatherInfo) => {
    if (!data) {
      return (
        <Card className="p-4 bg-[#F7F8FA]/50 border-dashed">
          <span className="text-xs text-[#626B78]">{title}: Weather data unavailable</span>
        </Card>
      );
    }

    return (
      <Card className="p-4 relative overflow-hidden bg-gradient-to-b from-white to-[#F7F8FA]/40">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] uppercase tracking-wider font-bold text-[#626B78]">
            {title}
          </span>
          <Badge variant="brand" size="sm">
            {data.stationCode}
          </Badge>
        </div>

        <div className="flex items-center justify-between mt-1">
          <div>
            <h4 className="text-base font-bold text-[#171A21]">{data.stationName}</h4>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#171A21] font-mono">
                {data.temperature}°C
              </span>
              <span className="text-xs text-[#626B78]">Feels {data.feelsLike}°C</span>
            </div>
            <span className="text-xs font-semibold text-[#2864E8] block mt-0.5">
              {data.condition}
            </span>
          </div>

          <div className="w-12 h-12 rounded-xl bg-[#2864E8]/10 flex items-center justify-center text-[#2864E8]">
            {data.rainProbability && data.rainProbability > 20 ? (
              <CloudRain className="w-6 h-6" />
            ) : data.condition.toLowerCase().includes("cloud") ? (
              <Cloud className="w-6 h-6" />
            ) : (
              <Sun className="w-6 h-6" />
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-[#E5E8ED] text-[11px]">
          <div>
            <span className="text-[#626B78] block">Humidity</span>
            <span className="font-semibold text-[#171A21] flex items-center gap-1">
              <Droplets className="w-3 h-3 text-[#2864E8]" /> {data.humidity}%
            </span>
          </div>
          <div>
            <span className="text-[#626B78] block">Wind</span>
            <span className="font-semibold text-[#171A21] flex items-center gap-1">
              <Wind className="w-3 h-3 text-[#626B78]" /> {data.windSpeed} km/h
            </span>
          </div>
          <div>
            <span className="text-[#626B78] block">Rain Chance</span>
            <span className="font-semibold text-[#171A21]">
              {data.rainProbability ?? 0}%
            </span>
          </div>
        </div>
      </Card>
    );
  };

  const renderGeoCategory = (
    title: string,
    icon: React.ReactNode,
    items: GeoFeature[],
    emptyText: string
  ) => {
    return (
      <div className="bg-white rounded-xl border border-[#E5E8ED] p-4 shadow-card">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#E5E8ED]">
          {icon}
          <h4 className="text-sm font-bold text-[#171A21]">{title}</h4>
          <span className="text-xs font-semibold text-[#626B78] ml-auto">
            {items.length} {items.length === 1 ? "feature" : "features"}
          </span>
        </div>

        {items.length > 0 ? (
          <div className="space-y-2.5">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-3 p-2 rounded-lg hover:bg-[#F7F8FA] transition-colors"
              >
                <div>
                  <span className="text-xs font-bold text-[#171A21] block">{item.name}</span>
                  {item.description && (
                    <p className="text-[11px] text-[#626B78] leading-relaxed mt-0.5">
                      {item.description}
                    </p>
                  )}
                </div>
                <Badge variant="neutral" size="sm" className="shrink-0 font-mono text-[10px]">
                  ~{item.distanceKm} km away
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#626B78] italic py-2">{emptyText}</p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Weather Section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sun className="w-4 h-4 text-[#2864E8]" />
          <h3 className="text-base font-bold text-[#171A21]">Route Weather Intelligence</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {renderWeatherCard("Current Station", weather?.currentStation)}
          {renderWeatherCard("Next Station", weather?.nextStation)}
          {renderWeatherCard("Destination", weather?.destination)}
        </div>
      </div>

      {/* Nearby Geography Section */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#2864E8]" />
            <h3 className="text-base font-bold text-[#171A21]">
              Nearby Geography & Points of Interest
            </h3>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#626B78] bg-white px-2.5 py-1 rounded-md border border-[#E5E8ED]">
            <Info className="w-3.5 h-3.5 text-[#2864E8]" />
            <span>OpenStreetMap approximate spatial sampling (25 km radius)</span>
          </div>
        </div>

        {nearby ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderGeoCategory(
              "Rivers & Water Bodies",
              <Waves className="w-4 h-4 text-[#2864E8]" />,
              [...nearby.rivers, ...nearby.lakes],
              "No prominent major rivers in immediate 25 km corridor."
            )}

            {renderGeoCategory(
              "Mountains & Hill Ranges",
              <Mountain className="w-4 h-4 text-[#168653]" />,
              nearby.mountains,
              "Terrain is mostly level plain along this route segment."
            )}

            {renderGeoCategory(
              "Major Bridges & Infrastructure",
              <Layers className="w-4 h-4 text-[#B7791F]" />,
              [...nearby.bridges, ...nearby.tunnels],
              "No major signature bridge viaducts recorded in this vicinity."
            )}

            {renderGeoCategory(
              "Historic Attractions & Monuments",
              <Landmark className="w-4 h-4 text-[#2864E8]" />,
              nearby.attractions,
              "No prominent monuments recorded nearby."
            )}
          </div>
        ) : (
          <Card className="p-6 text-center text-xs text-[#626B78]">
            Geographical spatial context will appear once train status is loaded.
          </Card>
        )}
      </div>
    </div>
  );
};
