// Domain Interfaces for RailPulse based on PRD §8

export type RunningStatusType = "ON_TIME" | "DELAYED" | "DATA_DELAYED" | "UNAVAILABLE";
export type FreshnessType = "FRESH" | "STALE" | "UNAVAILABLE";

export interface Station {
  id: string;
  stationCode: string;
  stationName: string;
  state?: string;
  latitude: number;
  longitude: number;
  scheduledArrival?: string;
  scheduledDeparture?: string;
  actualArrival?: string;
  actualDeparture?: string;
  estimatedArrival?: string;
  estimatedDeparture?: string;
  delayArrivalMinutes: number;
  delayDepartureMinutes: number;
  distanceFromSourceKm: number;
  dayCount: number;
  haltMinutes: number;
  platform?: string;
  hasDeparted: boolean;
  isCurrent?: boolean;
  isPassed?: boolean;
}

export interface Train {
  id: string;
  trainNumber: string;
  trainName: string;
  trainType: string;
  sourceStation: string;
  destinationStation: string;
  sourceStationCode: string;
  destinationStationCode: string;
  totalDistanceKm: number;
  totalDurationMinutes: number;
  runsOnDays: string[]; // e.g. ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]
  createdAt?: string;
  updatedAt?: string;
}

export interface TrainSearchResult {
  trainNumber: string;
  trainName: string;
  trainType: string;
  sourceStation: string;
  destinationStation: string;
  sourceStationCode: string;
  destinationStationCode: string;
  departureTime: string;
  arrivalTime: string;
  totalDuration: string;
  runsOn: string[];
}

export interface TrainStatus {
  trainNumber: string;
  trainName: string;
  trainType: string;
  sourceStation: string;
  destinationStation: string;
  currentStation?: Station;
  nextStation?: Station;
  latitude?: number;
  longitude?: number;
  bearing?: number; // heading in degrees
  speedKmH?: number;
  delayMinutes: number;
  distanceCoveredKm: number;
  distanceRemainingKm: number;
  totalDistanceKm: number;
  completionPercentage: number;
  status: RunningStatusType;
  freshness: FreshnessType;
  lastUpdated: string; // ISO string
  providerTimestamp: string;
  retrievedAt: string;
  stationsPassedCount: number;
  upcomingStationsCount: number;
  stations: Station[];
  isBetweenStations?: boolean;
  betweenStationsLabel?: string;
  lastDepartedStation?: Station;
  currentIntermediateStation?: string;
  currentIntermediateCode?: string;
}

export interface GeoCoordinate {
  longitude: number;
  latitude: number;
}

export interface RouteGeometry {
  type: "Feature";
  geometry: {
    type: "LineString";
    coordinates: [number, number][]; // [lon, lat]
  };
  properties: {
    trainNumber: string;
    isApproximate: boolean;
    totalDistanceKm: number;
  };
}

export interface JourneyRouteData {
  trainNumber: string;
  trainName: string;
  stations: Station[];
  routeGeometry: RouteGeometry;
  completedCoordinates: [number, number][];
  remainingCoordinates: [number, number][];
}

export interface ElevationPoint {
  distanceKm: number;
  elevationMeters: number;
  stationCode?: string;
  stationName?: string;
}

export interface DelayDataPoint {
  stationCode: string;
  stationName: string;
  scheduledArrival: string;
  actualArrival?: string;
  delayMinutes: number;
  distanceKm: number;
  isPassed: boolean;
}

export interface JourneyAnalytics {
  trainNumber: string;
  completionPercentage: number;
  distanceCoveredKm: number;
  distanceRemainingKm: number;
  totalDistanceKm: number;
  delayMinutes: number;
  highestElevationMeters: number | null;
  lowestElevationMeters: number | null;
  elevationVariationMeters: number | null;
  stationsPassedCount: number;
  upcomingStationsCount: number;
  delayHistory: DelayDataPoint[];
  elevationProfile: ElevationPoint[];
  lastUpdated: string;
}

export interface WeatherInfo {
  stationCode: string;
  stationName: string;
  latitude: number;
  longitude: number;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  icon: string;
  rainProbability?: number;
  updatedAt: string;
}

export interface GeoFeature {
  id: string;
  name: string;
  type: "river" | "lake" | "mountain" | "bridge" | "tunnel" | "attraction" | "settlement";
  distanceKm: number;
  description?: string;
  latitude: number;
  longitude: number;
}

