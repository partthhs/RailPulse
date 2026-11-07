import { Request, Response } from "express";
import { trainService } from "../services/trainService.js";
import { ApiResponse } from "@railpulse/types";

export class TrainController {
  async search(req: Request, res: Response) {
    try {
      const q = (req.query.q as string) || "";
      const results = await trainService.search(q);
      const response: ApiResponse<typeof results> = {
        success: true,
        data: results,
      };
      res.json(response);
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: "SEARCH_FAILED", message: err.message || "Failed to search trains" },
      });
    }
  }

  async getStatus(req: Request, res: Response) {
    try {
      const { trainNumber } = req.params;
      const status = await trainService.getStatus(trainNumber);
      if (!status) {
        return res.status(404).json({
          success: false,
          error: { code: "TRAIN_NOT_FOUND", message: `Train ${trainNumber} not found` },
        });
      }

      const response: ApiResponse<typeof status> = {
        success: true,
        data: status,
        metadata: {
          freshness: status.freshness,
          provider: "RailRadar",
          timestamp: status.lastUpdated,
        },
      };
      res.json(response);
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: "STATUS_FAILED", message: err.message || "Failed to retrieve train status" },
      });
    }
  }

  async getRoute(req: Request, res: Response) {
    try {
      const { trainNumber } = req.params;
      const route = await trainService.getRoute(trainNumber);
      if (!route) {
        return res.status(404).json({
          success: false,
          error: { code: "ROUTE_NOT_FOUND", message: `Route for train ${trainNumber} not found` },
        });
      }

      const response: ApiResponse<typeof route> = {
        success: true,
        data: route,
      };
      res.json(response);
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: "ROUTE_FAILED", message: err.message || "Failed to retrieve route" },
      });
    }
  }

  async getAnalytics(req: Request, res: Response) {
    try {
      const { trainNumber } = req.params;
      const analytics = await trainService.getAnalytics(trainNumber);
      if (!analytics) {
        return res.status(404).json({
          success: false,
          error: { code: "ANALYTICS_NOT_FOUND", message: `Analytics for train ${trainNumber} not found` },
        });
      }

      const response: ApiResponse<typeof analytics> = {
        success: true,
        data: analytics,
      };
      res.json(response);
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: "ANALYTICS_FAILED", message: err.message || "Failed to retrieve analytics" },
      });
    }
  }
}

export const trainController = new TrainController();
