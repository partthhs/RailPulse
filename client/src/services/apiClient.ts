import {
  TrainSearchResult,
  TrainStatus,
  JourneyRouteData,
  JourneyAnalytics,
  WeatherInfo,
  NearbyGeography,
  ApiResponse,
} from "@railpulse/types";

const BASE_URL = "/api/v1";

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  const body: ApiResponse<T> = await res.json();
  if (!res.ok || !body.success) {
    throw new Error(body.error?.message || `Request failed with status ${res.status}`);
  }

  return body.data as T;
}

export const apiClient = {
  async searchTrains(query: string): Promise<TrainSearchResult[]> {
    if (!query.trim()) return [];
    return fetchJson<TrainSearchResult[]>(`/trains/search?q=${encodeURIComponent(query.trim())}`);
  },

  async getTrainStatus(trainNumber: string): Promise<TrainStatus> {
    return fetchJson<TrainStatus>(`/trains/${encodeURIComponent(trainNumber)}/status`);
  },

  async getTrainRoute(trainNumber: string): Promise<JourneyRouteData> {
    return fetchJson<JourneyRouteData>(`/trains/${encodeURIComponent(trainNumber)}/route`);
  },

  async getTrainAnalytics(trainNumber: string): Promise<JourneyAnalytics> {
    return fetchJson<JourneyAnalytics>(`/trains/${encodeURIComponent(trainNumber)}/analytics`);
  },

  async getJourneyWeather(trainNumber: string): Promise<{
    currentStation?: WeatherInfo;
    nextStation?: WeatherInfo;
    destination?: WeatherInfo;
  }> {
    return fetchJson<{
      currentStation?: WeatherInfo;
      nextStation?: WeatherInfo;
      destination?: WeatherInfo;
    }>(`/weather/train/${encodeURIComponent(trainNumber)}`);
  },

  async getTrainNearby(trainNumber: string): Promise<NearbyGeography> {
    return fetchJson<NearbyGeography>(`/geography/train/${encodeURIComponent(trainNumber)}/nearby`);
  },

  async createShareLink(trainNumber: string): Promise<{ shareId: string; shareUrl: string }> {
    return fetchJson<{ shareId: string; shareUrl: string }>(`/journeys/share`, {
      method: "POST",
      body: JSON.stringify({ trainNumber }),
    });
  },

  async getSharedJourney(token: string): Promise<{
    token: string;
    trainNumber: string;
    status: TrainStatus;
    createdAt: string;
  }> {
    return fetchJson<{
      token: string;
      trainNumber: string;
      status: TrainStatus;
      createdAt: string;
    }>(`/journeys/share/${encodeURIComponent(token)}`);
  },

  // --- Smart Journey Planner Endpoints ---

  async searchPlannerStations(query: string) {
    return fetchJson<import("@railpulse/types").StationOption[]>(
      `/planner/stations?q=${encodeURIComponent(query)}`
    );
  },

  async getTrainsBetween(params: {
    from: string;
    to: string;
    date?: string;
    class?: import("@railpulse/types").TravelClass;
    quota?: import("@railpulse/types").Quota;
  }) {
    const q = new URLSearchParams({
      from: params.from,
      to: params.to,
      ...(params.date && { date: params.date }),
      ...(params.class && { class: params.class }),
      ...(params.quota && { quota: params.quota }),
    });
    return fetchJson<import("@railpulse/types").BetweenTrainResult[]>(`/planner/between?${q}`);
  },

  async getMonthlyCalendar(params: {
    from: string;
    to: string;
    year: number;
    month: number;
    class?: import("@railpulse/types").TravelClass;
  }) {
    const q = new URLSearchParams({
      from: params.from,
      to: params.to,
      year: String(params.year),
      month: String(params.month),
      ...(params.class && { class: params.class }),
    });
    return fetchJson<{
      from: string;
      to: string;
      year: number;
      month: number;
      days: import("@railpulse/types").CalendarDaySummary[];
    }>(`/planner/calendar?${q}`);
  },

  async compareFares(params: {
    from: string;
    to: string;
    date: string;
    class: import("@railpulse/types").TravelClass;
    quota?: import("@railpulse/types").Quota;
    sortBy?: string;
  }) {
    const q = new URLSearchParams({
      from: params.from,
      to: params.to,
      date: params.date,
      class: params.class,
      ...(params.quota && { quota: params.quota }),
      ...(params.sortBy && { sortBy: params.sortBy }),
    });
    return fetchJson<{
      items: import("@railpulse/types").FareComparisonItem[];
      bestValueTrain: import("@railpulse/types").FareComparisonItem | null;
    }>(`/planner/fares/compare?${q}`);
  },

  async getWatchlist() {
    return fetchJson<import("@railpulse/types").WatchedTrain[]>(`/planner/watchlist`);
  },

  async addToWatchlist(item: Omit<import("@railpulse/types").WatchedTrain, "id" | "createdAt">) {
    return fetchJson<import("@railpulse/types").WatchedTrain>(`/planner/watchlist`, {
      method: "POST",
      body: JSON.stringify(item),
    });
  },

  async removeFromWatchlist(id: string) {
    return fetchJson<{ success: boolean }>(`/planner/watchlist/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },

  async getFareAlerts() {
    return fetchJson<import("@railpulse/types").FareAlert[]>(`/planner/fare-watch`);
  },

  async addFareAlert(item: any) {
    return fetchJson<import("@railpulse/types").FareAlert>(`/planner/fare-watch`, {
      method: "POST",
      body: JSON.stringify(item),
    });
  },

  async removeFareAlert(id: string) {
    return fetchJson<{ success: boolean }>(`/planner/fare-watch/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  },

  async getNotifications() {
    return fetchJson<import("@railpulse/types").SmartNotification[]>(`/planner/notifications`);
  },

  async markNotificationRead(id: string) {
    return fetchJson<{ success: boolean }>(
      `/planner/notifications/${encodeURIComponent(id)}/read`,
      { method: "PATCH" }
    );
  },

  async clearNotifications() {
    return fetchJson<{ success: boolean }>(`/planner/notifications`, {
      method: "DELETE",
    });
  },
};
