import React from "react";
import { CheckCircle2, Clock, AlertTriangle, HelpCircle } from "lucide-react";
import { RunningStatusType, FreshnessType } from "@railpulse/types";
import { Badge } from "@/components/ui/Badge";

export interface RunningStatusBadgeProps {
  status: RunningStatusType;
  delayMinutes: number;
  freshness?: FreshnessType;
  className?: string;
}

export const RunningStatusBadge: React.FC<RunningStatusBadgeProps> = ({
  status,
  delayMinutes,
  freshness = "FRESH",
  className,
}) => {
  if (freshness === "STALE" || status === "DATA_DELAYED") {
    return (
      <Badge variant="neutral" dot className={className}>
        <Clock className="w-3.5 h-3.5 text-[#626B78]" />
        <span>Data Delayed (Cached)</span>
      </Badge>
    );
  }

  if (status === "UNAVAILABLE") {
    return (
      <Badge variant="neutral" dot className={className}>
        <HelpCircle className="w-3.5 h-3.5 text-[#626B78]" />
        <span>Status Unavailable</span>
      </Badge>
    );
  }

  if (delayMinutes <= 5) {
    return (
      <Badge variant="success" dot className={className}>
        <CheckCircle2 className="w-3.5 h-3.5 text-[#168653]" />
        <span>Right Time / On Time</span>
      </Badge>
    );
  }

  if (delayMinutes <= 30) {
    return (
      <Badge variant="warning" dot className={className}>
        <Clock className="w-3.5 h-3.5 text-[#B7791F]" />
        <span>Delayed by {delayMinutes}m</span>
      </Badge>
    );
  }

  return (
    <Badge variant="danger" dot className={className}>
      <AlertTriangle className="w-3.5 h-3.5 text-[#C43D45]" />
      <span>Delayed by {Math.floor(delayMinutes / 60)}h {delayMinutes % 60}m</span>
    </Badge>
  );
};
