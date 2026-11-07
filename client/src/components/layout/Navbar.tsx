import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Train,
  BarChart3,
  Compass,
  Bookmark,
  Activity,
  Search,
  CalendarDays,
  TrendingDown,
  Bell,
  SlidersHorizontal,
} from "lucide-react";
import { NotificationCenter } from "@/features/notifications/NotificationCenter";
import { cn } from "@/utils/cn";

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [istTime, setIstTime] = React.useState<string>(() => {
    return new Date().toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  });

  React.useEffect(() => {
    const timer = setInterval(() => {
      setIstTime(
        new Date().toLocaleTimeString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const primaryNavLinks = [
    { to: "/", label: "Track", icon: Train },
    { to: "/explore", label: "Explore", icon: Search },
    { to: "/calendar", label: "Calendar", icon: CalendarDays },
    { to: "/compare-fares", label: "Compare Fares", icon: TrendingDown },
    { to: "/watchlist", label: "Watchlist", icon: Bookmark },
    { to: "/fare-watch", label: "Fare Watch", icon: SlidersHorizontal },
    { to: "/analytics", label: "Analytics", icon: BarChart3 },
    { to: "/companion", label: "Companion", icon: Compass },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#E5E8ED] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-9 h-9 rounded-xl bg-[#2864E8] flex items-center justify-center text-white shadow-sm shadow-[#2864E8]/30 group-hover:scale-105 transition-transform">
            <Activity className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-[#171A21]">RailPulse</span>
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-[#2864E8]/10 text-[#2864E8]">
                Planner
              </span>
            </div>
            <p className="text-[10px] text-[#626B78] font-medium hidden sm:block">Indian Railways Intelligence</p>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden lg:flex items-center gap-0.5 bg-[#F7F8FA] p-1 rounded-xl border border-[#E5E8ED] overflow-x-auto">
          {primaryNavLinks.map((item) => {
            const Icon = item.icon;
            const active =
              location.pathname === item.to ||
              (item.to !== "/" && location.pathname.startsWith(item.to));

            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 whitespace-nowrap",
                  active
                    ? "bg-white text-[#2864E8] shadow-xs font-bold"
                    : "text-[#626B78] hover:text-[#171A21] hover:bg-black/[0.02]"
                )}
              >
                <Icon className={cn("w-3.5 h-3.5", active ? "text-[#2864E8]" : "text-[#626B78]")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Notification Center + IST Clock */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Smart Notification Center */}
          <NotificationCenter />

          <div className="hidden sm:flex flex-col items-end text-right pl-1 border-l border-[#E5E8ED]">
            <span className="font-mono text-xs font-bold text-[#171A21] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#168653] animate-ping" />
              {istTime}
            </span>
            <span className="text-[10px] text-[#626B78] font-medium">IST • Live Telemetry</span>
          </div>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="lg:hidden flex items-center gap-1 px-4 py-1.5 bg-[#F7F8FA] border-t border-[#E5E8ED] overflow-x-auto">
        {primaryNavLinks.map((item) => {
          const Icon = item.icon;
          const active =
            location.pathname === item.to ||
            (item.to !== "/" && location.pathname.startsWith(item.to));

          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-md whitespace-nowrap transition-all",
                active
                  ? "bg-white text-[#2864E8] shadow-xs font-bold"
                  : "text-[#626B78] hover:text-[#171A21]"
              )}
            >
              <Icon className="w-3 h-3" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
};
