import {
  Train,
  TrainStatus,
  Station,
  RouteGeometry,
  TrainSearchResult,
  FreshnessType,
  RunningStatusType,
} from "@railpulse/types";
import { config } from "../../config/env.js";
import { logger } from "../../utils/logger.js";
import {
  getStationGeo,
  interpolateCoordAtDistance,
  computeBearing,
} from "../../data/stationsGeoCache.js";
import { TELEMETRY_SNAPSHOTS, RawTelemetrySnapshot } from "../../data/liveTelemetryCache.js";
import { TRAINS_DATABASE } from "../../data/trainsData.js";

const RAILRADAR_BASE = "https://api.railradar.in/v1";

// In-memory caches to respect rate limits
const LIVE_STATUS_CACHE: Record<string, { data: TrainStatus; timestamp: number }> = {};
const ROUTE_CACHE: Record<string, { data: RouteWithStations; timestamp: number }> = {};
const ROUTE_CACHE_TTL = 15 * 60 * 1000;

interface RouteWithStations {
  trainNumber: string;
  trainName: string;
  routeGeometry: RouteGeometry;
  stations: Station[];
  totalDistanceKm: number;
}

export class RailRadarProvider {
  private getHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${config.railRadarApiKey}`,
      "X-Api-Key": config.railRadarApiKey,
      "Content-Type": "application/json",
    };
  }

  /**
   * Search trains by number or partial name via RailRadar lookup API.
   * Returns live API results for ANY train in India.
   */
  async searchTrains(query: string): Promise<TrainSearchResult[]> {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return [];

    if (!config.railRadarApiKey) {
      logger.warn("RailRadar API key not configured — search unavailable");
      return [];
    }

    const results: TrainSearchResult[] = [];

    try {
      const res = await fetch(
        `${RAILRADAR_BASE}/lookup/trains?query=${encodeURIComponent(cleanQuery)}`,
        { headers: this.getHeaders() }
      );

      if (res.ok) {
        const json: any = await res.json();
        if (json.success && json.data) {
          for (const [tNum, tName] of Object.entries(json.data)) {
            if (
              tNum.toLowerCase().includes(cleanQuery) ||
              (tName as string).toLowerCase().includes(cleanQuery)
            ) {
              results.push({
                trainNumber: tNum,
                trainName: tName as string,
                trainType: this.inferTrainType(tName as string),
                sourceStation: "—",
                destinationStation: "—",
                sourceStationCode: "",
                destinationStationCode: "",
                departureTime: "",
                arrivalTime: "",
                totalDuration: "",
                runsOn: [],
              });
            }
            if (results.length >= 10) break;
          }

          const topResults = results.slice(0, 3);
          await Promise.allSettled(
            topResults.map(async (r) => {
              try {
                const status = await this.getTrainStatus(r.trainNumber);
                if (status) {
                  r.sourceStation = status.sourceStation;
                  r.destinationStation = status.destinationStation;
                  const firstSt = status.stations[0];
                  const lastSt = status.stations[status.stations.length - 1];
                  r.sourceStationCode = firstSt?.stationCode || "";
                  r.destinationStationCode = lastSt?.stationCode || "";
                  r.departureTime = firstSt?.scheduledDeparture || "";
                  r.arrivalTime = lastSt?.scheduledArrival || "";
                  if (status.totalDistanceKm > 0) {
                    const mins = Math.round((status.totalDistanceKm / 70) * 60);
                    r.totalDuration = `${Math.floor(mins / 60)}h ${mins % 60}m`;
                  }
                }
              } catch {
                // Keep partial result
              }
            })
          );
        }
      } else {
        logger.warn(`RailRadar train search returned ${res.status}`);
      }
    } catch (err: any) {
      logger.error(`RailRadar train search failed: ${err.message}`);
    }

    return results;
  }

  private inferTrainType(name: string): string {
    const n = name.toLowerCase();
    if (n.includes("rajdhani")) return "Rajdhani Express";
    if (n.includes("vande bharat")) return "Vande Bharat Express";
    if (n.includes("shatabdi")) return "Shatabdi Express";
    if (n.includes("duronto")) return "Duronto Express";
    if (n.includes("humsafar")) return "Humsafar Express";
    if (n.includes("tejas")) return "Tejas Express";
    if (n.includes("superfast") || n.includes("sf")) return "Superfast Express";
    if (n.includes("mail") || n.includes("express")) return "Mail/Express";
    if (n.includes("passenger") || n.includes("memu") || n.includes("demu")) return "Passenger";
    if (n.includes("intercity")) return "Intercity Express";
    if (n.includes("jan shatabdi")) return "Jan Shatabdi Express";
    if (n.includes("garib rath")) return "Garib Rath Express";
    if (n.includes("yuva")) return "Yuva Express";
    if (n.includes("double decker")) return "Double Decker";
    return "Express";
  }

  /**
   * Retrieve normalized live running status from RailRadar API.
   * If RailRadar encounters monthly quota limits (HTTP 429), it falls back to
   * genuine telemetry snapshots, marking the response DATA_DELAYED.
   */
  async getTrainStatus(trainNumber: string): Promise<TrainStatus | null> {
    const cached = LIVE_STATUS_CACHE[trainNumber];
    if (cached && Date.now() - cached.timestamp < 30000) {
      return cached.data;
    }

    if (!config.railRadarApiKey) {
      logger.warn("RailRadar API key not configured");
      return null;
    }

    try {
      const res = await fetch(`${RAILRADAR_BASE}/trains/${trainNumber}/live`, {
        headers: this.getHeaders(),
      });

      if (res.ok) {
        const json: any = await res.json();
        if (json.success && json.data) {
          const status = await this.parseTelemetryPayload(trainNumber, json.data, "FRESH");
          LIVE_STATUS_CACHE[trainNumber] = { data: status, timestamp: Date.now() };
          return status;
        } else if (json.error?.code === "TOO_MANY_REQUESTS") {
          logger.warn(`RailRadar quota exceeded for ${trainNumber}`);
        }
      } else {
        const errText = await res.text();
        logger.warn(`RailRadar live returned ${res.status} for ${trainNumber}: ${errText.slice(0, 100)}`);
      }
    } catch (err: any) {
      logger.error(`RailRadar live status request error for ${trainNumber}: ${err.message}`);
    }

    // Fallback 1: in-memory cache
    if (cached) {
      return { ...cached.data, freshness: "DATA_DELAYED" as FreshnessType };
    }

    // Fallback 2: genuine snapshot telemetry
    const snapshot = TELEMETRY_SNAPSHOTS[trainNumber];
    if (snapshot) {
      logger.info(`Using genuine snapshot telemetry for ${trainNumber} due to RailRadar API rate limits`);
      const status = await this.parseTelemetryPayload(trainNumber, snapshot, "STALE");
      LIVE_STATUS_CACHE[trainNumber] = { data: status, timestamp: Date.now() };
      return status;
    }

    return null;
  }

  /**
   * Core telemetry parsing engine.
   * Implements exact PRD rules for station accuracy and marker positioning:
   * - Uses previousHalt and nextHalt reported by the API.
   * - Correctly detects whether train is AT a halt or RUNNING BETWEEN halts.
   * - Places marker at true track distance using cumulative Haversine LineString traversal.
   */
  private async parseTelemetryPayload(
    trainNumber: string,
    raw: any,
    freshness: FreshnessType
  ): Promise<TrainStatus> {
    const currentLoc = raw.currentLocation;
    const prevHalt = raw.previousHalt;
    const nextHaltApi = raw.nextHalt;
    const delayMinutes = raw.delayMinutes ?? currentLoc?.delayMinutes ?? 0;

    let runningStatus: RunningStatusType = "ON_TIME";
    if (delayMinutes > 10) runningStatus = "DELAYED";

    const routeData = await this.getRouteData(trainNumber);
    const routeCoords = routeData?.routeGeometry?.geometry?.coordinates as [number, number][] | undefined;
    const totalDist = routeData?.totalDistanceKm || raw.train?.distance || 1000;

    // Filter to halt stations
    const halts = (raw.route || []).filter((r: any) => r.isHalt);

    const stations: Station[] = halts.map((st: any, idx: number) => {
      const isPassed = st.status === "passed" || st.status === "departed";
      const isAtStation = st.status === "at-station";
      const isCurrent =
        isAtStation ||
        (currentLoc && currentLoc.isHalt === true && st.stationCode === currentLoc.stationCode);

      let lat: number;
      let lng: number;
      const geo = getStationGeo(st.stationCode);
      if (geo) {
        lat = geo.lat;
        lng = geo.lng;
      } else if (routeCoords && routeCoords.length > 0 && st.distance != null) {
        const interp = interpolateCoordAtDistance(routeCoords, st.distance, totalDist);
        lat = interp.lat;
        lng = interp.lng;
      } else {
        lat = 20.0 + idx * 0.5;
        lng = 77.0 + idx * 0.3;
      }

      const scheduledArrival = st.scheduledArrival ? st.scheduledArrival.slice(11, 16) : undefined;
      const scheduledDeparture = st.scheduledDeparture ? st.scheduledDeparture.slice(11, 16) : undefined;
      const actualArrival = st.actualArrival ? st.actualArrival.slice(11, 16) : undefined;
      const actualDeparture = st.actualDeparture ? st.actualDeparture.slice(11, 16) : undefined;
      const estimatedArrival = st.estimatedArrival ? st.estimatedArrival.slice(11, 16) : undefined;

      return {
        id: `st-${st.stationCode.toLowerCase()}-${idx}`,
        stationCode: st.stationCode,
        stationName: st.stationName,
        latitude: lat,
        longitude: lng,
        scheduledArrival,
        scheduledDeparture,
        actualArrival,
        actualDeparture,
        estimatedArrival,
        delayArrivalMinutes: st.delayArrival ?? 0,
        delayDepartureMinutes: st.delayDeparture ?? 0,
        distanceFromSourceKm: Math.round(st.distance || 0),
        dayCount: st.arrivalDay || st.departureDay || 1,
        haltMinutes:
          st.scheduledArrival && st.scheduledDeparture
            ? Math.max(0, Math.round(
                (new Date(st.scheduledDeparture).getTime() -
                  new Date(st.scheduledArrival).getTime()) /
                  60000
              ))
            : 0,
        platform: st.platform || undefined,
        coachPosition: st.coachPosition || undefined,
        hasDeparted: isPassed,
        isCurrent,
        isPassed,
      };
    });

    // ── Determine previous halt and next halt from API ──
    let lastDepartedStation: Station | undefined;
    if (prevHalt?.stationCode) {
      lastDepartedStation = stations.find((s) => s.stationCode === prevHalt.stationCode);
    }
    if (!lastDepartedStation) {
      const passed = stations.filter((s) => s.isPassed);
      lastDepartedStation = passed.length > 0 ? passed[passed.length - 1] : stations[0];
    }

    let nextStation: Station | undefined;
    if (nextHaltApi?.stationCode) {
      nextStation = stations.find((s) => s.stationCode === nextHaltApi.stationCode);
    }
    if (!nextStation && lastDepartedStation) {
      const currentIdx = stations.indexOf(lastDepartedStation);
      nextStation = currentIdx < stations.length - 1 ? stations[currentIdx + 1] : undefined;
    }

    // ── Distinguish At-Station vs Between-Stations ──
    const isAtHaltStation = stations.some((s) => s.isCurrent);
    let currentStation: Station | undefined;
    let isBetweenStations = false;
    let betweenStationsLabel: string | undefined;

    if (isAtHaltStation) {
      currentStation = stations.find((s) => s.isCurrent);
      isBetweenStations = false;
    } else {
      isBetweenStations = true;
      currentStation = lastDepartedStation;
      const prevName = prevHalt?.stationName || lastDepartedStation?.stationName || "Previous Station";
      const nextName = nextHaltApi?.stationName || nextStation?.stationName || "Next Station";
      betweenStationsLabel = `Between ${prevName} and ${nextName}`;
    }

    // ── Marker Position: Use TRUE distance from origin (cumulative track traversal) ──
    const liveDistKm =
      currentLoc?.distanceFromOriginKm ??
      currentStation?.distanceFromSourceKm ??
      0;

    let liveLat: number;
    let liveLng: number;
    let bearing = 0;

    if (routeCoords && routeCoords.length > 0) {
      // True cumulative distance along route LineString
      const interp = interpolateCoordAtDistance(routeCoords, liveDistKm, totalDist);
      liveLat = interp.lat;
      liveLng = interp.lng;

      if (nextStation) {
        bearing = computeBearing(liveLat, liveLng, nextStation.latitude, nextStation.longitude);
      } else if (currentStation) {
        bearing = computeBearing(
          currentStation.latitude,
          currentStation.longitude,
          liveLat,
          liveLng
        );
      }
    } else if (currentStation) {
      liveLat = currentStation.latitude;
      liveLng = currentStation.longitude;
      if (nextStation) {
        bearing = computeBearing(liveLat, liveLng, nextStation.latitude, nextStation.longitude);
      }
    } else {
      liveLat = 20.5;
      liveLng = 78.9;
    }

    const totalDistKm =
      stations.length > 0
        ? stations[stations.length - 1].distanceFromSourceKm
        : totalDist || 1000;
    const coveredDist = liveDistKm;
    const remainingDist = Math.max(0, totalDistKm - coveredDist);
    const progress =
      totalDistKm > 0
        ? Math.min(100, Math.round((coveredDist / totalDistKm) * 100))
        : 0;

    const speedKmH = currentLoc?.speedKmh ?? 0;
    const trainInfo = raw.train || {};

    return {
      trainNumber: raw.trainNumber || trainNumber,
      trainName: raw.trainName || trainInfo.name || `Train ${trainNumber}`,
      trainType: trainInfo.type || this.inferTrainType(raw.trainName || ""),
      sourceStation: trainInfo.source?.name || stations[0]?.stationName || "Origin",
      destinationStation:
        trainInfo.destination?.name ||
        stations[stations.length - 1]?.stationName ||
        "Destination",
      currentStation,
      nextStation,
      lastDepartedStation,
      isBetweenStations,
      betweenStationsLabel,
      currentIntermediateStation:
        currentLoc && !currentLoc.isHalt ? currentLoc.stationName : undefined,
      currentIntermediateCode:
        currentLoc && !currentLoc.isHalt ? currentLoc.stationCode : undefined,
      latitude: Number(liveLat.toFixed(5)),
      longitude: Number(liveLng.toFixed(5)),
      bearing: Math.round(bearing),
      speedKmH,
      delayMinutes,
      distanceCoveredKm: Math.round(coveredDist),
      distanceRemainingKm: Math.round(remainingDist),
      totalDistanceKm: totalDistKm,
      completionPercentage: progress,
      status: runningStatus,
      freshness,
      lastUpdated: new Date().toISOString(),
      providerTimestamp: raw.lastUpdatedAt || new Date().toISOString(),
      retrievedAt: new Date().toISOString(),
      stationsPassedCount: stations.filter((s) => s.isPassed).length,
      upcomingStationsCount: stations.length - stations.filter((s) => s.isPassed).length,
      stations,
    };
  }

  /**
   * Get route GeoJSON and stations from RailRadar — works for any train in India.
   */
  private async getRouteData(trainNumber: string): Promise<RouteWithStations | null> {
    const cached = ROUTE_CACHE[trainNumber];
    if (cached && Date.now() - cached.timestamp < ROUTE_CACHE_TTL) {
      return cached.data;
    }

    if (!config.railRadarApiKey) return null;

    try {
      const res = await fetch(`${RAILRADAR_BASE}/trains/${trainNumber}/route`, {
        headers: this.getHeaders(),
      });

      if (res.ok) {
        const json: any = await res.json();
        if (json.success && json.data?.geojson?.geometry?.coordinates) {
          const coords = json.data.geojson.geometry.coordinates as [number, number][];

          let totalDist = 0;
          for (let i = 1; i < coords.length; i++) {
            totalDist += this.haversineKm(
              coords[i - 1][1], coords[i - 1][0],
              coords[i][1], coords[i][0]
            );
          }

          const result: RouteWithStations = {
            trainNumber,
            trainName: json.data.trainName || `Train ${trainNumber}`,
            routeGeometry: {
              type: "Feature",
              geometry: { type: "LineString", coordinates: coords },
              properties: { trainNumber, isApproximate: false, totalDistanceKm: Math.round(totalDist) },
            },
            stations: [],
            totalDistanceKm: Math.round(totalDist),
          };

          ROUTE_CACHE[trainNumber] = { data: result, timestamp: Date.now() };
          return result;
        }
      }
    } catch (err: any) {
      logger.warn(`RailRadar route fetch failed for ${trainNumber}: ${err.message}`);
    }

    // Fallback: Check if routeGeometry exists in TRAINS_DATABASE
    const fallbackDb = TRAINS_DATABASE[trainNumber];
    if (fallbackDb?.routeGeometry?.geometry?.coordinates) {
      const coords = fallbackDb.routeGeometry.geometry.coordinates;
      let totalDist = 0;
      for (let i = 1; i < coords.length; i++) {
        totalDist += this.haversineKm(
          coords[i - 1][1], coords[i - 1][0],
          coords[i][1], coords[i][0]
        );
      }
      return {
        trainNumber,
        trainName: fallbackDb.train.trainName,
        routeGeometry: fallbackDb.routeGeometry,
        stations: fallbackDb.stations,
        totalDistanceKm: Math.round(totalDist),
      };
    }

    return null;
  }

  /**
   * Public getRoute method — returns full route record with live GeoJSON and stations.
   * Splits route coordinates based on actual live distance for pinpoint accuracy.
   */
  async getRoute(trainNumber: string): Promise<{
    train: Train;
    stations: Station[];
    routeGeometry: RouteGeometry;
    completedCoordinates: [number, number][];
    remainingCoordinates: [number, number][];
    elevationProfile: any[];
    weatherByStation: Record<string, any>;
    nearbyByStation: Record<string, any>;
  } | null> {
    const status = await this.getTrainStatus(trainNumber);
    const routeData = await this.getRouteData(trainNumber);

    if (!status && !routeData) return null;

    const coords = routeData?.routeGeometry?.geometry?.coordinates || [];
    const totalDist = routeData?.totalDistanceKm || status?.totalDistanceKm || 0;
    const coveredDist = status?.distanceCoveredKm || 0;

    // Split coordinates into completed and remaining using true cumulative distance
    const completedCoordinates: [number, number][] = [];
    const remainingCoordinates: [number, number][] = [];

    let cumDist = 0;
    for (let i = 0; i < coords.length; i++) {
      if (i > 0) {
        cumDist += this.haversineKm(
          coords[i - 1][1], coords[i - 1][0],
          coords[i][1], coords[i][0]
        );
      }
      if (cumDist <= coveredDist) {
        completedCoordinates.push(coords[i]);
      } else {
        if (remainingCoordinates.length === 0 && completedCoordinates.length > 0) {
          remainingCoordinates.push(completedCoordinates[completedCoordinates.length - 1]);
        }
        remainingCoordinates.push(coords[i]);
      }
    }

    const trainRecord: Train = {
      id: `tr-${trainNumber}`,
      trainNumber,
      trainName: status?.trainName || routeData?.trainName || `Train ${trainNumber}`,
      trainType: status?.trainType || "Express",
      sourceStation: status?.sourceStation || "Origin",
      destinationStation: status?.destinationStation || "Destination",
      sourceStationCode: status?.stations[0]?.stationCode || "",
      destinationStationCode: status?.stations[status.stations.length - 1]?.stationCode || "",
      totalDistanceKm: totalDist,
      totalDurationMinutes: 0,
      runsOnDays: [],
    };

    return {
      train: trainRecord,
      stations: status?.stations || [],
      routeGeometry: routeData?.routeGeometry || {
        type: "Feature",
        geometry: { type: "LineString", coordinates: [] },
        properties: { trainNumber, isApproximate: true, totalDistanceKm: 0 },
      },
      completedCoordinates: completedCoordinates.length > 0 ? completedCoordinates : coords.slice(0, 1),
      remainingCoordinates: remainingCoordinates.length > 0 ? remainingCoordinates : coords,
      elevationProfile: [],
      weatherByStation: {},
      nearbyByStation: {},
    };
  }

  private haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
}

export const railRadarProvider = new RailRadarProvider();
