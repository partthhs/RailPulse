import { Request, Response } from "express";
import { weatherService } from "../services/weatherService.js";
import { geographyService } from "../services/geographyService.js";
import { ApiResponse } from "@railpulse/types";

export class WeatherController {
  async getWeather(req: Request, res: Response) {
    try {
      const lat = parseFloat(req.query.lat as string) || 28.6415;
      const lon = parseFloat(req.query.lon as string) || 77.2207;
      const stationCode = req.query.stationCode as string | undefined;

      const data = await weatherService.getWeather(lat, lon, stationCode);
      const response: ApiResponse<typeof data> = {
        success: true,
        data,
      };
      res.json(response);
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: "WEATHER_FAILED", message: err.message || "Failed to retrieve weather" },
      });
    }
  }

  async getJourneyWeather(req: Request, res: Response) {
    try {
      const { trainNumber } = req.params;
      const data = await weatherService.getJourneyWeather(trainNumber);
      const response: ApiResponse<typeof data> = {
        success: true,
        data,
      };
      res.json(response);
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: "JOURNEY_WEATHER_FAILED", message: err.message || "Failed to retrieve journey weather" },
      });
    }
  }
}

export class GeographyController {
  async getNearby(req: Request, res: Response) {
    try {
      const lat = parseFloat(req.query.lat as string) || 28.6415;
      const lon = parseFloat(req.query.lon as string) || 77.2207;
      const stationCode = req.query.stationCode as string | undefined;

      const data = await geographyService.getNearby(lat, lon, stationCode);
      const response: ApiResponse<typeof data> = {
        success: true,
        data,
      };
      res.json(response);
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: "GEOGRAPHY_FAILED", message: err.message || "Failed to retrieve nearby geography" },
      });
    }
  }

  async getTrainNearby(req: Request, res: Response) {
    try {
      const { trainNumber } = req.params;
      const data = await geographyService.getTrainNearby(trainNumber);
      const response: ApiResponse<typeof data> = {
        success: true,
        data,
      };
      res.json(response);
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: { code: "TRAIN_GEOGRAPHY_FAILED", message: err.message || "Failed to retrieve train geography" },
      });
    }
  }
}

export const weatherController = new WeatherController();
export const geographyController = new GeographyController();
