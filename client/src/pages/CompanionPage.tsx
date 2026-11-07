import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { WeatherInfo, NearbyGeography } from "@railpulse/types";
import { apiClient } from "@/services/apiClient";
import { TrainSearch } from "@/features/search/TrainSearch";
import { TravelCompanion } from "@/features/companion/TravelCompanion";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/StateViews";

export const CompanionPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const trainNumber = searchParams.get("train") || "12951";

  const [weather, setWeather] = useState<{
    currentStation?: WeatherInfo;
    nextStation?: WeatherInfo;
    destination?: WeatherInfo;
  }>({});
  const [nearby, setNearby] = useState<NearbyGeography | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    Promise.all([
      apiClient.getJourneyWeather(trainNumber).then(setWeather),
      apiClient.getTrainNearby(trainNumber).then(setNearby),
    ])
      .catch((err) => setError(err.message || "Failed to load companion data"))
      .finally(() => setIsLoading(false));
  }, [trainNumber]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <TrainSearch
        onSelectTrain={(num) => setSearchParams({ train: num })}
        selectedTrainNumber={trainNumber}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#171A21] tracking-tight">
            Smart Travel Companion
          </h1>
          <p className="text-xs sm:text-sm text-[#626B78] mt-0.5">
            Surrounding geography, points of interest, and weather for train <span className="font-mono font-bold text-[#171A21]">{trainNumber}</span>
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-40 rounded-card" />
          <Skeleton className="h-40 rounded-card" />
          <Skeleton className="h-40 rounded-card" />
        </div>
      ) : error ? (
        <ErrorState title="Companion Data Error" description={error} />
      ) : (
        <TravelCompanion weather={weather} nearby={nearby} />
      )}
    </div>
  );
};
