import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { apiClient } from "@/services/apiClient";
import { TrainStatus } from "@railpulse/types";
import { TrainHeader } from "@/features/tracking/TrainHeader";
import { CurrentStationCard, NextStationCard } from "@/features/tracking/CurrentStationCard";
import { JourneyProgress } from "@/features/tracking/JourneyProgress";
import { JourneyMap } from "@/features/journey-map/JourneyMap";
import { StationTimeline } from "@/features/tracking/StationTimeline";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/StateViews";
import { Badge } from "@/components/ui/Badge";
import { ArrowLeft, Share2, Globe } from "lucide-react";

export const SharedPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<{
    token: string;
    trainNumber: string;
    status: TrainStatus;
    createdAt: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    setIsLoading(true);
    apiClient
      .getSharedJourney(token)
      .then(setData)
      .catch((err) => setError(err.message || "Failed to load shared journey"))
      .finally(() => setIsLoading(false));
  }, [token]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <Skeleton className="h-10 w-48 rounded-lg" />
        <Skeleton className="h-28 w-full rounded-card" />
        <Skeleton className="h-[450px] w-full rounded-card" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <ErrorState
          title="Shared Journey Unavailable"
          description={error || "This shared tracking link is expired or invalid."}
        />
        <Link
          to="/"
          className="inline-flex items-center gap-2 mt-4 text-sm font-semibold text-[#2864E8] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Go to RailPulse Home
        </Link>
      </div>
    );
  }

  const { status } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      {/* Read-only banner */}
      <div className="bg-[#2864E8]/10 border border-[#2864E8]/20 rounded-xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#2864E8]">
          <Globe className="w-4 h-4" />
          <span>Public Read-Only Live Tracking View</span>
        </div>
        <Link
          to={`/track/${status.trainNumber}`}
          className="text-xs font-bold text-[#2864E8] hover:underline flex items-center gap-1"
        >
          Open in Full App <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
        </Link>
      </div>

      <TrainHeader status={status} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-8">
          <JourneyMap status={status} />
        </div>
        <div className="lg:col-span-4 space-y-4">
          <CurrentStationCard
            station={status.currentStation}
            delayMinutes={status.delayMinutes}
            isBetweenStations={status.isBetweenStations}
            betweenStationsLabel={status.betweenStationsLabel}
            lastDepartedStation={status.lastDepartedStation}
            nextStation={status.nextStation}
            currentIntermediateStation={status.currentIntermediateStation}
          />
          <NextStationCard station={status.nextStation} />
          <JourneyProgress
            completionPercentage={status.completionPercentage}
            distanceCoveredKm={status.distanceCoveredKm}
            distanceRemainingKm={status.distanceRemainingKm}
            totalDistanceKm={status.totalDistanceKm}
            stationsPassedCount={status.stationsPassedCount}
            upcomingStationsCount={status.upcomingStationsCount}
          />
        </div>
      </div>

      {status.stations && (
        <StationTimeline
          stations={status.stations}
          currentStationCode={status.currentStation?.stationCode}
        />
      )}
    </div>
  );
};
