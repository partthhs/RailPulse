import { Request, Response } from "express";
import { plannerService } from "../services/plannerService.js";
import { notificationService } from "../services/notificationService.js";
import { TravelClass, Quota } from "@railpulse/types";

export class PlannerController {
  async searchStations(req: Request, res: Response) {
    try {
      const q = (req.query.q as string) || "";
      const stations = await plannerService.searchStations(q);
      res.json({ success: true, data: stations });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }

  async getBetweenTrains(req: Request, res: Response) {
    try {
      const from = req.query.from as string;
      const to = req.query.to as string;
      const date = req.query.date as string | undefined;
      const travelClass = req.query.class as TravelClass | undefined;

      if (!from || !to) {
        return res.status(400).json({
          success: false,
          error: { message: "Source ('from') and Destination ('to') stations are required." },
        });
      }

      const trains = await plannerService.getTrainsBetween(from, to, date, travelClass);
      res.json({
        success: true,
        data: trains,
        metadata: {
          count: trains.length,
          from,
          to,
          date: date || "ALL_DAYS",
        },
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: { message: err.message } });
    }
  }

  async getMonthlyCalendar(req: Request, res: Response) {
    try {
      const from = req.query.from as string;
      const to = req.query.to as string;
      const year = parseInt(req.query.year as string, 10) || new Date().getFullYear();
      const month = parseInt(req.query.month as string, 10) || new Date().getMonth() + 1;
      const travelClass = req.query.class as TravelClass | undefined;

      if (!from || !to) {
        return res.status(400).json({
          success: false,
          error: { message: "Both 'from' and 'to' station codes are required." },
        });
      }

      const calendar = await plannerService.getMonthlyCalendar(from, to, year, month, travelClass);
      res.json({
        success: true,
        data: {
          from,
          to,
          year,
          month,
          days: calendar,
        },
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: { message: err.message } });
    }
  }

  async compareFares(req: Request, res: Response) {
    try {
      const from = req.query.from as string;
      const to = req.query.to as string;
      const date = (req.query.date as string) || new Date().toISOString().slice(0, 10);
      const travelClass = (req.query.class as TravelClass) || "3A";
      const quota = (req.query.quota as Quota) || "GN";
      const sortBy = (req.query.sortBy as any) || "fare_asc";

      if (!from || !to) {
        return res.status(400).json({
          success: false,
          error: { message: "'from' and 'to' station codes are required for fare comparison." },
        });
      }

      const comparison = await plannerService.compareFares(from, to, date, travelClass, quota, sortBy);
      res.json({
        success: true,
        data: comparison,
      });
    } catch (err: any) {
      res.status(400).json({ success: false, error: { message: err.message } });
    }
  }

  // --- Watchlist ---
  async getWatchlist(req: Request, res: Response) {
    try {
      const watchlist = notificationService.getWatchlist();
      res.json({ success: true, data: watchlist });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }

  async addToWatchlist(req: Request, res: Response) {
    try {
      const {
        trainNumber,
        trainName,
        journeyDate,
        sourceStation,
        sourceStationCode,
        destinationStation,
        destinationStationCode,
        boardingStation,
        boardingStationCode,
        notifyApproaching,
        notifyBookingOpening,
        notifyDelay,
        notifyPlatform,
      } = req.body;

      if (!trainNumber || !journeyDate || !boardingStationCode) {
        return res.status(400).json({
          success: false,
          error: { message: "trainNumber, journeyDate, and boardingStationCode are required." },
        });
      }

      const item = await notificationService.addToWatchlist({
        trainNumber,
        trainName: trainName || `Train ${trainNumber}`,
        journeyDate,
        sourceStation: sourceStation || "Origin",
        sourceStationCode: sourceStationCode || "ORG",
        destinationStation: destinationStation || "Destination",
        destinationStationCode: destinationStationCode || "DST",
        boardingStation: boardingStation || "Boarding",
        boardingStationCode,
        bookingStatus: "UPCOMING",
        notifyApproaching: notifyApproaching ?? true,
        notifyBookingOpening: notifyBookingOpening ?? true,
        notifyDelay: notifyDelay ?? true,
        notifyPlatform: notifyPlatform ?? true,
      });

      res.json({ success: true, data: item });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }

  async removeFromWatchlist(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const success = notificationService.removeWatchlist(id);
      res.json({ success });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }

  // --- Fare Alerts ---
  async getFareAlerts(req: Request, res: Response) {
    try {
      const alerts = notificationService.getFareAlerts();
      res.json({ success: true, data: alerts });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }

  async addFareAlert(req: Request, res: Response) {
    try {
      const {
        trainNumber,
        trainName,
        sourceStation,
        destinationStation,
        journeyDate,
        travelClass,
        targetFare,
        currentFare,
      } = req.body;

      if (!trainNumber || !journeyDate || !targetFare) {
        return res.status(400).json({
          success: false,
          error: { message: "trainNumber, journeyDate, and targetFare are required." },
        });
      }

      const alert = notificationService.addFareAlert({
        trainNumber,
        trainName: trainName || `Train ${trainNumber}`,
        sourceStation: sourceStation || "Origin",
        destinationStation: destinationStation || "Destination",
        journeyDate,
        travelClass: travelClass || "3A",
        targetFare: Number(targetFare),
        currentFare: Number(currentFare || targetFare + 200),
        previousFare: Number(currentFare || targetFare + 200),
        status: "MONITORING",
        isActive: true,
      });

      res.json({ success: true, data: alert });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }

  async removeFareAlert(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const success = notificationService.removeFareAlert(id);
      res.json({ success });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }

  // --- Notifications ---
  async getNotifications(req: Request, res: Response) {
    try {
      const notifs = notificationService.getNotifications();
      res.json({ success: true, data: notifs });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }

  async markNotificationRead(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const success = notificationService.markRead(id);
      res.json({ success });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }

  async clearNotifications(req: Request, res: Response) {
    try {
      notificationService.clearAll();
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ success: false, error: { message: err.message } });
    }
  }
}

export const plannerController = new PlannerController();
