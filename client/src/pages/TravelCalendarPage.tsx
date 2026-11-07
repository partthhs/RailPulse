import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  StationOption,
  CalendarDaySummary,
  TravelClass,
  BetweenTrainResult,
} from "@railpulse/types";
import { apiClient } from "@/services/apiClient";
import { StationSelect } from "@/features/planner/StationSelect";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  Clock,
  Sparkles,
  Info,
  Train,
  ArrowRight,
  Bookmark,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/utils/cn";

const TRAVEL_CLASSES: { id: TravelClass; label: string }[] = [
  { id: "3A", label: "Third AC (3A)" },
  { id: "2A", label: "Second AC (2A)" },
  { id: "1A", label: "First AC (1A)" },
  { id: "SL", label: "Sleeper (SL)" },
  { id: "CC", label: "AC Chair Car (CC)" },
];

export const TravelCalendarPage: React.FC = () => {
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

  const now = new Date();
  const [currentYear, setCurrentYear] = useState<number>(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(now.getMonth() + 1); // 1-12
  const [selectedClass, setSelectedClass] = useState<TravelClass>(
    (searchParams.get("class") as TravelClass) || "3A"
  );

  const [calendarDays, setCalendarDays] = useState<CalendarDaySummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDayTrains, setSelectedDayTrains] = useState<{
    date: string;
    trains: BetweenTrainResult[];
  } | null>(null);
  const [isDayLoading, setIsDayLoading] = useState(false);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const fetchCalendar = async () => {
    if (!fromStation || !toStation) return;
    setIsLoading(true);
    setSelectedDayTrains(null);

    try {
      const res = await apiClient.getMonthlyCalendar({
        from: fromStation.code,
        to: toStation.code,
        year: currentYear,
        month: currentMonth,
        class: selectedClass,
      });
      setCalendarDays(res.days);
    } catch (err) {
      console.error("Failed to load monthly calendar", err);
      setCalendarDays([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendar();
  }, [fromStation, toStation, currentYear, currentMonth, selectedClass]);

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleDayClick = async (day: CalendarDaySummary) => {
    if (day.isPast || day.trainCount === 0 || !fromStation || !toStation) return;
    setIsDayLoading(true);

    try {
      const trains = await apiClient.getTrainsBetween({
        from: fromStation.code,
        to: toStation.code,
        date: day.date,
        class: selectedClass,
      });
      setSelectedDayTrains({
        date: day.date,
        trains: trains.filter((t) => t.runsToday),
      });
    } catch (err) {
      console.error("Failed to load day trains", err);
    } finally {
      setIsDayLoading(false);
    }
  };

  // Determine starting day offset of week (0=Sun, 1=Mon, ..., 6=Sat)
  const firstDayOfWeek = new Date(currentYear, currentMonth - 1, 1).getDay();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="brand" size="md">
              <CalendarDays className="w-3.5 h-3.5" /> Monthly Travel Explorer
            </Badge>
            <span className="text-xs text-[#626B78] font-medium">Actual Running Days & Tariff</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171A21] tracking-tight mt-1.5">
            Monthly Train & Fare Calendar
          </h1>
          <p className="text-xs sm:text-sm text-[#626B78] mt-1">
            Discover which days trains operate and compare lowest available fares across the entire month.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-[#E5E8ED] text-xs shadow-xs flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#168653]" />
            <span className="text-[#171A21] font-medium">Lower Fare</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#B7791F]" />
            <span className="text-[#171A21] font-medium">Moderate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#C43D45]" />
            <span className="text-[#171A21] font-medium">Peak Fare</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#8A94A6]" />
            <span className="text-[#626B78]">No Trains / Past</span>
          </div>
        </div>
      </div>

      {/* Control Bar: Stations, Class, Month */}
      <Card className="p-4 sm:p-5 shadow-card">
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
              Travel Class
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value as TravelClass)}
              className="w-full py-2.5 px-3 bg-white text-xs font-semibold text-[#171A21] border border-[#E5E8ED] rounded-xl focus:border-[#2864E8] focus:outline-none"
            >
              {TRAVEL_CLASSES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2 flex items-center justify-between gap-1 pb-0.5">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevMonth}
              title="Previous Month"
              className="h-10 w-10 shrink-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-xs font-bold text-[#171A21] text-center font-mono">
              {monthNames[currentMonth - 1]} {currentYear}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextMonth}
              title="Next Month"
              className="h-10 w-10 shrink-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Monthly Calendar Grid */}
      <Card className="p-4 sm:p-6 shadow-card overflow-hidden">
        {/* Day of Week Header */}
        <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-[#626B78] uppercase tracking-wider pb-2 border-b border-[#E5E8ED]">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Cells */}
        {isLoading ? (
          <div className="grid grid-cols-7 gap-2 h-96">
            {Array.from({ length: 35 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-2 sm:gap-2.5">
            {/* Empty padding cells for start of month */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="h-20 sm:h-24 rounded-xl bg-transparent" />
            ))}

            {/* Active Date Cells */}
            {calendarDays.map((day) => {
              const indicatorBg = {
                green: "border-[#168653]/30 bg-[#168653]/5 hover:bg-[#168653]/10",
                yellow: "border-[#B7791F]/30 bg-[#B7791F]/5 hover:bg-[#B7791F]/10",
                red: "border-[#C43D45]/30 bg-[#C43D45]/5 hover:bg-[#C43D45]/10",
                grey: "border-[#E5E8ED] bg-[#F7F8FA]/60 opacity-60 cursor-not-allowed",
              }[day.indicator];

              const dotColor = {
                green: "bg-[#168653]",
                yellow: "bg-[#B7791F]",
                red: "bg-[#C43D45]",
                grey: "bg-[#8A94A6]",
              }[day.indicator];

              return (
                <div
                  key={day.date}
                  onClick={() => handleDayClick(day)}
                  className={cn(
                    "h-20 sm:h-24 p-2 sm:p-2.5 rounded-xl border flex flex-col justify-between transition-all select-none",
                    indicatorBg,
                    !day.isPast && day.trainCount > 0 && "cursor-pointer hover:shadow-card hover:scale-[1.02]"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs sm:text-sm text-[#171A21] font-mono">
                      {day.dayNumber}
                    </span>
                    <span className={cn("w-2 h-2 rounded-full shrink-0", dotColor)} />
                  </div>

                  <div>
                    {day.trainCount > 0 ? (
                      <div>
                        <span className="text-[10px] text-[#626B78] font-semibold block leading-tight">
                          {day.trainCount} {day.trainCount === 1 ? "Train" : "Trains"}
                        </span>
                        {day.lowestFare && (
                          <span className="font-mono font-bold text-xs sm:text-sm text-[#171A21] block mt-0.5">
                            ₹{day.lowestFare}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[10px] text-[#8A94A6] italic">No service</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Selected Day Train Drawer / Modal */}
      {selectedDayTrains && (
        <Card className="p-5 sm:p-6 shadow-card border-[#2864E8]/40 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E8ED] mb-4">
            <div>
              <span className="text-xs font-semibold text-[#2864E8]">Operating Schedule for</span>
              <h3 className="font-bold text-lg text-[#171A21]">
                {selectedDayTrains.date} • {selectedDayTrains.trains.length} Trains Available
              </h3>
            </div>
            <button
              onClick={() => setSelectedDayTrains(null)}
              className="text-[#626B78] hover:text-[#171A21] text-xs font-bold p-1"
            >
              ✕ Close
            </button>
          </div>

          <div className="space-y-3">
            {selectedDayTrains.trains.map((train) => {
              const cls = train.classes.find((c) => c.classType === selectedClass);
              return (
                <div
                  key={train.trainNumber}
                  className="p-4 rounded-xl border border-[#E5E8ED] bg-[#F7F8FA]/60 hover:bg-white transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-[#171A21]">
                        {train.trainNumber}
                      </span>
                      <span className="font-bold text-sm text-[#171A21]">{train.trainName}</span>
                      <Badge variant="brand" size="sm">
                        {train.trainType}
                      </Badge>
                    </div>
                    <div className="text-xs text-[#626B78] flex items-center gap-2 mt-1">
                      <span>Dep: {train.departureTime}</span>
                      <span>•</span>
                      <span>Arr: {train.arrivalTime}</span>
                      <span>•</span>
                      <span>{train.durationFormatted}</span>
                      <span>•</span>
                      <span>{train.haltsCount} stops</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {cls && (
                      <div className="text-right">
                        <span className="text-[10px] text-[#626B78] block">{cls.className}</span>
                        <span className="font-mono font-extrabold text-base text-[#171A21]">
                          ₹{cls.fare}
                        </span>
                      </div>
                    )}

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate(`/track/${train.trainNumber}`)}
                      className="text-xs font-bold"
                    >
                      Track Train
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};
