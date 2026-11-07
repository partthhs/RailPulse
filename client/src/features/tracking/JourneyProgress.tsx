import React from "react";
import { Gauge, CheckCircle2, Flag } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export interface JourneyProgressProps {
  completionPercentage: number;
  distanceCoveredKm: number;
  distanceRemainingKm: number;
  totalDistanceKm: number;
  stationsPassedCount: number;
  upcomingStationsCount: number;
}

export const JourneyProgress: React.FC<JourneyProgressProps> = ({
  completionPercentage,
  distanceCoveredKm,
  distanceRemainingKm,
  totalDistanceKm,
  stationsPassedCount,
  upcomingStationsCount,
}) => {
  const clampedProgress = Math.min(100, Math.max(0, completionPercentage));

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Gauge className="w-4 h-4 text-[#2864E8]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#171A21]">
            Journey Completion
          </span>
        </div>
        <Badge variant="brand" size="sm" className="font-mono font-bold">
          {clampedProgress}%
        </Badge>
      </div>

      {/* Progress Bar Container */}
      <div className="w-full h-3 bg-[#E5E8ED] rounded-full overflow-hidden p-0.5 my-3 relative">
        <div
          className="h-full bg-gradient-to-r from-[#2864E8] to-[#1C4AC7] rounded-full transition-all duration-500 ease-out relative"
          style={{ width: `${clampedProgress}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-xs" />
        </div>
      </div>

      {/* Distance and Stations Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
        <div className="bg-[#F7F8FA] p-2.5 rounded-lg border border-[#E5E8ED]">
          <span className="text-[11px] text-[#626B78] block">Covered</span>
          <span className="font-mono font-bold text-sm text-[#171A21]">{distanceCoveredKm} km</span>
        </div>
        <div className="bg-[#F7F8FA] p-2.5 rounded-lg border border-[#E5E8ED]">
          <span className="text-[11px] text-[#626B78] block">Remaining</span>
          <span className="font-mono font-bold text-sm text-[#171A21]">{distanceRemainingKm} km</span>
        </div>
        <div className="bg-[#F7F8FA] p-2.5 rounded-lg border border-[#E5E8ED]">
          <span className="text-[11px] text-[#626B78] block flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-[#168653]" /> Passed
          </span>
          <span className="font-mono font-bold text-sm text-[#168653]">{stationsPassedCount} stations</span>
        </div>
        <div className="bg-[#F7F8FA] p-2.5 rounded-lg border border-[#E5E8ED]">
          <span className="text-[11px] text-[#626B78] block flex items-center gap-1">
            <Flag className="w-3 h-3 text-[#626B78]" /> Ahead
          </span>
          <span className="font-mono font-bold text-sm text-[#626B78]">{upcomingStationsCount} stations</span>
        </div>
      </div>
    </Card>
  );
};
