import { ElevationPoint } from "@railpulse/types";
import { config } from "../../config/env.js";
import { logger } from "../../utils/logger.js";

// Cache elevation profiles — they don't change, so cache for session lifetime
const ELEVATION_CACHE: Record<string, ElevationPoint[]> = {};

export class OpenTopographyProvider {
  /**
   * Sample elevation along route coordinates using OpenTopography Global SRTM DEM.
   * Returns empty array if API unavailable or all samples fail — do NOT fabricate data.
   */
  async getElevationForPoints(
    trainNumber: string,
    samplePoints: {
      distanceKm: number;
      latitude: number;
      longitude: number;
      stationCode?: string;
      stationName?: string;
    }[]
  ): Promise<ElevationPoint[]> {
    if (ELEVATION_CACHE[trainNumber]) {
      return ELEVATION_CACHE[trainNumber];
    }

    if (!config.openTopographyApiKey) {
      logger.warn("OpenTopography API key not configured — elevation profile unavailable");
      return [];
    }

    if (samplePoints.length === 0) return [];

    const results: ElevationPoint[] = [];
    let successCount = 0;

    for (const pt of samplePoints) {
      // Skip points with invalid coordinates
      if (!isFinite(pt.latitude) || !isFinite(pt.longitude)) continue;
      if (pt.latitude < -90 || pt.latitude > 90 || pt.longitude < -180 || pt.longitude > 180) continue;

      const delta = 0.005; // ~500m bounding box
      const south = (pt.latitude - delta).toFixed(6);
      const north = (pt.latitude + delta).toFixed(6);
      const west = (pt.longitude - delta).toFixed(6);
      const east = (pt.longitude + delta).toFixed(6);

      const url =
        `https://portal.opentopography.org/API/globaldem` +
        `?demtype=SRTMGL3&south=${south}&north=${north}&west=${west}&east=${east}` +
        `&outputFormat=AAIGrid&API_Key=${config.openTopographyApiKey}`;

      try {
        const res = await fetch(url);
        if (res.ok) {
          const text = await res.text();
          // Parse AAIGrid format: skip 6 header lines, then read numerical elevation grid
          const lines = text.trim().split("\n");
          let parsedElevation: number | null = null;

          for (let i = 6; i < lines.length; i++) {
            const vals = lines[i]
              .trim()
              .split(/\s+/)
              .map(Number)
              .filter((n) => isFinite(n) && n > -9000); // -9999 is NODATA value
            if (vals.length > 0) {
              parsedElevation = vals[Math.floor(vals.length / 2)];
              break;
            }
          }

          if (parsedElevation !== null && parsedElevation > -9000) {
            results.push({
              distanceKm: pt.distanceKm,
              elevationMeters: Math.max(0, parsedElevation),
              stationCode: pt.stationCode,
              stationName: pt.stationName,
            });
            successCount++;
            continue;
          }
        } else {
          logger.warn(
            `OpenTopography returned ${res.status} for ${pt.stationCode || `dist:${pt.distanceKm}`}`
          );
        }
      } catch (subErr: any) {
        logger.warn(
          `OpenTopography sample failed for ${pt.stationCode || pt.distanceKm}: ${subErr.message}`
        );
      }
      // Do NOT add a fake point — just skip this sample
    }

    if (results.length > 0) {
      ELEVATION_CACHE[trainNumber] = results;
      logger.info(`OpenTopography: got ${successCount}/${samplePoints.length} elevation points for train ${trainNumber}`);
    }

    return results;
  }
}

export const openTopographyProvider = new OpenTopographyProvider();
