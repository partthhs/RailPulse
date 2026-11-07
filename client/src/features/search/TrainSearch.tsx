import React, { useState, useEffect, useRef } from "react";
import { Search, X, Train as TrainIcon, Clock, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { TrainSearchResult } from "@railpulse/types";
import { apiClient } from "@/services/apiClient";
import { useRecentSearches } from "@/store/journeyStore";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/utils/cn";

export interface TrainSearchProps {
  onSelectTrain: (trainNumber: string) => void;
  selectedTrainNumber?: string;
  autoFocus?: boolean;
}

const POPULAR_TRAINS = [
  { number: "12951", name: "Mumbai Rajdhani", route: "MMCT → NDLS" },
  { number: "22436", name: "Vande Bharat Exp", route: "NDLS → BSB" },
  { number: "12004", name: "Lucknow Shatabdi", route: "NDLS → LJN" },
  { number: "12301", name: "Howrah Rajdhani", route: "HWH → NDLS" },
];

export const TrainSearch: React.FC<TrainSearchProps> = ({
  onSelectTrain,
  selectedTrainNumber,
  autoFocus = false,
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TrainSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const { recents, add: addRecent } = useRecentSearches();

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search per PRD §3.1
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const data = await apiClient.searchTrains(query);
        setResults(data);
        setSelectedIndex(-1);
      } catch (err) {
        console.error("Search error", err);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to dismiss suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (item: { trainNumber: string; trainName: string; sourceStation: string; destinationStation: string }) => {
    addRecent({
      trainNumber: item.trainNumber,
      trainName: item.trainName,
      sourceStation: item.sourceStation,
      destinationStation: item.destinationStation,
    });
    setIsOpen(false);
    setQuery("");
    onSelectTrain(item.trainNumber);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      {/* Search Input Box */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#626B78] group-focus-within:text-[#2864E8] transition-colors">
          <Search className="w-4 h-4" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          autoFocus={autoFocus}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search by train name or number (e.g. 12951, Rajdhani, Vande Bharat)..."
          className="w-full pl-10 pr-10 py-3 bg-white text-sm font-medium text-[#171A21] placeholder-[#626B78]/70 border border-[#E5E8ED] rounded-xl shadow-subtle hover:border-[#C4C9D3] focus:border-[#2864E8] focus:ring-4 focus:ring-[#2864E8]/10 focus:outline-none transition-all"
        />

        {/* Clear or Loading Icon */}
        <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center">
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-[#2864E8] animate-spin" />
          ) : query ? (
            <button
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="text-[#626B78] hover:text-[#171A21] p-1 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Popular Trains Quick Picks */}
      <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
        <span className="text-[11px] font-semibold text-[#626B78] flex items-center gap-1 mr-1">
          <Sparkles className="w-3 h-3 text-[#2864E8]" /> Featured:
        </span>
        {POPULAR_TRAINS.map((t) => (
          <button
            key={t.number}
            onClick={() =>
              handleSelect({
                trainNumber: t.number,
                trainName: t.name,
                sourceStation: t.route.split("→")[0].trim(),
                destinationStation: t.route.split("→")[1].trim(),
              })
            }
            className={cn(
              "text-[11px] font-medium px-2.5 py-1 rounded-full border transition-all",
              selectedTrainNumber === t.number
                ? "bg-[#2864E8] text-white border-[#2864E8] shadow-xs"
                : "bg-white text-[#171A21] border-[#E5E8ED] hover:border-[#2864E8] hover:text-[#2864E8]"
            )}
          >
            <span className="font-mono font-bold mr-1">{t.number}</span>
            <span>{t.name}</span>
          </button>
        ))}
      </div>

      {/* Autocomplete Suggestions Dropdown */}
      {isOpen && (query.trim() || recents.length > 0) && (
        <div className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-xl border border-[#E5E8ED] shadow-float overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-96 overflow-y-auto">
          {query.trim() ? (
            results.length > 0 ? (
              <div className="p-1.5 space-y-1">
                <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#626B78]">
                  Matching Trains ({results.length})
                </div>
                {results.map((item, idx) => (
                  <button
                    key={item.trainNumber}
                    onClick={() => handleSelect(item)}
                    className={cn(
                      "w-full text-left px-3.5 py-2.5 rounded-lg flex items-center justify-between gap-3 transition-colors",
                      selectedIndex === idx ? "bg-[#2864E8]/10 text-[#2864E8]" : "hover:bg-[#F7F8FA]"
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-[#F7F8FA] flex items-center justify-center shrink-0 border border-[#E5E8ED]">
                        <TrainIcon className="w-4 h-4 text-[#2864E8]" />
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-[#171A21]">{item.trainNumber}</span>
                          <span className="font-semibold text-sm text-[#171A21] truncate">{item.trainName}</span>
                          <Badge variant="neutral" size="sm" className="hidden sm:inline-flex">
                            {item.trainType}
                          </Badge>
                        </div>
                        <div className="text-xs text-[#626B78] flex items-center gap-1.5 mt-0.5">
                          <span>{item.sourceStation}</span>
                          <ArrowRight className="w-3 h-3 text-[#626B78]/60" />
                          <span>{item.destinationStation}</span>
                          <span className="text-slate-300">•</span>
                          <span>{item.totalDuration}</span>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#626B78] shrink-0" />
                  </button>
                ))}
              </div>
            ) : (
              !isLoading && (
                <div className="p-6 text-center text-sm text-[#626B78]">
                  No trains found matching <span className="font-semibold text-[#171A21]">"{query}"</span>.
                </div>
              )
            )
          ) : (
            recents.length > 0 && (
              <div className="p-1.5 space-y-1">
                <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#626B78] flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Recent Searches
                </div>
                {recents.map((item) => (
                  <button
                    key={item.trainNumber}
                    onClick={() => handleSelect(item)}
                    className="w-full text-left px-3.5 py-2 rounded-lg flex items-center justify-between hover:bg-[#F7F8FA] transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Clock className="w-3.5 h-3.5 text-[#626B78]" />
                      <span className="font-mono font-bold text-xs text-[#171A21]">{item.trainNumber}</span>
                      <span className="text-xs text-[#171A21] font-medium">{item.trainName}</span>
                      <span className="text-[11px] text-[#626B78]">
                        ({item.sourceStation} → {item.destinationStation})
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};
