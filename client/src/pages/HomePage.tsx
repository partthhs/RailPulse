import React from "react";
import { useNavigate } from "react-router-dom";
import { TrainSearch } from "@/features/search/TrainSearch";
import { useRecentSearches, useFavourites } from "@/store/journeyStore";
import { Train, Clock, Bookmark, ArrowRight, ShieldCheck, Compass, Sparkles, Map, Search, Calendar, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { recents, clear: clearRecents } = useRecentSearches();
  const { favourites } = useFavourites();

  const handleSelectTrain = (num: string) => {
    navigate(`/track/${num}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="brand" size="md" className="px-3 py-1">
          <Sparkles className="w-3.5 h-3.5" /> Next-Gen Indian Railway Intelligence
        </Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#171A21] tracking-tight leading-tight">
          Track Indian Trains With <span className="text-[#2864E8]">Interactive Map Intelligence</span>
        </h1>
        <p className="text-base sm:text-lg text-[#626B78] max-w-2xl mx-auto font-normal">
          Live positioning, route geography, delay analysis, and weather companion for trains across India.
        </p>

        {/* Big Search Bar */}
        <div className="pt-4">
          <TrainSearch onSelectTrain={handleSelectTrain} autoFocus />
        </div>

        {/* Quick Planner Capabilities */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 max-w-4xl mx-auto">
          <button
            onClick={() => navigate("/explore")}
            className="p-3.5 rounded-xl border border-[#E5E8ED] bg-white hover:border-[#2864E8]/50 hover:shadow-card transition-all text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#2864E8]/10 text-[#2864E8] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Search className="w-4 h-4" />
            </div>
            <span className="font-bold text-xs text-[#171A21] block">Explore Trains</span>
            <span className="text-[10px] text-[#626B78] block mt-0.5">Between any 2 stations</span>
          </button>

          <button
            onClick={() => navigate("/calendar")}
            className="p-3.5 rounded-xl border border-[#E5E8ED] bg-white hover:border-[#2864E8]/50 hover:shadow-card transition-all text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#168653]/10 text-[#168653] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Calendar className="w-4 h-4" />
            </div>
            <span className="font-bold text-xs text-[#171A21] block">Monthly Calendar</span>
            <span className="text-[10px] text-[#626B78] block mt-0.5">Daily fares & run days</span>
          </button>

          <button
            onClick={() => navigate("/compare-fares")}
            className="p-3.5 rounded-xl border border-[#E5E8ED] bg-white hover:border-[#2864E8]/50 hover:shadow-card transition-all text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#B7791F]/10 text-[#B7791F] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <TrendingDown className="w-4 h-4" />
            </div>
            <span className="font-bold text-xs text-[#171A21] block">Compare Fares</span>
            <span className="text-[10px] text-[#626B78] block mt-0.5">Best value algorithm</span>
          </button>

          <button
            onClick={() => navigate("/watchlist")}
            className="p-3.5 rounded-xl border border-[#E5E8ED] bg-white hover:border-[#2864E8]/50 hover:shadow-card transition-all text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
              <Bookmark className="w-4 h-4" />
            </div>
            <span className="font-bold text-xs text-[#171A21] block">My Watchlist</span>
            <span className="text-[10px] text-[#626B78] block mt-0.5">60-day booking alerts</span>
          </button>
        </div>
      </div>

      {/* Grid: Recent Searches & Favourites */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {/* Favourites Section */}
        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-[#2864E8]" />
              <h2 className="text-base font-bold text-[#171A21]">Saved Journeys</h2>
            </div>
            <span className="text-xs font-semibold text-[#626B78]">{favourites.length} saved</span>
          </div>

          {favourites.length > 0 ? (
            <div className="space-y-2.5">
              {favourites.map((fav) => (
                <div
                  key={fav.trainNumber}
                  onClick={() => handleSelectTrain(fav.trainNumber)}
                  className="flex items-center justify-between p-3 rounded-xl border border-[#E5E8ED] bg-[#F7F8FA]/60 hover:bg-white hover:border-[#2864E8]/40 hover:shadow-card transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#2864E8]/10 text-[#2864E8] flex items-center justify-center font-mono font-bold text-xs">
                      {fav.trainNumber.slice(0, 3)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-[#171A21]">{fav.trainNumber}</span>
                        <span className="text-xs font-bold text-[#171A21]">{fav.trainName}</span>
                      </div>
                      <span className="text-[11px] text-[#626B78]">
                        {fav.sourceStation} → {fav.destinationStation}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#626B78] group-hover:text-[#2864E8] group-hover:translate-x-0.5 transition-all" />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-[#626B78] border border-dashed border-[#E5E8ED] rounded-xl">
              Save frequent journeys while tracking to quickly access them here.
            </div>
          )}
        </Card>

        {/* Recent Searches Section */}
        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#626B78]" />
              <h2 className="text-base font-bold text-[#171A21]">Recent Searches</h2>
            </div>
            {recents.length > 0 && (
              <button
                onClick={clearRecents}
                className="text-xs text-[#626B78] hover:text-[#C43D45] transition-colors"
              >
                Clear All
              </button>
            )}
          </div>

          {recents.length > 0 ? (
            <div className="space-y-2.5">
              {recents.map((item) => (
                <div
                  key={item.trainNumber}
                  onClick={() => handleSelectTrain(item.trainNumber)}
                  className="flex items-center justify-between p-3 rounded-xl border border-[#E5E8ED] bg-[#F7F8FA]/60 hover:bg-white hover:border-[#2864E8]/40 hover:shadow-card transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-[#E5E8ED] text-[#171A21] flex items-center justify-center font-mono font-bold text-xs">
                      {item.trainNumber}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#171A21] block">{item.trainName}</span>
                      <span className="text-[11px] text-[#626B78]">
                        {item.sourceStation} → {item.destinationStation}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#626B78] group-hover:text-[#2864E8] group-hover:translate-x-0.5 transition-all" />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-[#626B78] border border-dashed border-[#E5E8ED] rounded-xl">
              Your recent journeys will appear here.
            </div>
          )}
        </Card>
      </div>

      {/* Feature Value Props */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-4">
        <div className="p-5 rounded-card bg-white border border-[#E5E8ED] shadow-sm flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-[#2864E8]/10 text-[#2864E8]">
            <Map className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#171A21]">Dual Route Visualization</h3>
            <p className="text-xs text-[#626B78] mt-1 leading-relaxed">
              Real-time differentiation between completed distance and upcoming route paths.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-card bg-white border border-[#E5E8ED] shadow-sm flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-[#168653]/10 text-[#168653]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#171A21]">Data Freshness First</h3>
            <p className="text-xs text-[#626B78] mt-1 leading-relaxed">
              Every status is timestamped with provider freshness status to ensure trustworthy updates.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-card bg-white border border-[#E5E8ED] shadow-sm flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-[#B7791F]/10 text-[#B7791F]">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#171A21]">Smart Travel Companion</h3>
            <p className="text-xs text-[#626B78] mt-1 leading-relaxed">
              Weather cards and spatial terrain markers (rivers, mountains, bridges) along the tracks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
