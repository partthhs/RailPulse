import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { WatchedTrain } from "@railpulse/types";
import { apiClient } from "@/services/apiClient";
import {
  Bookmark,
  Calendar,
  Clock,
  Trash2,
  Bell,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Plus,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/StateViews";

export const WatchlistPage: React.FC = () => {
  const navigate = useNavigate();
  const [watchlist, setWatchlist] = useState<WatchedTrain[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWatchlist = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.getWatchlist();
      setWatchlist(data);
    } catch (err) {
      console.error("Failed to load watchlist", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const handleRemove = async (id: string) => {
    try {
      await apiClient.removeFromWatchlist(id);
      setWatchlist((prev) => prev.filter((w) => w.id !== id));
    } catch (err) {
      console.error("Failed to remove", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="brand" size="md">
              <Bookmark className="w-3.5 h-3.5" /> Personal Journey Tracker
            </Badge>
            <span className="text-xs text-[#626B78] font-medium">60-Day Advance Booking Alert</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171A21] tracking-tight mt-1.5">
            My Train Watchlist
          </h1>
          <p className="text-xs sm:text-sm text-[#626B78] mt-1">
            Monitor upcoming journeys, boarding station alerts, and 60-day reservation opening countdowns.
          </p>
        </div>

        <Button
          onClick={() => navigate("/explore")}
          className="gap-2 text-xs font-bold"
        >
          <Plus className="w-3.5 h-3.5" /> Explore & Add Journey
        </Button>
      </div>

      {/* Watchlist Cards */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-36 w-full rounded-card" />
          <Skeleton className="h-36 w-full rounded-card" />
        </div>
      ) : watchlist.length > 0 ? (
        <div className="space-y-4">
          {watchlist.map((item) => (
            <Card
              key={item.id}
              className="p-5 sm:p-6 shadow-card hover:border-[#2864E8]/40 transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Train Info */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-base sm:text-lg text-[#171A21]">
                      {item.trainNumber}
                    </span>
                    <h3 className="font-bold text-base text-[#171A21]">{item.trainName}</h3>
                    <Badge variant={item.bookingStatus === "OPEN" ? "success" : "neutral"} size="sm">
                      {item.bookingStatus === "OPEN" ? "Booking Open" : "Upcoming Booking"}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-[#626B78] flex-wrap mt-1">
                    <span className="font-semibold text-[#171A21]">{item.boardingStation}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#626B78]" />
                    <span className="font-semibold text-[#171A21]">{item.destinationStation}</span>
                    <span className="text-slate-300">•</span>
                    <span className="flex items-center gap-1 font-medium text-[#171A21]">
                      <Calendar className="w-3.5 h-3.5 text-[#2864E8]" /> Journey Date: {item.journeyDate}
                    </span>
                  </div>
                </div>

                {/* 60-Day ARP Status Badge */}
                {item.reservationOpeningDate && (
                  <div className="bg-[#F7F8FA] p-3 rounded-xl border border-[#E5E8ED] text-xs">
                    <div className="flex items-center gap-1.5 text-[11px] text-[#626B78]">
                      <Clock className="w-3.5 h-3.5 text-[#2864E8]" />
                      <span>60-Day Reservation Opening Date:</span>
                    </div>
                    <span className="font-bold text-[#171A21] block mt-0.5 font-mono">
                      {item.reservationOpeningDate} at 08:00 AM IST
                    </span>
                  </div>
                )}
              </div>

              {/* Notification Toggles Summary */}
              <div className="mt-4 pt-3 border-t border-[#E5E8ED] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 text-[11px] text-[#626B78] flex-wrap">
                  <span className="font-semibold text-[#171A21] flex items-center gap-1">
                    <Bell className="w-3 h-3 text-[#2864E8]" /> Active Alerts:
                  </span>
                  {item.notifyApproaching && (
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium">
                      Approaching (30m)
                    </span>
                  )}
                  {item.notifyBookingOpening && (
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">
                      Booking Opening
                    </span>
                  )}
                  {item.notifyDelay && (
                    <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-medium">
                      Delays
                    </span>
                  )}
                  {item.notifyPlatform && (
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                      Platform Updates
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-auto">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemove(item.id)}
                    className="text-[#626B78] hover:text-[#C43D45]"
                    title="Remove from watchlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate(`/track/${item.trainNumber}`)}
                    className="text-xs font-bold gap-1"
                  >
                    Track Live <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Watchlist is empty"
          description="You haven't saved any journeys yet. Explore trains and click 'Add to Watchlist' to receive booking reminders and approaching alerts."
          action={
            <Button onClick={() => navigate("/explore")} size="sm" className="mt-2 text-xs font-bold">
              Explore Trains Now
            </Button>
          }
        />
      )}
    </div>
  );
};
