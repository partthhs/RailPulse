import { NearbyGeography } from "@railpulse/types";
import { overpassProvider } from "../providers/geography/overpassProvider.js";
import { trainService } from "./trainService.js";

export class GeographyService {
  async getNearby(lat: number, lon: number, stationCode?: string): Promise<NearbyGeography> {
    return overpassProvider.getNearbyGeography(stationCode || "", lat, lon);
  }

  async getTrainNearby(trainNumber: string): Promise<NearbyGeography | null> {
    const status = await trainService.getStatus(trainNumber);
    if (!status || !status.currentStation) return null;

    return overpassProvider.getNearbyGeography(
      status.currentStation.stationCode,
      status.currentStation.latitude,
      status.currentStation.longitude
    );
  }
}

export const geographyService = new GeographyService();
