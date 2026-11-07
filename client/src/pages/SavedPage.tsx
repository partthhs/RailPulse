import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFavourites, useRecentSearches } from "@/store/journeyStore";
import { Bookmark, Clock, Trash2, ArrowRight, Train } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export const SavedPage: React.FC = () => {
  const navigate = useNavigate();
  const { favourites, toggle } = useFavourites();
  const { recents, clear: clearRecents } = useRecentSearches();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#171A21] tracking-tight">Saved & Recent Journeys</h1>
        <p className="text-sm text-[#626B78] mt-1">
          Quickly access your frequent routes, saved trains, and historical search queries
        </p>
      </div>

      {/* Favourites Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#171A21] flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-[#2864E8]" /> Favourite Trains ({favourites.length})
          </h2>
        </div>

        {favourites.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {favourites.map((fav) => (
              <Card
                key={fav.trainNumber}
                className="p-4 hover:border-[#2864E8]/50 hover:shadow-card-hover transition-all flex items-center justify-between"
              >
                <div
                  className="cursor-pointer flex-1"
                  onClick={() => navigate(`/track/${fav.trainNumber}`)}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-[#171A21]">{fav.trainNumber}</span>
                    <span className="font-semibold text-sm text-[#171A21]">{fav.trainName}</span>
                  </div>
                  <span className="text-xs text-[#626B78] mt-1 block">
                    {fav.sourceStation} → {fav.destinationStation}
                  </span>
                </div>

                <div className="flex items-center gap-2 pl-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      toggle({
                        trainNumber: fav.trainNumber,
                        trainName: fav.trainName,
                        sourceStation: fav.sourceStation,
                        destinationStation: fav.destinationStation,
                      })
                    }
                    title="Remove from favourites"
                    className="text-[#626B78] hover:text-[#C43D45]"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(`/track/${fav.trainNumber}`)}
                  >
                    Track <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center text-xs text-[#626B78]">
            No favourite trains saved yet. Click the bookmark icon on any train tracking page to save it.
          </Card>
        )}
      </section>

      {/* Recents Section */}
      <section className="space-y-3 pt-4 border-t border-[#E5E8ED]">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#171A21] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#626B78]" /> Recent Searches ({recents.length})
          </h2>
          {recents.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearRecents} className="text-xs text-[#C43D45]">
              Clear History
            </Button>
          )}
        </div>

        {recents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recents.map((item) => (
              <Card
                key={item.trainNumber}
                onClick={() => navigate(`/track/${item.trainNumber}`)}
                className="p-3.5 hover:border-[#2864E8]/40 hover:shadow-card cursor-pointer transition-all flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-[#171A21]">{item.trainNumber}</span>
                    <span className="font-semibold text-xs text-[#171A21]">{item.trainName}</span>
                  </div>
                  <span className="text-[11px] text-[#626B78]">
                    {item.sourceStation} → {item.destinationStation}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-[#626B78]" />
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-6 text-center text-xs text-[#626B78]">No recent searches found.</Card>
        )}
      </section>
    </div>
  );
};
