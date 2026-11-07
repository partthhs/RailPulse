import React from "react";
import { JourneyAnalytics } from "@railpulse/types";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Gauge, Clock, Navigation, Mountain, AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export interface AnalyticsDashboardProps {
  analytics: JourneyAnalytics;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ analytics }) => {
  return (
    <div className="space-y-6">
      {/* 4 Primary KPI Cards per PRD §3.3 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Completion */}
        <Card className="p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#626B78] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Completion</span>
            <Gauge className="w-4 h-4 text-[#2864E8]" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#171A21] font-mono">
              {analytics.completionPercentage}%
            </div>
            <div className="text-xs text-[#626B78] mt-1">
              {analytics.stationsPassedCount} of {analytics.stationsPassedCount + analytics.upcomingStationsCount} stops done
            </div>
          </div>
        </Card>

        {/* KPI 2: Delay */}
        <Card className="p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#626B78] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Current Delay</span>
            <Clock className="w-4 h-4 text-[#B7791F]" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#171A21] font-mono">
              {analytics.delayMinutes === 0 ? "0m" : `+${analytics.delayMinutes}m`}
            </div>
            <div className="text-xs text-[#626B78] mt-1">
              {analytics.delayMinutes <= 5 ? "Right on schedule" : "Operating with delay"}
            </div>
          </div>
        </Card>

        {/* KPI 3: Distance Covered */}
        <Card className="p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#626B78] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Distance Covered</span>
            <CheckCircle2 className="w-4 h-4 text-[#168653]" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#171A21] font-mono">
              {analytics.distanceCoveredKm} <span className="text-sm font-semibold text-[#626B78]">km</span>
            </div>
            <div className="text-xs text-[#626B78] mt-1">
              Out of {analytics.totalDistanceKm} km total route
            </div>
          </div>
        </Card>

        {/* KPI 4: Distance Remaining */}
        <Card className="p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#626B78] mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Remaining</span>
            <Navigation className="w-4 h-4 text-[#2864E8]" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#171A21] font-mono">
              {analytics.distanceRemainingKm} <span className="text-sm font-semibold text-[#626B78]">km</span>
            </div>
            <div className="text-xs text-[#626B78] mt-1">
              {analytics.upcomingStationsCount} stations ahead
            </div>
          </div>
        </Card>
      </div>

      {/* Delay Analysis Chart */}
      <Card className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-bold text-[#171A21]">Station Delay Profile (Minutes)</h3>
            <p className="text-xs text-[#626B78]">
              Reported vs scheduled variance across route stations
            </p>
          </div>
          <Badge variant="outline" size="sm" className="w-fit">
            Unit: Minutes
          </Badge>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={analytics.delayHistory}
              margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E8ED" />
              <XAxis
                dataKey="stationCode"
                tick={{ fontSize: 11, fill: "#626B78" }}
                interval={0}
                angle={-30}
                textAnchor="end"
              />
              <YAxis tick={{ fontSize: 11, fill: "#626B78" }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-2.5 rounded-lg border border-[#E5E8ED] shadow-card text-xs">
                        <span className="font-bold text-[#171A21] block">{data.stationName} ({data.stationCode})</span>
                        <span className="text-[#626B78] block">Delay: {data.delayMinutes} mins</span>
                        <span className="text-[#626B78] block">Distance: {data.distanceKm} km</span>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="delayMinutes" fill="#2864E8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Elevation Profile Chart */}
      <Card className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Mountain className="w-4 h-4 text-[#2864E8]" />
              <h3 className="text-base font-bold text-[#171A21]">Sampled Elevation Profile</h3>
            </div>
            <p className="text-xs text-[#626B78]">
              Topographical elevation changes across railway alignment (meters above sea level)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#171A21]">
              Max: {analytics.highestElevationMeters}m
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-semibold text-[#171A21]">
              Min: {analytics.lowestElevationMeters}m
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={analytics.elevationProfile}
              margin={{ top: 10, right: 10, left: -10, bottom: 20 }}
            >
              <defs>
                <linearGradient id="elevationGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2864E8" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#2864E8" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E8ED" />
              <XAxis
                dataKey="distanceKm"
                tick={{ fontSize: 11, fill: "#626B78" }}
                unit="km"
              />
              <YAxis tick={{ fontSize: 11, fill: "#626B78" }} unit="m" />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-2.5 rounded-lg border border-[#E5E8ED] shadow-card text-xs">
                        {data.stationName && (
                          <span className="font-bold text-[#171A21] block mb-0.5">{data.stationName}</span>
                        )}
                        <span className="text-[#2864E8] font-bold font-mono block">
                          Elevation: {data.elevationMeters} meters
                        </span>
                        <span className="text-[#626B78] block">Distance: {data.distanceKm} km</span>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="elevationMeters"
                stroke="#2864E8"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#elevationGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};
