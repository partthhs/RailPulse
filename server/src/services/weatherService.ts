import { WeatherInfo } from "@railpulse/types";
import { openWeatherProvider } from "../providers/weather/openWeatherProvider.js";
import { trainService } from "./trainService.js";

export class WeatherService {
  async getWeather(lat: number, lon: number, stationCode?: string): Promise<WeatherInfo | null> {
    return openWeatherProvider.getWeatherForStation(stationCode || "LOC", lat, lon);
  }

  async getJourneyWeather(trainNumber: string): Promise<{
    currentStation?: WeatherInfo;
    nextStation?: WeatherInfo;
    destination?: WeatherInfo;
  }> {
    const status = await trainService.getStatus(trainNumber);
    if (!status) return {};

    const result: {
      currentStation?: WeatherInfo;
      nextStation?: WeatherInfo;
      destination?: WeatherInfo;
    } = {};

    // Fetch weather concurrently for current, next, and destination stations
    const [currentW, nextW, destW] = await Promise.all([
      status.currentStation
        ? openWeatherProvider.getWeatherForStation(
            status.currentStation.stationCode,
            status.currentStation.latitude,
            status.currentStation.longitude
          )
        : Promise.resolve(null),
      status.nextStation
        ? openWeatherProvider.getWeatherForStation(
            status.nextStation.stationCode,
            status.nextStation.latitude,
            status.nextStation.longitude
          )
        : Promise.resolve(null),
      status.stations.length > 0
        ? openWeatherProvider.getWeatherForStation(
            status.stations[status.stations.length - 1].stationCode,
            status.stations[status.stations.length - 1].latitude,
            status.stations[status.stations.length - 1].longitude
          )
        : Promise.resolve(null),
    ]);

    if (currentW) result.currentStation = currentW;
    if (nextW) result.nextStation = nextW;
    if (destW) result.destination = destW;

    return result;
  }
}

export const weatherService = new WeatherService();
