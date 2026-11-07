import { WeatherInfo } from "@railpulse/types";
import { config } from "../../config/env.js";
import { logger } from "../../utils/logger.js";

// 10-minute cache per station (PRD §7.5)
const WEATHER_CACHE: Record<string, { data: WeatherInfo; timestamp: number }> = {};
const CACHE_TTL_MS = 10 * 60 * 1000;

// Map OpenWeather icon codes to our simplified icon names
function mapIcon(owIcon: string): string {
  if (owIcon.startsWith("01")) return "sun";
  if (owIcon.startsWith("02") || owIcon.startsWith("03")) return "sun-cloud";
  if (owIcon.startsWith("04")) return "cloud";
  if (owIcon.startsWith("09") || owIcon.startsWith("10")) return "rain";
  if (owIcon.startsWith("11")) return "storm";
  if (owIcon.startsWith("13")) return "snow";
  if (owIcon.startsWith("50")) return "fog";
  return "sun";
}

export class OpenWeatherProvider {
  /**
   * Get weather for a station using OpenWeather API with 10-minute local cache.
   * Returns null if API unavailable — callers should handle gracefully.
   */
  async getWeatherForStation(
    stationCode: string,
    lat: number,
    lon: number
  ): Promise<WeatherInfo | null> {
    const cacheKey = `${stationCode}_${lat.toFixed(2)}_${lon.toFixed(2)}`;
    const cached = WEATHER_CACHE[cacheKey];
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    if (!config.openWeatherApiKey) {
      logger.warn("OpenWeather API key not configured");
      return null;
    }

    try {
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${config.openWeatherApiKey}&units=metric`;
      const res = await fetch(url);

      if (res.ok) {
        const json: any = await res.json();
        const info: WeatherInfo = {
          stationCode,
          stationName: json.name || stationCode,
          latitude: lat,
          longitude: lon,
          temperature: Math.round(json.main?.temp ?? 25),
          feelsLike: Math.round(json.main?.feels_like ?? 25),
          humidity: json.main?.humidity ?? 50,
          windSpeed: Math.round((json.wind?.speed ?? 3) * 3.6), // m/s → km/h
          condition: json.weather?.[0]?.description
            ? json.weather[0].description.charAt(0).toUpperCase() +
              json.weather[0].description.slice(1)
            : json.weather?.[0]?.main || "Clear",
          icon: json.weather?.[0]?.icon ? mapIcon(json.weather[0].icon) : "sun",
          rainProbability: json.rain
            ? json.rain["1h"]
              ? Math.min(100, Math.round(json.rain["1h"] * 20))
              : 70
            : json.snow
            ? 0
            : 0,
          updatedAt: new Date().toISOString(),
        };

        WEATHER_CACHE[cacheKey] = { data: info, timestamp: Date.now() };
        return info;
      } else {
        const errBody = await res.text();
        logger.warn(
          `OpenWeather returned ${res.status} for ${stationCode} (${lat},${lon}): ${errBody.slice(0, 120)}`
        );
        return null;
      }
    } catch (err: any) {
      logger.error(`OpenWeather request failed for ${stationCode}: ${err.message}`);
      return null;
    }
  }
}

export const openWeatherProvider = new OpenWeatherProvider();
