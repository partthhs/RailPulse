import React, { useState } from "react";
import { TrainStatus } from "@railpulse/types";
import { Share2, Bookmark, RefreshCw, Check, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { RunningStatusBadge } from "./RunningStatusBadge";
import { useFavourites } from "@/store/journeyStore";
import { apiClient } from "@/services/apiClient";

export interface TrainHeaderProps {
  status: TrainStatus;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const TrainHeader: React.FC<TrainHeaderProps> = ({ status, onRefresh, isRefreshing }) => {
  const { toggle, isFav } = useFavourites();
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const isFavorite = isFav(status.trainNumber);

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const res = await apiClient.createShareLink(status.trainNumber);
      const url = `${window.location.origin}/share/${res.shareId}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to share", err);
    } finally {
      setIsSharing(false);
    }
  };

  const handleToggleFav = () => {
    toggle({
      trainNumber: status.trainNumber,
      trainName: status.trainName,
      sourceStation: status.sourceStation,
      destinationStation: status.destinationStation,
    });
  };

  const formattedUpdate = new Date(status.lastUpdated).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className="bg-white rounded-card border border-[#E5E8ED] p-4 sm:p-5 shadow-card transition-all">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Train Identity */}
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="font-mono text-xl sm:text-2xl font-extrabold text-[#171A21] tracking-tight">
              {status.trainNumber}
            </span>
            <h1 className="text-lg sm:text-xl font-bold text-[#171A21] tracking-tight">
              {status.trainName}
            </h1>
            <Badge variant="brand" size="sm">
              {status.trainType}
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-xs sm:text-sm text-[#626B78] font-medium mt-1">
            <span className="font-semibold text-[#171A21]">{status.sourceStation}</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#626B78]" />
            <span className="font-semibold text-[#171A21]">{status.destinationStation}</span>
            <span className="text-slate-300">•</span>
            <span>{status.totalDistanceKm} km</span>
          </div>
        </div>

        {/* Right: Status badge & Action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <RunningStatusBadge
            status={status.status}
            delayMinutes={status.delayMinutes}
            freshness={status.freshness}
          />

          <div className="flex items-center gap-1.5 ml-auto md:ml-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleFav}
              title={isFavorite ? "Remove from favourites" : "Save to favourites"}
              className={isFavorite ? "text-[#2864E8] border-[#2864E8]/40 bg-[#2864E8]/5" : ""}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isFavorite ? "fill-[#2864E8]" : ""}`} />
              <span className="hidden sm:inline">{isFavorite ? "Saved" : "Save"}</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              disabled={isSharing}
              title="Share live journey link"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#168653]" />
                  <span className="text-[#168653] font-semibold">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Share</span>
                </>
              )}
            </Button>

            {onRefresh && (
              <Button
                variant="outline"
                size="icon"
                onClick={onRefresh}
                disabled={isRefreshing}
                title="Refresh live running status"
                className="w-8 h-8"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#2864E8]" : ""}`} />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Timestamp footer indicator */}
      <div className="mt-3 pt-3 border-t border-[#E5E8ED]/80 flex items-center justify-between text-[11px] text-[#626B78]">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#168653]" />
          <span>Provider Telemetry Freshness:</span>
          <span className="font-semibold text-[#171A21]">{status.freshness}</span>
        </div>
        <div>
          Last updated: <span className="font-mono font-medium text-[#171A21]">{formattedUpdate}</span>
        </div>
      </div>
    </div>
  );
};
