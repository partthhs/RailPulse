import React from "react";
import { Station } from "@railpulse/types";
import { CheckCircle2, Clock, MapPin, ArrowDown } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { cn } from "@/utils/cn";

export interface StationTimelineProps {
  stations: Station[];
  currentStationCode?: string;
  onSelectStation?: (station: Station) => void;
}

export const StationTimeline: React.FC<StationTimelineProps> = ({
  stations,
  currentStationCode,
  onSelectStation,
}) => {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E5E8ED]">
        <div>
          <h3 className="text-sm font-bold text-[#171A21] tracking-tight">Route & Station Timeline</h3>
          <p className="text-xs text-[#626B78]">Chronological stop sequence and scheduled timings</p>
        </div>
        <span className="text-xs font-semibold text-[#626B78]">{stations.length} Stops</span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#E5E8ED]">
        {stations.map((station, index) => {
          const isCurrent = station.stationCode === currentStationCode || station.isCurrent;
          const isPassed = station.isPassed && !isCurrent;
          const isTerminus = index === stations.length - 1;
          const isOrigin = index === 0;

          return (
            <div
              key={station.id || station.stationCode}
              onClick={() => onSelectStation && onSelectStation(station)}
              className={cn(
                "relative group cursor-pointer transition-all p-2 -ml-2 rounded-lg",
                isCurrent ? "bg-[#2864E8]/5 border border-[#2864E8]/20" : "hover:bg-[#F7F8FA]"
              )}
            >
              {/* Timeline Node Dot */}
              <div
                className={cn(
                  "absolute -left-6 top-3 w-4 h-4 rounded-full border-2 transition-transform duration-200 shadow-xs flex items-center justify-center",
                  isCurrent
                    ? "bg-[#2864E8] border-white ring-4 ring-[#2864E8]/20 scale-125 z-10"
                    : isPassed
                    ? "bg-[#168653] border-white text-white"
                    : "bg-white border-[#8A94A6]"
                )}
              >
                {isPassed && <CheckCircle2 className="w-2.5 h-2.5" />}
              </div>

              {/* Station Row Content */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#171A21]">{station.stationName}</span>
                    <span className="text-xs font-mono font-semibold text-[#626B78]">({station.stationCode})</span>
                    {isCurrent && (
                      <Badge variant="brand" size="sm" dot>
                        Current
                      </Badge>
                    )}
                    {station.platform && (
                      <span className="text-[11px] text-[#626B78] font-medium bg-[#F7F8FA] px-1.5 py-0.5 rounded border border-[#E5E8ED]">
                        PF {station.platform}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-[#626B78] flex items-center gap-2 mt-0.5">
                    <span>{station.distanceFromSourceKm} km</span>
                    {station.haltMinutes > 0 && <span>• Halt: {station.haltMinutes}m</span>}
                    {station.state && <span>• {station.state}</span>}
                  </div>
                </div>

                {/* Timings */}
                <div className="text-right sm:text-right flex sm:flex-col items-center sm:items-end justify-between gap-1 sm:gap-0 mt-1 sm:mt-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono font-bold text-[#171A21]">
                      {station.actualArrival || station.estimatedArrival || station.scheduledArrival || "--:--"}
                    </span>
                    {station.delayArrivalMinutes > 0 && (
                      <span className="text-[11px] text-[#B7791F] font-semibold">
                        (+{station.delayArrivalMinutes}m)
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-[#626B78]">
                    Sch: {station.scheduledArrival || station.scheduledDeparture || "--:--"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
