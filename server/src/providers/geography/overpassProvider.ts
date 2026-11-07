import { NearbyGeography } from "@railpulse/types";
import { config } from "../../config/env.js";
import { logger } from "../../utils/logger.js";

export class OverpassProvider {
  /**
   * Query nearby geographic features around a station coordinate (rivers, mountains, bridges).
   * Uses OpenStreetMap Overpass API if reachable, with clean fallback.
   */
  async getNearbyGeography(stationCode: string, lat: number, lon: number): Promise<NearbyGeography> {
    // Valid coordinate check
    if (!isFinite(lat) || !isFinite(lon) || lat === 0 || lon === 0) {
      return {
        center: { latitude: 20.5, longitude: 78.9 },
        radiusKm: 25,
        rivers: [],
        lakes: [],
        mountains: [],
        bridges: [],
        tunnels: [],
        attractions: [],
        cities: [],
        isApproximate: true,
      };
    }

    const radius = 25; // 25km radius

    // Attempt live Overpass query for prominent water bodies, bridges, and peaks around the station
    if (config.overpassEndpoint) {
      try {
        const query = `
          [out:json][timeout:5];
          (
            node["natural"="water"](around:${radius * 1000},${lat},${lon});
            way["waterway"="river"](around:${radius * 1000},${lat},${lon});
            node["natural"="peak"](around:${radius * 1000},${lat},${lon});
            way["bridge"="yes"]["railway"](around:${radius * 1000},${lat},${lon});
            node["tourism"="attraction"](around:${radius * 1000},${lat},${lon});
          );
          out center 8;
        `;

        const res = await fetch(`${config.overpassEndpoint}?data=${encodeURIComponent(query)}`, {
          signal: AbortSignal.timeout(4000),
        });

        if (res.ok) {
          const json: any = await res.json();
          if (json.elements && Array.isArray(json.elements)) {
            const rivers: any[] = [];
            const lakes: any[] = [];
            const mountains: any[] = [];
            const bridges: any[] = [];
            const attractions: any[] = [];

            for (const el of json.elements) {
              const tags = el.tags || {};
              const name = tags.name || tags["name:en"];
              if (!name) continue;

              const eLat = el.lat ?? el.center?.lat ?? lat;
              const eLon = el.lon ?? el.center?.lon ?? lon;
              const dist = Number((this.haversineKm(lat, lon, eLat, eLon)).toFixed(1));

              const item = {
                id: `osm-${el.id}`,
                name,
                distanceKm: dist,
                latitude: eLat,
                longitude: eLon,
              };

              if (tags.waterway === "river" && rivers.length < 3) {
                rivers.push({ ...item, type: "river", description: `Perennial water body near ${stationCode}` });
              } else if (tags.natural === "water" && lakes.length < 3) {
                lakes.push({ ...item, type: "lake", description: `Lake or reservoir basin within ${dist} km` });
              } else if (tags.natural === "peak" && mountains.length < 3) {
                mountains.push({ ...item, type: "mountain", description: `Elevated geographical terrain feature (${tags.elevation ? tags.elevation + 'm' : 'peak'})` });
              } else if (tags.bridge === "yes" && bridges.length < 3) {
                bridges.push({ ...item, type: "bridge", description: `Railway bridge structure near ${stationCode}` });
              } else if (tags.tourism === "attraction" && attractions.length < 3) {
                attractions.push({ ...item, type: "attraction", description: `Regional landmark / point of interest` });
              }
            }

            return {
              center: { latitude: lat, longitude: lon },
              radiusKm: radius,
              rivers,
              lakes,
              mountains,
              bridges,
              tunnels: [],
              attractions,
              cities: [],
              isApproximate: false,
            };
          }
        }
      } catch (err: any) {
        logger.warn(`Overpass query timed out or failed for ${stationCode}: ${err.message}`);
      }
    }

    return {
      center: { latitude: lat, longitude: lon },
      radiusKm: radius,
      rivers: [],
      lakes: [],
      mountains: [],
      bridges: [],
      tunnels: [],
      attractions: [],
      cities: [],
      isApproximate: true,
    };
  }

  private haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
}

export const overpassProvider = new OverpassProvider();
