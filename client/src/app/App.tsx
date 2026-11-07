import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { AppRoutes } from "./routes";

export const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FA] text-[#171A21]">
      <Navbar />

      <main className="flex-1 pb-16">
        <AppRoutes />
      </main>

      <footer className="border-t border-[#E5E8ED] bg-white py-6 text-xs text-[#626B78]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#171A21]">RailPulse</span>
            <span className="text-slate-300">•</span>
            <span>Intelligent Railway Tracking & Travel Companion</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Apple Maps × Linear × Stripe Design System</span>
            <span className="text-slate-300">•</span>
            <span className="text-[#168653] font-semibold">MapLibre GL & RailRadar Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
