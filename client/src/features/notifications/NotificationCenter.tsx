import React, { useState, useEffect, useRef } from "react";
import { SmartNotification } from "@railpulse/types";
import { apiClient } from "@/services/apiClient";
import { Bell, Clock, Check, Trash2, ExternalLink, Calendar, AlertTriangle, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/utils/cn";

export const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const fetchNotifs = async () => {
    try {
      const data = await apiClient.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error("Failed to load notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 45000); // 45s poll
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkRead = async (id: string, actionUrl?: string) => {
    try {
      await apiClient.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      if (actionUrl) {
        setIsOpen(false);
        navigate(actionUrl);
      }
    } catch (err) {
      console.error("Failed to mark read", err);
    }
  };

  const handleClearAll = async () => {
    try {
      await apiClient.clearNotifications();
      setNotifications([]);
    } catch (err) {
      console.error("Failed to clear", err);
    }
  };

  const getIcon = (type: SmartNotification["type"]) => {
    switch (type) {
      case "APPROACHING":
        return <Clock className="w-4 h-4 text-[#2864E8]" />;
      case "BOOKING_OPENING":
        return <Calendar className="w-4 h-4 text-[#168653]" />;
      case "DELAY":
        return <AlertTriangle className="w-4 h-4 text-[#B7791F]" />;
      case "FARE_REACHED":
        return <ArrowRight className="w-4 h-4 text-[#168653]" />;
      default:
        return <Bell className="w-4 h-4 text-[#2864E8]" />;
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-btn text-[#626B78] hover:text-[#171A21] hover:bg-black/[0.04] transition-colors"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#C43D45] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-card border border-[#E5E8ED] shadow-float z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="p-3.5 border-b border-[#E5E8ED] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-[#171A21]">Smart Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#2864E8]/10 text-[#2864E8]">
                  {unreadCount} new
                </span>
              )}
            </div>
            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-xs text-[#626B78] hover:text-[#C43D45] flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear All
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-[#E5E8ED]">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleMarkRead(notif.id, notif.actionUrl)}
                  className={cn(
                    "p-3.5 hover:bg-[#F7F8FA] cursor-pointer transition-colors flex items-start gap-3",
                    !notif.isRead && "bg-[#2864E8]/5"
                  )}
                >
                  <div className="w-8 h-8 rounded-lg bg-white border border-[#E5E8ED] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-[#171A21] truncate">{notif.title}</h4>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#2864E8] shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-[#626B78] mt-0.5 leading-relaxed">
                      {notif.message}
                    </p>
                    <div className="flex items-center justify-between mt-2 pt-1 text-[10px] text-[#626B78]">
                      <span className="font-mono">
                        {new Date(notif.createdAt).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {notif.actionUrl && (
                        <span className="text-[#2864E8] font-semibold flex items-center gap-0.5">
                          Open <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-[#626B78]">
                <Bell className="w-6 h-6 text-[#626B78]/40 mx-auto mb-2" />
                No new notifications.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
