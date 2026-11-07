import {
  TrainSearchResult,
  TrainStatus,
  JourneyRouteData,
  JourneyAnalytics,
  DelayDataPoint,
  ElevationPoint,
} from "@railpulse/types";
import { railRadarProvider } from "../providers/railway/railRadarProvider.js";
import { openTopographyProvider } from "../providers/elevation/openTopographyProvider.js";

export class TrainService {
  async search(query: string): Promise<TrainSearchResult[]> {
    return railRadarProvider.searchTrains(query);
  }

  async getStatus(trainNumber: string): Promise<TrainStatus | null> {
    return railRadarProvider.getTrainStatus(trainNumber);
  }

  async getRoute(trainNumber: string): Promise<JourneyRouteData | null> {
    const record = await railRadarProvider.getRoute(trainNumber);
    if (!record) return null;

    const status = await railRadarProvider.getTrainStatus(trainNumber);
    const passedCount = status ? status.stationsPassedCount : 1;

    return {
      trainNumber: record.train.trainNumber,
      trainName: record.train.trainName,
      stations: record.stations,
      routeGeometry: record.routeGeometry,
      completedCoordinates: record.completedCoordinates,
      remainingCoordinates: record.remainingCoordinates,
    };
  }

  async getAnalytics(trainNumber: string): Promise<JourneyAnalytics | null> {
    const status = await railRadarProvider.getTrainStatus(trainNumber);
    if (!status) return null;

    const record = await railRadarProvider.getRoute(trainNumber);
    const stations = status.stations || record?.stations || [];

    const delayHistory: DelayDataPoint[] = stations.map((s) => ({
      stationCode: s.stationCode,
      stationName: s.stationName,
      scheduledArrival: s.scheduledArrival || "00:00",
      actualArrival: s.actualArrival || s.estimatedArrival || s.scheduledArrival,
      delayMinutes: s.delayArrivalMinutes || 0,
      distanceKm: s.distanceFromSourceKm,
      isPassed: s.isPassed || false,
    }));

    // Generate sample points for OpenTopography SRTM DEM
    let elevationProfile: ElevationPoint[] = record?.elevationProfile || [];

    if (stations.length > 0) {
      const samplePoints = stations.map((st) => ({
        distanceKm: st.distanceFromSourceKm,
        latitude: st.latitude,
        longitude: st.longitude,
        stationCode: st.stationCode,
        stationName: st.stationName,
      }));

      const liveElevations = await openTopographyProvider.getElevationForPoints(trainNumber, samplePoints);
      if (liveElevations.length > 0) {
        elevationProfile = liveElevations;
      }
    }

    const elevations = elevationProfile.map((p) => p.elevationMeters);
    const highestElevation = elevations.length > 0 ? Math.max(...elevations) : null;
    const lowestElevation = elevations.length > 0 ? Math.min(...elevations) : null;
    const variation =
      highestElevation !== null && lowestElevation !== null ? highestElevation - lowestElevation : null;

    return {
      trainNumber,
      completionPercentage: status.completionPercentage,
      distanceCoveredKm: status.distanceCoveredKm,
      distanceRemainingKm: status.distanceRemainingKm,
      totalDistanceKm: status.totalDistanceKm,
      delayMinutes: status.delayMinutes,
      highestElevationMeters: highestElevation,
      lowestElevationMeters: lowestElevation,
      elevationVariationMeters: variation,
      stationsPassedCount: status.stationsPassedCount,
      upcomingStationsCount: status.upcomingStationsCount,
      delayHistory,
      elevationProfile,
      lastUpdated: new Date().toISOString(),
    };
  }
}

export const trainService = new TrainService();
