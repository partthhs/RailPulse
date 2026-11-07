import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { JourneyAnalytics } from "@railpulse/types";
import { apiClient } from "@/services/apiClient";
import { TrainSearch } from "@/features/search/TrainSearch";
import { AnalyticsDashboard } from "@/features/analytics/AnalyticsDashboard";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/StateViews";

export const AnalyticsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const trainNumber = searchParams.get("train") || "12951";

  const [analytics, setAnalytics] = useState<JourneyAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    apiClient
      .getTrainAnalytics(trainNumber)
      .then(setAnalytics)
      .catch((err) => setError(err.message || "Failed to load analytics"))
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
            Journey Analytics & Delay Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-[#626B78] mt-0.5">
            Deep performance metrics for train <span className="font-mono font-bold text-[#171A21]">{trainNumber}</span>
          </p>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-96 w-full rounded-card" />
      ) : error || !analytics ? (
        <ErrorState
          title="Could not load analytics"
          description={error || "Analytics unavailable for this train"}
        />
      ) : (
        <AnalyticsDashboard analytics={analytics} />
      )}
    </div>
  );
};
