import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { HomePage } from "@/pages/HomePage";
import { TrackingPage } from "@/pages/TrackingPage";
import { AnalyticsPage } from "@/pages/AnalyticsPage";
import { CompanionPage } from "@/pages/CompanionPage";
import { SavedPage } from "@/pages/SavedPage";
import { SharedPage } from "@/pages/SharedPage";
import { ExploreTrainsPage } from "@/pages/ExploreTrainsPage";
import { TravelCalendarPage } from "@/pages/TravelCalendarPage";
import { FareComparisonPage } from "@/pages/FareComparisonPage";
import { WatchlistPage } from "@/pages/WatchlistPage";
import { FareWatchPage } from "@/pages/FareWatchPage";

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/track/:trainNumber" element={<TrackingPage />} />
      <Route path="/explore" element={<ExploreTrainsPage />} />
      <Route path="/calendar" element={<TravelCalendarPage />} />
      <Route path="/compare-fares" element={<FareComparisonPage />} />
      <Route path="/watchlist" element={<WatchlistPage />} />
      <Route path="/fare-watch" element={<FareWatchPage />} />
      <Route path="/analytics" element={<AnalyticsPage />} />
      <Route path="/companion" element={<CompanionPage />} />
      <Route path="/saved" element={<SavedPage />} />
      <Route path="/share/:token" element={<SharedPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
