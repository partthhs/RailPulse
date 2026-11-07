import React from "react";
import { Station } from "@railpulse/types";
import { MapPin, Navigation, Compass, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export interface CurrentStationCardProps {
  station?: Station;
  delayMinutes: number;
  isBetweenStations?: boolean;
  betweenStationsLabel?: string;
  lastDepartedStation?: Station;
  nextStation?: Station;
  currentIntermediateStation?: string;
}

export const CurrentStationCard: React.FC<CurrentStationCardProps> = ({
  station,
  delayMinutes,
  isBetweenStations,
  betweenStationsLabel,
  lastDepartedStation,
  nextStation,
  currentIntermediateStation,
}) => {
  // If location cannot be verified, display "Location unavailable" rather than guessing
  if (!station && !betweenStationsLabel) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#626B78]">
          <MapPin className="w-3.5 h-3.5 text-[#8A94A6]" />
          Location unavailable
        </div>
        <p className="text-[11px] text-[#8A94A6] mt-1">
          Awaiting real-time GPS telemetry from railway network.
        </p>
      </Card>
    );
  }

  // Train is running BETWEEN stations
  if (isBetweenStations) {
    const departed = lastDepartedStation || station;
    return (
      <Card className="p-4 relative overflow-hidden bg-gradient-to-br from-white to-[#F0F5FF]/30 border-[#2864E8]/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] uppercase tracking-wider font-bold text-[#2864E8] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#2864E8] animate-ping" />
            <Compass className="w-3.5 h-3.5 text-[#2864E8]" /> In Transit Between Stations
          </span>
          <Badge variant="outline" size="sm" className="font-mono text-[10px] text-[#2864E8] border-[#2864E8]/30">
            Running
          </Badge>
        </div>

        <div className="space-y-1">
          <h3 className="text-base sm:text-lg font-bold text-[#171A21] leading-tight">
            {betweenStationsLabel || `Between ${departed?.stationName || "Last Halt"} and ${nextStation?.stationName || "Next Halt"}`}
          </h3>
          {currentIntermediateStation && (
            <div className="flex items-center gap-1.5 text-xs text-[#626B78] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#168653]" />
              Near <span className="font-semibold text-[#171A21]">{currentIntermediateStation}</span> (passing)
            </div>
          )}
        </div>

        <div className="mt-3 pt-3 border-t border-[#E5E8ED] grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-[#626B78] text-[11px] block">Last Departed</span>
            <span className="font-semibold text-[#171A21] font-mono truncate block">
              {departed?.stationName || "—"}
            </span>
            <span className="text-[10px] text-[#626B78] font-mono">
              {departed?.actualDeparture || departed?.scheduledDeparture || "--:--"}
            </span>
          </div>
          <div>
            <span className="text-[#626B78] text-[11px] block">Next Halt</span>
            <span className="font-semibold text-[#2864E8] font-mono truncate block">
              {nextStation?.stationName || "—"}
            </span>
            <span className="text-[10px] text-[#626B78] font-mono">
              ETA: {nextStation?.estimatedArrival || nextStation?.scheduledArrival || "--:--"}
            </span>
          </div>
        </div>
      </Card>
    );
  }

  // Train is halted AT a station
  return (
    <Card className="p-4 relative overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] uppercase tracking-wider font-bold text-[#168653] flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5" /> At Station (Halted)
        </span>
        {station?.platform && (
          <Badge variant="outline" size="sm" className="font-mono">
            Platform {station.platform}
          </Badge>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[#171A21] leading-tight">
            {station?.stationName}
          </h3>
          <span className="text-xs font-mono font-semibold text-[#626B78]">
            {station?.stationCode} {station?.state ? `• ${station.state}` : ""}
          </span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-[#E5E8ED] grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-[#626B78] text-[11px] block">Actual Arrival</span>
          <span className="font-semibold text-[#171A21] font-mono">
            {station?.actualArrival || station?.scheduledArrival || "--:--"}
          </span>
        </div>
        <div>
          <span className="text-[#626B78] text-[11px] block">Scheduled Departure</span>
          <span className="font-semibold text-[#626B78] font-mono">
            {station?.scheduledDeparture || "--:--"}
          </span>
        </div>
      </div>
    </Card>
  );
};

export interface NextStationCardProps {
  station?: Station;
}

export const NextStationCard: React.FC<NextStationCardProps> = ({ station }) => {
  if (!station) {
    return (
      <Card className="p-4">
        <span className="text-xs text-[#626B78]">Journey destination reached or terminating</span>
      </Card>
    );
  }

  return (
    <Card className="p-4 relative overflow-hidden bg-gradient-to-br from-white to-[#F7F8FA]">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] uppercase tracking-wider font-bold text-[#626B78] flex items-center gap-1.5">
          <Navigation className="w-3.5 h-3.5 text-[#2864E8]" /> Next Station
        </span>
        {station.platform && (
          <Badge variant="outline" size="sm" className="font-mono">
            Platform {station.platform}
          </Badge>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[#171A21] leading-tight">
            {station.stationName}
          </h3>
          <span className="text-xs font-mono font-semibold text-[#626B78]">
            {station.stationCode} {station.state ? `• ${station.state}` : ""}
          </span>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-[#E5E8ED] grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-[#626B78] text-[11px] block">Expected Arrival (ETA)</span>
          <span className="font-bold text-[#2864E8] font-mono">
            {station.estimatedArrival || station.scheduledArrival || "--:--"}
          </span>
        </div>
        <div>
          <span className="text-[#626B78] text-[11px] block">Scheduled</span>
          <span className="font-semibold text-[#626B78] font-mono">
            {station.scheduledArrival || "--:--"}
          </span>
        </div>
      </div>
    </Card>
  );
};
