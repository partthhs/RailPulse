import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TrainStatus, JourneyRouteData, JourneyAnalytics, WeatherInfo, NearbyGeography, Station } from "@railpulse/types";
import { apiClient } from "@/services/apiClient";
import { TrainHeader } from "@/features/tracking/TrainHeader";
import { CurrentStationCard, NextStationCard } from "@/features/tracking/CurrentStationCard";
import { JourneyProgress } from "@/features/tracking/JourneyProgress";
import { JourneyMap } from "@/features/journey-map/JourneyMap";
import { StationTimeline } from "@/features/tracking/StationTimeline";
import { AnalyticsDashboard } from "@/features/analytics/AnalyticsDashboard";
import { TravelCompanion } from "@/features/companion/TravelCompanion";
import { TrainSearch } from "@/features/search/TrainSearch";
import { ErrorState, EmptyState } from "@/components/ui/StateViews";
import { Skeleton } from "@/components/ui/Skeleton";
import { Map, BarChart3, Compass, ListFilter } from "lucide-react";
import { cn } from "@/utils/cn";

export const TrackingPage: React.FC = () => {
  const { trainNumber = "12951" } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState<TrainStatus | null>(null);
  const [routeData, setRouteData] = useState<JourneyRouteData | null>(null);
  const [analytics, setAnalytics] = useState<JourneyAnalytics | null>(null);
  const [weather, setWeather] = useState<{
    currentStation?: WeatherInfo;
    nextStation?: WeatherInfo;
    destination?: WeatherInfo;
  }>({});
  const [nearby, setNearby] = useState<NearbyGeography | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "analytics" | "companion">("overview");

  // Fetch all journey telemetry
  const fetchData = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) setIsRefreshing(true);
      setError(null);

      try {
        const [statusRes, routeRes] = await Promise.all([
          apiClient.getTrainStatus(trainNumber),
          apiClient.getTrainRoute(trainNumber),
        ]);

        setStatus(statusRes);
        setRouteData(routeRes);

        // Fetch companion & analytics in background
        apiClient.getTrainAnalytics(trainNumber).then(setAnalytics).catch(console.error);
        apiClient.getJourneyWeather(trainNumber).then(setWeather).catch(console.error);
        apiClient.getTrainNearby(trainNumber).then(setNearby).catch(console.error);
      } catch (err: any) {
        console.error("Failed to fetch journey data", err);
        setError(err.message || "Failed to load train status");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [trainNumber]
  );

  useEffect(() => {
    setIsLoading(true);
    fetchData();
  }, [fetchData]);

  // Polling strategy per PRD §3.1: 30s active, 120s background
  useEffect(() => {
    let intervalTime = 30000;

    const handleVisibility = () => {
      intervalTime = document.hidden ? 120000 : 30000;
    };
    document.addEventListener("visibilitychange", handleVisibility);

    const interval = setInterval(() => {
      fetchData();
    }, intervalTime);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [fetchData]);

  const handleSelectTrain = (num: string) => {
    navigate(`/track/${num}`);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <Skeleton className="h-12 w-full max-w-2xl mx-auto rounded-xl" />
        <Skeleton className="h-28 w-full rounded-card" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Skeleton className="lg:col-span-8 h-[450px] rounded-card" />
          <div className="lg:col-span-4 space-y-4">
            <Skeleton className="h-32 rounded-card" />
            <Skeleton className="h-32 rounded-card" />
            <Skeleton className="h-40 rounded-card" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !status) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <TrainSearch onSelectTrain={handleSelectTrain} selectedTrainNumber={trainNumber} />
        <div className="mt-8">
          <ErrorState
            title={`Could not load train ${trainNumber}`}
            description={error}
            onRetry={() => fetchData(true)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
      {/* Search Header */}
      <TrainSearch onSelectTrain={handleSelectTrain} selectedTrainNumber={trainNumber} />

      {/* Train Live Header */}
      {status && (
        <TrainHeader
          status={status}
          onRefresh={() => fetchData(true)}
          isRefreshing={isRefreshing}
        />
      )}

      {/* Tab Navigation Controls */}
      <div className="flex items-center gap-1.5 border-b border-[#E5E8ED] pb-2">
        <button
          onClick={() => setActiveTab("overview")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-btn transition-all",
            activeTab === "overview"
              ? "bg-[#2864E8] text-white shadow-xs"
              : "text-[#626B78] hover:text-[#171A21] hover:bg-white"
          )}
        >
          <Map className="w-4 h-4" /> Live Map & Tracking
        </button>

        <button
          onClick={() => setActiveTab("analytics")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-btn transition-all",
            activeTab === "analytics"
              ? "bg-[#2864E8] text-white shadow-xs"
              : "text-[#626B78] hover:text-[#171A21] hover:bg-white"
          )}
        >
          <BarChart3 className="w-4 h-4" /> Journey Analytics
        </button>

        <button
          onClick={() => setActiveTab("companion")}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-btn transition-all",
            activeTab === "companion"
              ? "bg-[#2864E8] text-white shadow-xs"
              : "text-[#626B78] hover:text-[#171A21] hover:bg-white"
          )}
        >
          <Compass className="w-4 h-4" /> Travel Companion
        </button>
      </div>

      {/* Tab 1: Overview (Live Map 65% + Side Details 35% + Vertical Timeline) */}
      {activeTab === "overview" && status && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Live Map (~65% workspace per PRD §5.2) */}
            <div className="lg:col-span-8">
              <JourneyMap status={status} routeData={routeData || undefined} />
            </div>

            {/* Side Information Panel (35% workspace) */}
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

          {/* Route & Station Timeline */}
          {status.stations && (
            <StationTimeline
              stations={status.stations}
              currentStationCode={status.currentStation?.stationCode}
            />
          )}
        </div>
      )}

      {/* Tab 2: Analytics Dashboard */}
      {activeTab === "analytics" && (
        <div>
          {analytics ? (
            <AnalyticsDashboard analytics={analytics} />
          ) : (
            <Skeleton className="h-96 rounded-card" />
          )}
        </div>
      )}

      {/* Tab 3: Travel Companion */}
      {activeTab === "companion" && (
        <TravelCompanion weather={weather} nearby={nearby} />
      )}
    </div>
  );
};