export interface NearbyGeography {
  center: { latitude: number; longitude: number };
  radiusKm: number;
  rivers: GeoFeature[];
  lakes: GeoFeature[];
  mountains: GeoFeature[];
  bridges: GeoFeature[];
  tunnels: GeoFeature[];
  attractions: GeoFeature[];
  cities: GeoFeature[];
  isApproximate: boolean;
}

export interface SharedJourney {
  id: string;
  shareToken: string;
  trainNumber: string;
  trainName: string;
  sourceStation: string;
  destinationStation: string;
  createdAt: string;
  expiresAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  metadata?: {
    freshness: FreshnessType;
    provider: string;
    timestamp: string;
  };
}

// ==========================================
// Smart Journey Planner Domain Interfaces
// ==========================================

export type TravelClass = "1A" | "2A" | "3A" | "3E" | "SL" | "CC" | "EC" | "2S";
export type Quota = "GN" | "TQ" | "PT" | "LD" | "SS";

export interface StationOption {
  code: string;
  name: string;
  city?: string;
  state?: string;
}

export interface ClassFareInfo {
  classType: TravelClass;
  className: string;
  fare: number;
  availableSeats?: number;
  status: "AVAILABLE" | "RAC" | "WL" | "REGRET" | "NOT_APPLICABLE";
  statusText: string;
}

export interface BetweenTrainResult {
  trainNumber: string;
  trainName: string;
  trainType: string;
  fromStationCode: string;
  fromStationName: string;
  toStationCode: string;
  toStationName: string;
  departureTime: string; // HH:mm
  arrivalTime: string;   // HH:mm
  durationMinutes: number;
  durationFormatted: string;
  distanceKm: number;
  haltsCount: number;
  runsOnDays: string[]; // ["MON", "TUE", ...]
  runsToday: boolean;
  classes: ClassFareInfo[];
  lowestFare: number;
  reservationOpeningDate?: string; // ISO date
  daysUntilReservationOpens?: number;
}

export interface CalendarDaySummary {
  date: string; // YYYY-MM-DD
  dayNumber: number;
  dayOfWeek: string; // "MON", "TUE", etc.
  trainCount: number;
  lowestFare: number | null;
  indicator: "green" | "yellow" | "red" | "grey";
  isPast: boolean;
  trains?: BetweenTrainResult[];
}

export interface FareComparisonItem {
  trainNumber: string;
  trainName: string;
  trainType: string;
  departureTime: string;
  arrivalTime: string;
  durationFormatted: string;
  durationMinutes: number;
  haltsCount: number;
  travelClass: TravelClass;
  fare: number;
  availableSeats?: number;
  statusText: string;
  score: number;
  isBestValue: boolean;
  recommendationReason?: string;
}

export interface WatchedTrain {
  id: string;
  trainNumber: string;
  trainName: string;
  journeyDate: string; // YYYY-MM-DD
  sourceStation: string;
  sourceStationCode: string;
  destinationStation: string;
  destinationStationCode: string;
  boardingStation: string;
  boardingStationCode: string;
  bookingStatus: "UPCOMING" | "OPEN" | "CLOSED" | "WAITLIST" | "UNKNOWN";
  reservationOpeningDate?: string;
  notifyApproaching: boolean;
  notifyBookingOpening: boolean;
  notifyDelay: boolean;
  notifyPlatform: boolean;
  createdAt: string;
}

export interface FareAlert {
  id: string;
  trainNumber: string;
  trainName: string;
  sourceStation: string;
  destinationStation: string;
  journeyDate: string;
  travelClass: TravelClass;
  targetFare: number;
  currentFare: number;
  previousFare: number;
  status: "MONITORING" | "TARGET_REACHED" | "PRICE_INCREASED";
  isActive: boolean;
  lastCheckedAt: string;
  createdAt: string;
}

export interface FareHistoryItem {
  id: string;
  trainNumber: string;
  journeyDate: string;
  travelClass: TravelClass;
  fare: number;
  recordedAt: string;
}

export type NotificationType =
  | "APPROACHING"
  | "BOOKING_OPENING"
  | "DELAY"
  | "PLATFORM"
  | "FARE_REACHED";

export interface SmartNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  relatedTrainNumber: string;
  relatedTrainName?: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

