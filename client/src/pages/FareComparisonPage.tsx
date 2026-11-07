import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  StationOption,
  FareComparisonItem,
  TravelClass,
  Quota,
} from "@railpulse/types";
import { apiClient } from "@/services/apiClient";
import { StationSelect } from "@/features/planner/StationSelect";
import {
  TrendingDown,
  ArrowUpDown,
  Sparkles,
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Filter,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState, EmptyState } from "@/components/ui/StateViews";
import { cn } from "@/utils/cn";

const TRAVEL_CLASSES: { id: TravelClass; label: string }[] = [
  { id: "3A", label: "Third AC (3A)" },
  { id: "2A", label: "Second AC (2A)" },
  { id: "1A", label: "First AC (1A)" },
  { id: "3E", label: "3 AC Economy (3E)" },
  { id: "SL", label: "Sleeper (SL)" },
  { id: "CC", label: "AC Chair Car (CC)" },
  { id: "EC", label: "Exec. Chair Car (EC)" },
  { id: "2S", label: "Second Sitting (2S)" },
];

export const FareComparisonPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [fromStation, setFromStation] = useState<StationOption | null>({
    code: searchParams.get("from") || "MMCT",
    name: searchParams.get("from") === "NDLS" ? "New Delhi" : "Mumbai Central",
  });
  const [toStation, setToStation] = useState<StationOption | null>({
    code: searchParams.get("to") || "NDLS",
    name: searchParams.get("to") === "MMCT" ? "Mumbai Central" : "New Delhi",
  });

  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const [journeyDate, setJourneyDate] = useState<string>(
    searchParams.get("date") || tomorrow
  );
  const [travelClass, setTravelClass] = useState<TravelClass>(
    (searchParams.get("class") as TravelClass) || "3A"
  );
  const [sortBy, setSortBy] = useState<
    "fare_asc" | "fare_desc" | "duration_asc" | "dep_earliest" | "arr_earliest"
  >("fare_asc");

  const [availableOnly, setAvailableOnly] = useState(false);

  const [items, setItems] = useState<FareComparisonItem[]>([]);
  const [bestValueTrain, setBestValueTrain] = useState<FareComparisonItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCompare = async () => {
    if (!fromStation || !toStation) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await apiClient.compareFares({
        from: fromStation.code,
        to: toStation.code,
        date: journeyDate,
        class: travelClass,
        sortBy,
      });
      setItems(res.items);
      setBestValueTrain(res.bestValueTrain);
    } catch (err: any) {
      setError(err.message || "Failed to compare train fares.");
      setItems([]);
      setBestValueTrain(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleCompare();
  }, [fromStation, toStation, journeyDate, travelClass, sortBy]);

  const displayedItems = availableOnly
    ? items.filter((i) => i.statusText.includes("AVAILABLE"))
    : items;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Badge variant="brand" size="md">
            <TrendingDown className="w-3.5 h-3.5" /> Intelligent Tariff Engine
          </Badge>
          <span className="text-xs text-[#626B78] font-medium">Standardized Class Comparison</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171A21] tracking-tight mt-1.5">
          Train Fare Comparison
        </h1>
        <p className="text-xs sm:text-sm text-[#626B78] mt-1">
          Compare real railway ticket fares between stations with transparent Best Value recommendations.
        </p>
      </div>

      {/* Control Bar */}
      <Card className="p-5 shadow-card">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-4">
            <StationSelect
              label="From Station"
              value={fromStation}
              onChange={setFromStation}
            />
          </div>

          <div className="sm:col-span-4">
            <StationSelect
              label="To Station"
              value={toStation}
              onChange={setToStation}
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-[#626B78] uppercase tracking-wider mb-1.5">
              Journey Date
            </label>
            <input
              type="date"
              min={new Date().toISOString().slice(0, 10)}
              value={journeyDate}
              onChange={(e) => setJourneyDate(e.target.value)}
              className="w-full py-2.5 px-3 bg-white text-xs font-semibold text-[#171A21] border border-[#E5E8ED] rounded-xl focus:border-[#2864E8] focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-[#626B78] uppercase tracking-wider mb-1.5">
              Class
            </label>
            <select
              value={travelClass}
              onChange={(e) => setTravelClass(e.target.value as TravelClass)}
              className="w-full py-2.5 px-3 bg-white text-xs font-semibold text-[#171A21] border border-[#E5E8ED] rounded-xl focus:border-[#2864E8] focus:outline-none"
            >
              {TRAVEL_CLASSES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter and Sort Row */}
        <div className="mt-4 pt-4 border-t border-[#E5E8ED] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-[#626B78] flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
            </span>
            {[
              { id: "fare_asc", label: "Lowest Fare" },
              { id: "fare_desc", label: "Highest Fare" },
              { id: "duration_asc", label: "Fastest Journey" },
              { id: "dep_earliest", label: "Earliest Departure" },
              { id: "arr_earliest", label: "Earliest Arrival" },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setSortBy(s.id as any)}
                className={cn(
                  "px-3 py-1.5 rounded-lg border font-medium transition-all",
                  sortBy === s.id
                    ? "bg-[#2864E8] text-white border-[#2864E8] shadow-xs"
                    : "bg-white text-[#171A21] border-[#E5E8ED] hover:bg-[#F7F8FA]"
                )}
              >
                {s.label}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-2 cursor-pointer font-medium text-[#171A21] select-none">
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
              className="rounded text-[#2864E8] focus:ring-[#2864E8]"
            />
            <span>Available Seats Only</span>
          </label>
        </div>
      </Card>

      {/* Best Value Recommendation Banner */}
      {bestValueTrain && !isLoading && (
        <Card className="p-5 sm:p-6 bg-gradient-to-r from-[#2864E8]/10 via-[#2864E8]/5 to-white border-[#2864E8]/30 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="brand" size="md">
                  <Award className="w-3.5 h-3.5" /> RailPulse Best Value Recommendation
                </Badge>
                <span className="text-[11px] text-[#626B78]">
                  Algorithmic Score: {bestValueTrain.score}/100
                </span>
              </div>
              <h3 className="font-bold text-lg text-[#171A21]">
                {bestValueTrain.trainName} ({bestValueTrain.trainNumber})
              </h3>
              <p className="text-xs text-[#626B78] max-w-xl">
                {bestValueTrain.recommendationReason}
              </p>
            </div>

            <div className="flex items-center gap-4 sm:border-l sm:border-[#E5E8ED] sm:pl-6 shrink-0">
              <div className="text-right">
                <span className="text-[11px] text-[#626B78] block">Ticket Fare</span>
                <span className="font-mono font-extrabold text-2xl text-[#171A21]">
                  ₹{bestValueTrain.fare}
                </span>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(`/track/${bestValueTrain.trainNumber}`)}
                className="font-bold text-xs"
              >
                Track Train
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Comparison Table */}
      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      ) : error ? (
        <ErrorState title="Comparison Failed" description={error} onRetry={handleCompare} />
      ) : displayedItems.length > 0 ? (
        <Card className="overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F8FA] border-b border-[#E5E8ED] text-[#626B78] font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Train</th>
                  <th className="py-3 px-4">Departure</th>
                  <th className="py-3 px-4">Arrival</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Stops</th>
                  <th className="py-3 px-4">Fare ({travelClass})</th>
                  <th className="py-3 px-4">Availability</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E8ED]">
                {displayedItems.map((item) => (
                  <tr
                    key={item.trainNumber}
                    className={cn(
                      "hover:bg-[#F7F8FA]/80 transition-colors",
                      item.isBestValue && "bg-[#2864E8]/5"
                    )}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#171A21]">
                          {item.trainNumber}
                        </span>
                        <span className="font-semibold text-[#171A21]">{item.trainName}</span>
                        {item.isBestValue && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#168653]/15 text-[#168653]">
                            Best Value
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#626B78] block">{item.trainType}</span>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-semibold text-[#171A21]">
                      {item.departureTime}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-semibold text-[#171A21]">
                      {item.arrivalTime}
                    </td>

                    <td className="py-3.5 px-4 font-medium text-[#626B78]">
                      {item.durationFormatted}
                    </td>

                    <td className="py-3.5 px-4 text-[#626B78]">{item.haltsCount} stops</td>

                    <td className="py-3.5 px-4 font-mono font-bold text-sm text-[#171A21]">
                      ₹{item.fare}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={cn(
                          "font-bold text-[11px]",
                          item.statusText.includes("AVAILABLE")
                            ? "text-[#168653]"
                            : "text-[#B7791F]"
                        )}
                      >
                        {item.statusText}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/track/${item.trainNumber}`)}
                        className="text-xs"
                      >
                        Track
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <EmptyState
          title="No comparison data"
          description="No matching trains running for this class on the selected journey date."
        />
      )}
    </div>
  );
};
