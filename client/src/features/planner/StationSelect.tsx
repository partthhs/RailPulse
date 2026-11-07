import React, { useState, useEffect, useRef } from "react";
import { StationOption } from "@railpulse/types";
import { apiClient } from "@/services/apiClient";
import { MapPin, Search, X, Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

export interface StationSelectProps {
  label: string;
  value: StationOption | null;
  onChange: (station: StationOption | null) => void;
  placeholder?: string;
  excludeCode?: string;
  className?: string;
}

export const StationSelect: React.FC<StationSelectProps> = ({
  label,
  value,
  onChange,
  placeholder = "Search station or code...",
  excludeCode,
  className,
}) => {
  const [query, setQuery] = useState(value ? `${value.name} (${value.code})` : "");
  const [options, setOptions] = useState<StationOption[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      setQuery(`${value.name} (${value.code})`);
    } else {
      setQuery("");
    }
  }, [value]);

  useEffect(() => {
    if (!isOpen) return;

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const clean = query.replace(/\([A-Z0-9]+\)/, "").trim();
        const results = await apiClient.searchPlannerStations(clean);
        const filtered = excludeCode
          ? results.filter((s) => s.code.toUpperCase() !== excludeCode.toUpperCase())
          : results;
        setOptions(filtered);
      } catch (err) {
        console.error("Failed to load stations", err);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, isOpen, excludeCode]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        if (value) {
          setQuery(`${value.name} (${value.code})`);
        } else {
          setQuery("");
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value]);

  const handleSelect = (st: StationOption) => {
    onChange(st);
    setQuery(`${st.name} (${st.code})`);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange(null);
    setQuery("");
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <label className="block text-xs font-semibold text-[#626B78] uppercase tracking-wider mb-1.5">
        {label}
      </label>

      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#626B78] group-focus-within:text-[#2864E8] transition-colors">
          <MapPin className="w-4 h-4" />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-9 py-2.5 bg-white text-sm font-medium text-[#171A21] placeholder-[#626B78]/70 border border-[#E5E8ED] rounded-xl shadow-subtle hover:border-[#C4C9D3] focus:border-[#2864E8] focus:ring-4 focus:ring-[#2864E8]/10 focus:outline-none transition-all"
        />

        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 text-[#2864E8] animate-spin" />
          ) : query ? (
            <button
              type="button"
              onClick={handleClear}
              className="text-[#626B78] hover:text-[#171A21] p-1 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-xl border border-[#E5E8ED] shadow-float overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-64 overflow-y-auto">
          {options.length > 0 ? (
            <div className="p-1 space-y-0.5">
              {options.map((st) => (
                <button
                  key={st.code}
                  type="button"
                  onClick={() => handleSelect(st)}
                  className="w-full text-left px-3 py-2 rounded-lg flex items-center justify-between hover:bg-[#F7F8FA] transition-colors text-xs"
                >
                  <div className="truncate">
                    <span className="font-bold text-[#171A21] mr-2">{st.name}</span>
                    {st.city && <span className="text-[#626B78] mr-2">• {st.city}</span>}
                  </div>
                  <span className="font-mono font-bold px-2 py-0.5 rounded bg-[#2864E8]/10 text-[#2864E8] shrink-0">
                    {st.code}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-[#626B78]">
              {isLoading ? "Searching stations..." : "No stations found."}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
