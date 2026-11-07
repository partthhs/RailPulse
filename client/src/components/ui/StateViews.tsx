import React from "react";
import { AlertCircle, Search, RefreshCw } from "lucide-react";
import { Button } from "./Button";

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No trains found",
  description = "Search for a train to start tracking your journey.",
  icon,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-card border border-[#E5E8ED] shadow-sm my-4">
      <div className="w-12 h-12 rounded-full bg-[#F7F8FA] flex items-center justify-center text-[#626B78] mb-3">
        {icon || <Search className="w-5 h-5" />}
      </div>
      <h3 className="text-base font-semibold text-[#171A21] mb-1">{title}</h3>
      <p className="text-sm text-[#626B78] max-w-sm mb-4">{description}</p>
      {action}
    </div>
  );
};

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Unable to fetch live status",
  description = "We couldn't retrieve the latest train information. Showing the last available update, if any.",
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-card border border-[#E5E8ED] shadow-sm my-4">
      <div className="w-12 h-12 rounded-full bg-[#C43D45]/10 flex items-center justify-center text-[#C43D45] mb-3">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-[#171A21] mb-1">{title}</h3>
      <p className="text-sm text-[#626B78] max-w-sm mb-4">{description}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="gap-2">
          <RefreshCw className="w-3.5 h-3.5" /> Retry
        </Button>
      )}
    </div>
  );
};
