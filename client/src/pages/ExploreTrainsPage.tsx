import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  StationOption,
  BetweenTrainResult,
  TravelClass,
  Quota,
  ClassFareInfo,
} from "@railpulse/types";
import { apiClient } from "@/services/apiClient";
import { StationSelect } from "@/features/planner/StationSelect";
import {
  Search,
  ArrowRightLeft,
  Calendar,
  Users,
  ShieldAlert,
  Clock,
  Sparkles,
  TrendingDown,
  Bookmark,
  Check,
  Eye,
  Info,
  CalendarDays,
  Gauge,
  ArrowRight,
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

const QUOTAS: { id: Quota; label: string }[] = [
  { id: "GN", label: "General Quota (GN)" },
  { id: "TQ", label: "Tatkal Quota (TQ)" },
  { id: "PT", label: "Premium Tatkal (PT)" },
  { id: "LD", label: "Ladies Quota (LD)" },
  { id: "SS", label: "Senior Citizen (SS)" },
];

export const ExploreTrainsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Search form states: read from query params or start clean
  const [fromStation, setFromStation] = useState<StationOption | null>(() => {
    const fromCode = searchParams.get("from");
    return fromCode ? { code: fromCode.toUpperCase(), name: fromCode.toUpperCase() } : null;
  });
  const [toStation, setToStation] = useState<StationOption | null>(() => {
    const toCode = searchParams.get("to");
    return toCode ? { code: toCode.toUpperCase(), name: toCode.toUpperCase() } : null;
  });

  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const [journeyDate, setJourneyDate] = useState<string>(
    searchParams.get("date") || tomorrow
  );
  const [selectedClass, setSelectedClass] = useState<TravelClass | "ALL">("ALL");
  const [selectedQuota, setSelectedQuota] = useState<Quota>("GN");
  const [passengers, setPassengers] = useState<number>(1);

  // Results & UI state
  const [trains, setTrains] = useState<BetweenTrainResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Watchlist modal state
  const [watchlistModalTrain, setWatchlistModalTrain] = useState<BetweenTrainResult | null>(null);
  const [isWatchlistSaving, setIsWatchlistSaving] = useState(false);
  const [watchlistSavedSuccess, setWatchlistSavedSuccess] = useState(false);
  const [notifyApproaching, setNotifyApproaching] = useState(true);
  const [notifyBookingOpening, setNotifyBookingOpening] = useState(true);
  const [notifyDelay, setNotifyDelay] = useState(true);
  const [notifyPlatform, setNotifyPlatform] = useState(true);

  // Train detail modal
  const [detailModalTrain, setDetailModalTrain] = useState<BetweenTrainResult | null>(null);

  const handleSearch = async () => {
    if (!fromStation || !toStation) {
      setError("Please select both source and destination stations.");
      return;
    }
    if (fromStation.code === toStation.code) {
      setError("Source and destination stations cannot be the same.");
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    setError(null);

    try {
      const data = await apiClient.getTrainsBetween({
        from: fromStation.code,
        to: toStation.code,
        date: journeyDate,
        class: selectedClass === "ALL" ? undefined : selectedClass,
        quota: selectedQuota,
      });
      setTrains(data);
    } catch (err: any) {
      setError(err.message || "Failed to search trains between stations.");
      setTrains([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (fromStation && toStation) {
      handleSearch();
    }
  }, []);

  const handleSwapStations = () => {
    const temp = fromStation;
    setFromStation(toStation);
    setToStation(temp);
  };

  const handleOpenWatchlistModal = (train: BetweenTrainResult) => {
    setWatchlistModalTrain(train);
    setWatchlistSavedSuccess(false);
  };

  const handleSaveToWatchlist = async () => {
    if (!watchlistModalTrain || !fromStation || !toStation) return;
    setIsWatchlistSaving(true);
    try {
      await apiClient.addToWatchlist({
        trainNumber: watchlistModalTrain.trainNumber,
        trainName: watchlistModalTrain.trainName,
        journeyDate,
        sourceStation: fromStation.name,
        sourceStationCode: fromStation.code,
        destinationStation: toStation.name,
        destinationStationCode: toStation.code,
        boardingStation: fromStation.name,
        boardingStationCode: fromStation.code,
        bookingStatus: "UPCOMING",
        notifyApproaching,
        notifyBookingOpening,
        notifyDelay,
        notifyPlatform,
      });
      setWatchlistSavedSuccess(true);
      setTimeout(() => {
        setWatchlistModalTrain(null);
        setWatchlistSavedSuccess(false);
      }, 1500);
    } catch (err: any) {
      console.error("Watchlist save failed", err);
    } finally {
      setIsWatchlistSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <Badge variant="brand" size="md">
            <Sparkles className="w-3.5 h-3.5" /> Smart Journey Planner
          </Badge>
          <span className="text-xs text-[#626B78] font-medium">RailRadar Direct Telemetry</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171A21] tracking-tight mt-1.5">
          Explore Trains Between Stations
        </h1>
        <p className="text-xs sm:text-sm text-[#626B78] mt-1">
          Search connecting trains, live seat availability, official telescopic fares, and 60-day reservation opening dates.
        </p>
      </div>

      {/* Main Search Panel */}
      <Card className="p-5 sm:p-6 shadow-card">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          {/* From Station */}
          <div className="md:col-span-4">
            <StationSelect
              label="From Station"
              value={fromStation}
              onChange={setFromStation}
              excludeCode={toStation?.code}
            />
          </div>

          {/* Swap Button */}
          <div className="md:col-span-1 flex justify-center pb-1">
            <button
              type="button"
              onClick={handleSwapStations}
              className="w-10 h-10 rounded-xl border border-[#E5E8ED] bg-[#F7F8FA] hover:bg-white hover:border-[#2864E8] text-[#171A21] hover:text-[#2864E8] flex items-center justify-center transition-all shadow-xs active:scale-95"
              title="Swap stations"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          {/* To Station */}
          <div className="md:col-span-4">
            <StationSelect
              label="To Station"
              value={toStation}
              onChange={setToStation}
              excludeCode={fromStation?.code}
            />
          </div>

          {/* Journey Date */}
          <div className="md:col-span-3">
            <label className="block text-xs font-semibold text-[#626B78] uppercase tracking-wider mb-1.5">
              Journey Date
            </label>
            <div className="relative">
              <input
                type="date"
                min={new Date().toISOString().slice(0, 10)}
                value={journeyDate}
                onChange={(e) => setJourneyDate(e.target.value)}
                className="w-full py-2.5 px-3 bg-white text-sm font-medium text-[#171A21] border border-[#E5E8ED] rounded-xl shadow-subtle hover:border-[#C4C9D3] focus:border-[#2864E8] focus:ring-4 focus:ring-[#2864E8]/10 focus:outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="mt-4 pt-4 border-t border-[#E5E8ED] grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-[#626B78] mb-1">Travel Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value as any)}
              className="w-full py-2 px-2.5 bg-white border border-[#E5E8ED] rounded-lg text-xs font-medium text-[#171A21] focus:border-[#2864E8] focus:outline-none"
            >
              <option value="ALL">All Classes</option>
              {TRAVEL_CLASSES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-[#626B78] mb-1">Quota</label>
            <select
              value={selectedQuota}
              onChange={(e) => setSelectedQuota(e.target.value as any)}
              className="w-full py-2 px-2.5 bg-white border border-[#E5E8ED] rounded-lg text-xs font-medium text-[#171A21] focus:border-[#2864E8] focus:outline-none"
            >
              {QUOTAS.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-[#626B78] mb-1">Passengers</label>
            <input
              type="number"
              min={1}
              max={6}
              value={passengers}
              onChange={(e) => setPassengers(Math.max(1, Math.min(6, parseInt(e.target.value, 10) || 1)))}
              className="w-full py-2 px-2.5 bg-white border border-[#E5E8ED] rounded-lg text-xs font-medium text-[#171A21] focus:border-[#2864E8] focus:outline-none"
            />
          </div>

          <div className="flex items-end">
            <Button
              onClick={handleSearch}
              isLoading={isLoading}
              className="w-full h-9 gap-2 text-xs font-bold"
            >
              <Search className="w-3.5 h-3.5" /> Find Available Trains
            </Button>
          </div>
        </div>
      </Card>

      {/* Results Header */}
      {trains.length > 0 && fromStation && toStation && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-[#E5E8ED]">
          <div>
            <span className="text-xs text-[#626B78]">Showing connecting trains for</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-bold text-base text-[#171A21]">{fromStation.name}</span>
              <ArrowRight className="w-4 h-4 text-[#2864E8]" />
              <span className="font-bold text-base text-[#171A21]">{toStation.name}</span>
              <Badge variant="outline" size="sm" className="font-mono">
                {journeyDate}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                navigate(
                  `/calendar?from=${fromStation.code}&to=${toStation.code}&class=${selectedClass === "ALL" ? "3A" : selectedClass}`
                )
              }
              className="gap-1.5 text-xs font-semibold"
            >
              <CalendarDays className="w-3.5 h-3.5 text-[#2864E8]" /> View Monthly Calendar
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                navigate(
                  `/compare-fares?from=${fromStation.code}&to=${toStation.code}&date=${journeyDate}&class=${selectedClass === "ALL" ? "3A" : selectedClass}`
                )
              }
              className="gap-1.5 text-xs font-semibold"
            >
              <TrendingDown className="w-3.5 h-3.5 text-[#168653]" /> Compare Fares
            </Button>
          </div>
        </div>
      )}

      {/* Results List */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-44 w-full rounded-card" />
          <Skeleton className="h-44 w-full rounded-card" />
          <Skeleton className="h-44 w-full rounded-card" />
        </div>
      ) : error ? (
        <ErrorState title="Search Failed" description={error} onRetry={handleSearch} />
      ) : trains.length > 0 ? (
        <div className="space-y-4">
          {trains.map((train) => (
            <Card key={train.trainNumber} className="p-5 hover:border-[#2864E8]/40 transition-all">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left: Train Identity */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono font-extrabold text-lg text-[#171A21]">
                      {train.trainNumber}
                    </span>
                    <h3 className="font-bold text-base text-[#171A21]">{train.trainName}</h3>
                    <Badge variant="brand" size="sm">
                      {train.trainType}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-[#626B78] flex-wrap pt-0.5">
                    <span>Runs on:</span>
                    <div className="flex items-center gap-1 font-mono text-[10px]">
                      {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((d) => {
                        const runs = train.runsOnDays.includes(d);
                        return (
                          <span
                            key={d}
                            className={cn(
                              "px-1.5 py-0.5 rounded font-semibold",
                              runs
                                ? "bg-[#168653]/10 text-[#168653] border border-[#168653]/20"
                                : "bg-[#F7F8FA] text-[#8A94A6]"
                            )}
                          >
                            {d[0]}
                          </span>
                        );
                      })}
                    </div>
                    <span className="text-slate-300">•</span>
                    <span>{train.haltsCount} stops</span>
                    <span className="text-slate-300">•</span>
                    <span>{train.distanceKm} km</span>
                  </div>
                </div>

                {/* Center: Timings & Duration */}
                <div className="flex items-center gap-5 sm:gap-8 bg-[#F7F8FA] px-4 py-2.5 rounded-xl border border-[#E5E8ED]">
                  <div>
                    <span className="text-[11px] text-[#626B78] block">Departure</span>
                    <span className="font-mono font-bold text-base text-[#171A21]">
                      {train.departureTime}
                    </span>
                    <span className="text-[10px] font-semibold text-[#626B78] block">
                      {train.fromStationCode}
                    </span>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-mono font-medium text-[#626B78]">
                      {train.durationFormatted}
                    </span>
                    <div className="w-16 sm:w-20 h-0.5 bg-[#C4C9D3] my-1 relative">
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#2864E8]" />
                    </div>
                    <span className="text-[9px] text-[#168653] font-semibold">Direct</span>
                  </div>

                  <div>
                    <span className="text-[11px] text-[#626B78] block">Arrival</span>
                    <span className="font-mono font-bold text-base text-[#171A21]">
                      {train.arrivalTime}
                    </span>
                    <span className="text-[10px] font-semibold text-[#626B78] block">
                      {train.toStationCode}
                    </span>
                  </div>
                </div>
              </div>

              {/* Class Cards Row */}
              <div className="mt-4 pt-4 border-t border-[#E5E8ED] grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
                {train.classes.map((cls) => (
                  <div
                    key={cls.classType}
                    className="p-2.5 rounded-lg border border-[#E5E8ED] bg-white hover:border-[#2864E8]/60 transition-all text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#171A21]">{cls.classType}</span>
                      <span className="font-mono font-bold text-[#171A21]">₹{cls.fare}</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[11px]">
                      <span
                        className={cn(
                          "font-semibold",
                          cls.status === "AVAILABLE" ? "text-[#168653]" : "text-[#B7791F]"
                        )}
                      >
                        {cls.statusText}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer: 60-Day ARP policy & Actions */}
              <div className="mt-4 pt-3 border-t border-[#E5E8ED]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                {train.reservationOpeningDate ? (
                  <div className="flex items-center gap-1.5 text-[11px] text-[#626B78]">
                    <Clock className="w-3.5 h-3.5 text-[#2864E8]" />
                    <span>60-Day Advance Booking:</span>
                    <span className="font-semibold text-[#171A21]">
                      {train.daysUntilReservationOpens && train.daysUntilReservationOpens > 0
                        ? `Opens in ${train.daysUntilReservationOpens} days (${train.reservationOpeningDate} at 08:00 AM IST)`
                        : `Reservation Open since ${train.reservationOpeningDate}`}
                    </span>
                  </div>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2 ml-auto">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDetailModalTrain(train)}
                    className="text-xs"
                  >
                    <Eye className="w-3.5 h-3.5 mr-1" /> View Details
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      navigate(
                        `/compare-fares?from=${train.fromStationCode}&to=${train.toStationCode}&date=${journeyDate}&class=3A`
                      )
                    }
                    className="text-xs"
                  >
                    Compare Fare
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleOpenWatchlistModal(train)}
                    className="text-xs gap-1.5 font-bold"
                  >
                    <Bookmark className="w-3.5 h-3.5" /> Add to Watchlist
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : !hasSearched ? (
        <Card className="p-8 sm:p-12 text-center border-dashed border-[#E5E8ED] bg-[#F7F8FA]/50">
          <div className="w-12 h-12 rounded-2xl bg-[#2864E8]/10 text-[#2864E8] flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-[#171A21]">Discover Trains Across India</h3>
          <p className="text-xs sm:text-sm text-[#626B78] max-w-md mx-auto mt-1 leading-relaxed">
            Select your origin and destination stations above to find real-time running trains, official telescopic fares, and 60-day reservation opening dates.
          </p>
        </Card>
      ) : (
        <EmptyState
          title="No trains operating"
          description="No direct trains found running between the selected stations on this date. Try changing dates or selecting alternative stations."
        />
      )}

      {/* Watchlist Modal */}
      {watchlistModalTrain && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-card border border-[#E5E8ED] shadow-float max-w-md w-full p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E8ED] pb-3">
              <div>
                <h3 className="font-bold text-base text-[#171A21]">Save to My Watchlist</h3>
                <p className="text-xs text-[#626B78]">
                  Monitor status & receive smart notifications for this journey
                </p>
              </div>
              <button
                onClick={() => setWatchlistModalTrain(null)}
                className="text-[#626B78] hover:text-[#171A21] text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="bg-[#F7F8FA] p-3 rounded-xl border border-[#E5E8ED] text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#171A21]">{watchlistModalTrain.trainName}</span>
                <span className="font-mono font-bold text-[#2864E8]">
                  #{watchlistModalTrain.trainNumber}
                </span>
              </div>
              <div className="text-[#626B78]">
                Journey Date: <span className="font-semibold text-[#171A21]">{journeyDate}</span>
              </div>
              <div className="text-[#626B78]">
                Route: {watchlistModalTrain.fromStationCode} → {watchlistModalTrain.toStationCode}
              </div>
            </div>

            <div className="space-y-2.5 pt-1 text-xs">
              <span className="font-bold text-[#171A21] block">Configure Smart Notifications:</span>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyApproaching}
                  onChange={(e) => setNotifyApproaching(e.target.checked)}
                  className="rounded text-[#2864E8] focus:ring-[#2864E8]"
                />
                <span>Train approaching boarding station (30 mins alert)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyBookingOpening}
                  onChange={(e) => setNotifyBookingOpening(e.target.checked)}
                  className="rounded text-[#2864E8] focus:ring-[#2864E8]"
                />
                <span>60-Day Reservation Opening reminder (08:00 AM alert)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyDelay}
                  onChange={(e) => setNotifyDelay(e.target.checked)}
                  className="rounded text-[#2864E8] focus:ring-[#2864E8]"
                />
                <span>Real-time train delay updates (&gt;20 mins)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyPlatform}
                  onChange={(e) => setNotifyPlatform(e.target.checked)}
                  className="rounded text-[#2864E8] focus:ring-[#2864E8]"
                />
                <span>Boarding platform number announcements</span>
              </label>
            </div>

            <div className="pt-3 border-t border-[#E5E8ED] flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setWatchlistModalTrain(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveToWatchlist}
                isLoading={isWatchlistSaving}
                className="gap-1.5 font-bold"
              >
                {watchlistSavedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Saved!
                  </>
                ) : (
                  <>
                    <Bookmark className="w-3.5 h-3.5" /> Save Journey
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Train Detail Modal */}
      {detailModalTrain && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-card border border-[#E5E8ED] shadow-float max-w-lg w-full p-5 sm:p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E5E8ED] pb-3">
              <div>
                <h3 className="font-bold text-base text-[#171A21]">
                  {detailModalTrain.trainName} ({detailModalTrain.trainNumber})
                </h3>
                <span className="text-xs text-[#626B78]">{detailModalTrain.trainType}</span>
              </div>
              <button
                onClick={() => setDetailModalTrain(null)}
                className="text-[#626B78] hover:text-[#171A21] text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-[#F7F8FA] p-3 rounded-lg border border-[#E5E8ED]">
                <span className="text-[#626B78] block">Origin / Dep.</span>
                <span className="font-bold text-[#171A21]">{detailModalTrain.fromStationName}</span>
                <span className="font-mono text-[#2864E8] block mt-0.5">
                  {detailModalTrain.departureTime}
                </span>
              </div>
              <div className="bg-[#F7F8FA] p-3 rounded-lg border border-[#E5E8ED]">
                <span className="text-[#626B78] block">Destination / Arr.</span>
                <span className="font-bold text-[#171A21]">{detailModalTrain.toStationName}</span>
                <span className="font-mono text-[#2864E8] block mt-0.5">
                  {detailModalTrain.arrivalTime}
                </span>
              </div>
            </div>

            <div className="text-xs space-y-2">
              <h4 className="font-bold text-[#171A21]">Official Tariff & Available Classes:</h4>
              <div className="space-y-1.5">
                {detailModalTrain.classes.map((c) => (
                  <div
                    key={c.classType}
                    className="flex items-center justify-between p-2 rounded-lg bg-[#F7F8FA] border border-[#E5E8ED]"
                  >
                    <div>
                      <span className="font-bold text-[#171A21]">{c.className}</span>
                      <span className="text-[11px] text-[#626B78] block">{c.statusText}</span>
                    </div>
                    <span className="font-mono font-bold text-sm text-[#171A21]">₹{c.fare}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[#E5E8ED] flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/track/${detailModalTrain.trainNumber}`)}
              >
                Track Live Position
              </Button>
              <Button variant="primary" size="sm" onClick={() => setDetailModalTrain(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
