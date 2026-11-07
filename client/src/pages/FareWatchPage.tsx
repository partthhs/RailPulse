import React, { useState, useEffect } from "react";
import { FareAlert, TravelClass, StationOption } from "@railpulse/types";
import { apiClient } from "@/services/apiClient";
import { StationSelect } from "@/features/planner/StationSelect";
import {
  TrendingDown,
  Bell,
  Trash2,
  CheckCircle2,
  Clock,
  ArrowRight,
  AlertCircle,
  Plus,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/StateViews";

const TRAVEL_CLASSES: { id: TravelClass; label: string }[] = [
  { id: "3A", label: "Third AC (3A)" },
  { id: "2A", label: "Second AC (2A)" },
  { id: "1A", label: "First AC (1A)" },
  { id: "SL", label: "Sleeper (SL)" },
  { id: "CC", label: "AC Chair Car (CC)" },
];

export const FareWatchPage: React.FC = () => {
  const [alerts, setAlerts] = useState<FareAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New alert form
  const [trainNumber, setTrainNumber] = useState("12951");
  const [trainName, setTrainName] = useState("Mumbai Rajdhani Express");
  const [fromStation, setFromStation] = useState<StationOption | null>({
    code: "MMCT",
    name: "Mumbai Central",
  });
  const [toStation, setToStation] = useState<StationOption | null>({
    code: "NDLS",
    name: "New Delhi",
  });
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const [journeyDate, setJourneyDate] = useState(tomorrow);
  const [travelClass, setTravelClass] = useState<TravelClass>("3A");
  const [targetFare, setTargetFare] = useState("1400");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchAlerts = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.getFareAlerts();
      setAlerts(data);
    } catch (err) {
      console.error("Failed to load fare alerts", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainNumber || !journeyDate || !targetFare || !fromStation || !toStation) return;

    setIsSubmitting(true);
    try {
      await apiClient.addFareAlert({
        trainNumber,
        trainName,
        sourceStation: fromStation.name,
        destinationStation: toStation.name,
        journeyDate,
        travelClass,
        targetFare: Number(targetFare),
        currentFare: Number(targetFare) + 210, // Initial baseline
      });
      setShowAddForm(false);
      fetchAlerts();
    } catch (err) {
      console.error("Failed to create alert", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await apiClient.removeFareAlert(id);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error("Failed to remove alert", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="brand" size="md">
              <TrendingDown className="w-3.5 h-3.5" /> Fare Watch Monitor
            </Badge>
            <span className="text-xs text-[#626B78] font-medium">Automatic Price Alerts</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171A21] tracking-tight mt-1.5">
            Fare Watch
          </h1>
          <p className="text-xs sm:text-sm text-[#626B78] mt-1">
            Set target fares for upcoming journeys. We monitor price fluctuations and notify you when your target is reached.
          </p>
        </div>

        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="gap-2 text-xs font-bold"
        >
          <Plus className="w-3.5 h-3.5" /> {showAddForm ? "Close Form" : "Create Fare Alert"}
        </Button>
      </div>

      {/* Create Alert Form Drawer */}
      {showAddForm && (
        <Card className="p-5 sm:p-6 shadow-card border-[#2864E8]/40 animate-in fade-in duration-150">
          <form onSubmit={handleCreateAlert} className="space-y-4">
            <h3 className="font-bold text-base text-[#171A21]">Configure New Fare Alert</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-[#626B78] mb-1">Train Number</label>
                <input
                  type="text"
                  value={trainNumber}
                  onChange={(e) => setTrainNumber(e.target.value)}
                  placeholder="e.g. 12951"
                  className="w-full py-2 px-3 bg-white border border-[#E5E8ED] rounded-xl text-xs font-mono font-bold text-[#171A21] focus:border-[#2864E8] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#626B78] mb-1">Train Name</label>
                <input
                  type="text"
                  value={trainName}
                  onChange={(e) => setTrainName(e.target.value)}
                  placeholder="Train Name"
                  className="w-full py-2 px-3 bg-white border border-[#E5E8ED] rounded-xl text-xs font-medium text-[#171A21] focus:border-[#2864E8] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#626B78] mb-1">Journey Date</label>
                <input
                  type="date"
                  min={new Date().toISOString().slice(0, 10)}
                  value={journeyDate}
                  onChange={(e) => setJourneyDate(e.target.value)}
                  className="w-full py-2 px-3 bg-white border border-[#E5E8ED] rounded-xl text-xs font-medium text-[#171A21] focus:border-[#2864E8] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-[#626B78] mb-1">Travel Class</label>
                <select
                  value={travelClass}
                  onChange={(e) => setTravelClass(e.target.value as TravelClass)}
                  className="w-full py-2 px-3 bg-white border border-[#E5E8ED] rounded-xl text-xs font-semibold text-[#171A21] focus:border-[#2864E8] focus:outline-none"
                >
                  {TRAVEL_CLASSES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <StationSelect label="From Station" value={fromStation} onChange={setFromStation} />
              </div>

              <div className="sm:col-span-2">
                <StationSelect label="To Station" value={toStation} onChange={setToStation} />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-[#626B78] mb-1">Target Fare (₹)</label>
                <input
                  type="number"
                  min={100}
                  step={10}
                  value={targetFare}
                  onChange={(e) => setTargetFare(e.target.value)}
                  placeholder="Enter target fare in INR"
                  className="w-full py-2 px-3 bg-white border border-[#E5E8ED] rounded-xl text-sm font-mono font-bold text-[#171A21] focus:border-[#2864E8] focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting} className="font-bold">
                Start Monitoring Fare
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Active Alerts Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-44 rounded-card" />
          <Skeleton className="h-44 rounded-card" />
        </div>
      ) : alerts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alerts.map((alert) => {
            const isTargetReached = alert.currentFare <= alert.targetFare;

            return (
              <Card
                key={alert.id}
                className="p-5 shadow-card hover:border-[#2864E8]/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-[#171A21]">
                        {alert.trainNumber}
                      </span>
                      <h3 className="font-bold text-sm text-[#171A21]">{alert.trainName}</h3>
                    </div>
                    <Badge variant={isTargetReached ? "success" : "neutral"} size="sm" dot>
                      {isTargetReached ? "Target Reached" : "Active Monitoring"}
                    </Badge>
                  </div>

                  <div className="text-xs text-[#626B78] flex items-center gap-2 mb-3">
                    <span>{alert.sourceStation}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#626B78]" />
                    <span>{alert.destinationStation}</span>
                    <span className="text-slate-300">•</span>
                    <span>{alert.journeyDate}</span>
                    <span className="text-slate-300">•</span>
                    <span className="font-semibold text-[#171A21]">{alert.travelClass}</span>
                  </div>

                  {/* Fare Comparison Boxes */}
                  <div className="grid grid-cols-3 gap-2 bg-[#F7F8FA] p-3 rounded-xl border border-[#E5E8ED] text-xs">
                    <div>
                      <span className="text-[10px] text-[#626B78] block">Previous Fare</span>
                      <span className="font-mono font-semibold text-[#626B78] text-sm">
                        ₹{alert.previousFare}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-[#626B78] block">Latest Fare</span>
                      <span className="font-mono font-bold text-sm text-[#171A21]">
                        ₹{alert.currentFare}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-[#626B78] block">Target Fare</span>
                      <span className="font-mono font-extrabold text-sm text-[#2864E8]">
                        ₹{alert.targetFare}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-4 pt-3 border-t border-[#E5E8ED] flex items-center justify-between text-[11px] text-[#626B78]">
                  <span>Last checked: {new Date(alert.lastCheckedAt).toLocaleDateString()}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(alert.id)}
                    className="text-[#626B78] hover:text-[#C43D45] text-xs h-7"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No active fare alerts"
          description="Create a fare alert to track ticket price drops for your preferred trains and travel dates."
          action={
            <Button onClick={() => setShowAddForm(true)} size="sm" className="mt-2 text-xs font-bold">
              Set Up Your First Fare Alert
            </Button>
          }
        />
      )}
    </div>
  );
};
