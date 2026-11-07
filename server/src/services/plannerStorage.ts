import fs from "fs";
import path from "path";
import { WatchedTrain, FareAlert, FareHistoryItem, SmartNotification } from "@railpulse/types";
import { logger } from "../utils/logger.js";

interface PlannerStorageData {
  watchedTrains: WatchedTrain[];
  fareAlerts: FareAlert[];
  fareHistory: FareHistoryItem[];
  notifications: SmartNotification[];
}

const STORAGE_FILE = path.resolve(process.cwd(), "server/planner_storage.json");

const DEFAULT_DATA: PlannerStorageData = {
  watchedTrains: [],
  fareAlerts: [],
  fareHistory: [],
  notifications: [
    {
      id: "notif-welcome",
      title: "Welcome to RailPulse Smart Journey Planner",
      message: "Explore trains between stations, monitor fares, and track 60-day reservation opening dates.",
      type: "BOOKING_OPENING",
      relatedTrainNumber: "12951",
      relatedTrainName: "Mumbai Rajdhani",
      isRead: false,
      createdAt: new Date().toISOString(),
      actionUrl: "/explore",
    },
  ],
};

class PlannerStorage {
  private data: PlannerStorageData = DEFAULT_DATA;

  constructor() {
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(STORAGE_FILE)) {
        const raw = fs.readFileSync(STORAGE_FILE, "utf-8");
        this.data = { ...DEFAULT_DATA, ...JSON.parse(raw) };
      } else {
        this.save();
      }
    } catch (err: any) {
      logger.error("Failed to load planner storage", err.message);
      this.data = DEFAULT_DATA;
    }
  }

  private save() {
    try {
      fs.writeFileSync(STORAGE_FILE, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (err: any) {
      logger.error("Failed to save planner storage", err.message);
    }
  }

  // --- Watched Trains ---
  getWatchedTrains(): WatchedTrain[] {
    return this.data.watchedTrains;
  }

  addWatchedTrain(item: Omit<WatchedTrain, "id" | "createdAt">): WatchedTrain {
    // Check for duplicate per PRD PART 6 & 7: (trainNumber, journeyDate)
    const existing = this.data.watchedTrains.find(
      (w) => w.trainNumber === item.trainNumber && w.journeyDate === item.journeyDate
    );
    if (existing) {
      return existing;
    }

    const newRecord: WatchedTrain = {
      ...item,
      id: `watch-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    this.data.watchedTrains.push(newRecord);
    this.save();
    return newRecord;
  }

  removeWatchedTrain(id: string): boolean {
    const initialLen = this.data.watchedTrains.length;
    this.data.watchedTrains = this.data.watchedTrains.filter((w) => w.id !== id);
    if (this.data.watchedTrains.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  updateWatchedTrain(id: string, updates: Partial<WatchedTrain>): WatchedTrain | null {
    const item = this.data.watchedTrains.find((w) => w.id === id);
    if (!item) return null;
    Object.assign(item, updates);
    this.save();
    return item;
  }

  // --- Fare Alerts ---
  getFareAlerts(): FareAlert[] {
    return this.data.fareAlerts;
  }

  addFareAlert(item: Omit<FareAlert, "id" | "createdAt" | "lastCheckedAt">): FareAlert {
    const newAlert: FareAlert = {
      ...item,
      id: `alert-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      lastCheckedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    this.data.fareAlerts.push(newAlert);
    this.save();
    return newAlert;
  }

  removeFareAlert(id: string): boolean {
    const initialLen = this.data.fareAlerts.length;
    this.data.fareAlerts = this.data.fareAlerts.filter((a) => a.id !== id);
    if (this.data.fareAlerts.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // --- Notifications ---
  getNotifications(): SmartNotification[] {
    return this.data.notifications.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  addNotification(notif: Omit<SmartNotification, "id" | "createdAt" | "isRead">): SmartNotification {
    // Avoid duplicate notifications for same train & message within 24h
    const isDuplicate = this.data.notifications.some(
      (n) =>
        n.relatedTrainNumber === notif.relatedTrainNumber &&
        n.type === notif.type &&
        Date.now() - new Date(n.createdAt).getTime() < 24 * 60 * 60 * 1000
    );

    if (isDuplicate) {
      return this.data.notifications[0];
    }

    const newNotif: SmartNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    this.data.notifications.unshift(newNotif);
    if (this.data.notifications.length > 50) {
      this.data.notifications = this.data.notifications.slice(0, 50);
    }
    this.save();
    return newNotif;
  }

  markNotificationRead(id: string): boolean {
    const notif = this.data.notifications.find((n) => n.id === id);
    if (notif) {
      notif.isRead = true;
      this.save();
      return true;
    }
    return false;
  }

  clearNotifications(): void {
    this.data.notifications = [];
    this.save();
  }
}

export const plannerStorage = new PlannerStorage();
